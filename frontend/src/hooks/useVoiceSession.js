import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';

/**
 * Custom hook for managing a real-time voice session
 * with the AI Mentoring WebSocket proxy.
 *
 * Handles: mic capture, screen share, WebSocket messaging,
 * audio playback, and session lifecycle.
 */

const AUDIO_SAMPLE_RATE = 16000;  // What we send to Gemini
const PLAYBACK_SAMPLE_RATE = 24000;  // What Gemini sends back
const PLAYBACK_GAIN = 2.0;
const MAX_AUDIO_QUEUE_CHUNKS = 20;
const MAX_SCHEDULED_CHUNKS = 3;
const SCREENSHOT_INTERVAL_MS = 12000;
const RECONNECT_MAX_ATTEMPTS = 4;
const RECONNECT_BASE_DELAY_MS = 1200;
const VAD_START_THRESHOLD = 0.08;
const VAD_BARGE_IN_THRESHOLD = 0.26;
const VAD_BARGE_IN_MIN_FRAMES = 5;
const VAD_SILENCE_MS = 700;
// const CHUNK_SIZE removed - unused

// AudioWorklet processor — runs in a separate audio thread (no deprecation warning)
const PCM16_WORKLET_CODE = `
class PCM16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
  }
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) this._buf.push(ch[i]);
    // Flush every ~50 ms worth of samples at 16 kHz = 800 samples (lower latency)
    while (this._buf.length >= 800) {
      const slice = this._buf.splice(0, 800);
      const pcm = new Int16Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        const s = Math.max(-1, Math.min(1, slice[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage({ pcm: pcm.buffer }, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm16-processor', PCM16Processor);
`;

export function useVoiceSession() {
    const [status, setStatus] = useState('idle'); // idle | connecting | ready | active | error
    const [error, setError] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);

    const wsRef = useRef(null);
    const micStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const workletNodeRef = useRef(null);
    const workletBlobUrlRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const playbackCtxRef = useRef(null);
    const playbackInputNodeRef = useRef(null);
    const playbackCompressorRef = useRef(null);
    const playbackGainRef = useRef(null);
    const playbackCursorRef = useRef(0);
    const scheduledChunksRef = useRef(0);
    const activeSourcesRef = useRef(new Set());
    const screenIntervalRef = useRef(null);
    const isCapturingFrameRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const inUtteranceRef = useRef(false);
    const statusRef = useRef(status);
    const reconnectTimerRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const manualDisconnectRef = useRef(false);
    const lastConnectConfigRef = useRef(null);
    const bargeInFramesRef = useRef(0);

    // ── Cleanup ──
    const cleanup = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        setIsReconnecting(false);

        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        inUtteranceRef.current = false;
        bargeInFramesRef.current = 0;

        // Stop screen capture interval
        if (screenIntervalRef.current) {
            clearInterval(screenIntervalRef.current);
            screenIntervalRef.current = null;
        }

        // Stop animation frame
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        // Stop mic
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
        }

        // Close audio contexts
        activeSourcesRef.current.forEach((source) => {
            try {
                source.stop();
            } catch (_) {
                // ignore stale source stop errors
            }
        });
        activeSourcesRef.current.clear();

        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
        audioContextRef.current = null;

        if (playbackCtxRef.current?.state !== 'closed') {
            playbackCtxRef.current?.close();
        }
        playbackCtxRef.current = null;
        playbackInputNodeRef.current = null;
        playbackCompressorRef.current = null;
        playbackGainRef.current = null;

        // Close WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'end' }));
            wsRef.current.close();
        }
        wsRef.current = null;

        // Revoke worklet blob URL
        if (workletBlobUrlRef.current) {
            URL.revokeObjectURL(workletBlobUrlRef.current);
            workletBlobUrlRef.current = null;
        }

        audioQueueRef.current = [];
        isPlayingRef.current = false;
        playbackCursorRef.current = 0;
        scheduledChunksRef.current = 0;
        isCapturingFrameRef.current = false;
        isSpeakingRef.current = false;
        setIsCapturing(false);
        setAudioLevel(0);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const sendWsMessage = useCallback((payload) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;
        try {
            ws.send(JSON.stringify(payload));
            return true;
        } catch (err) {
            console.warn('WebSocket send failed:', err);
            return false;
        }
    }, []);

    const interruptPlayback = useCallback(() => {
        activeSourcesRef.current.forEach((source) => {
            try {
                source.stop(0);
            } catch (_) {
                // ignore
            }
        });
        activeSourcesRef.current.clear();
        audioQueueRef.current = [];
        scheduledChunksRef.current = 0;
        isPlayingRef.current = false;
        isSpeakingRef.current = false;
        setIsSpeaking(false);
    }, []);

    // ── Audio playback (queued with scheduler to avoid blocky/gappy playback) ──
    const scheduleAudioPlayback = useCallback(() => {
        try {
            if (audioQueueRef.current.length === 0) {
                if (scheduledChunksRef.current === 0) {
                    isPlayingRef.current = false;
                    isSpeakingRef.current = false;
                    setIsSpeaking(false);
                }
                return;
            }

            if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
                playbackCtxRef.current = new AudioContext({
                    sampleRate: PLAYBACK_SAMPLE_RATE,
                    latencyHint: 'interactive',
                });
                playbackCompressorRef.current = playbackCtxRef.current.createDynamicsCompressor();
                playbackCompressorRef.current.threshold.value = -18;
                playbackCompressorRef.current.knee.value = 14;
                playbackCompressorRef.current.ratio.value = 3;
                playbackCompressorRef.current.attack.value = 0.003;
                playbackCompressorRef.current.release.value = 0.2;

                playbackGainRef.current = playbackCtxRef.current.createGain();
                playbackGainRef.current.gain.value = PLAYBACK_GAIN;

                playbackCompressorRef.current.connect(playbackGainRef.current);
                playbackGainRef.current.connect(playbackCtxRef.current.destination);
                playbackInputNodeRef.current = playbackCompressorRef.current;
                playbackCursorRef.current = playbackCtxRef.current.currentTime + 0.04;
            }

            const ctx = playbackCtxRef.current;
            if (ctx.state === 'suspended') {
                // Browsers can keep playback contexts suspended until resumed explicitly.
                ctx.resume().catch((resumeErr) => {
                    console.warn('Playback context resume failed:', resumeErr);
                });
            }

            while (
                audioQueueRef.current.length > 0 &&
                scheduledChunksRef.current < MAX_SCHEDULED_CHUNKS
            ) {
                const base64Data = audioQueueRef.current.shift();
                const binaryStr = atob(base64Data);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }

                const int16 = new Int16Array(bytes.buffer);
                const resampleRatio = PLAYBACK_SAMPLE_RATE / 24000;
                const resampled = new Float32Array(Math.floor(int16.length * resampleRatio));
                for (let i = 0; i < resampled.length; i++) {
                    const srcIdx = i / resampleRatio;
                    const srcIdxInt = Math.floor(srcIdx);
                    const frac = srcIdx - srcIdxInt;
                    const s0 = int16[srcIdxInt] / 32768;
                    const s1 = (srcIdxInt + 1 < int16.length) ? int16[srcIdxInt + 1] / 32768 : 0;
                    resampled[i] = s0 * (1 - frac) + s1 * frac;
                }

                const buffer = ctx.createBuffer(1, resampled.length, PLAYBACK_SAMPLE_RATE);
                buffer.getChannelData(0).set(resampled);

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(playbackInputNodeRef.current || ctx.destination);
                activeSourcesRef.current.add(source);

                const startAt = Math.max(playbackCursorRef.current, ctx.currentTime + 0.02);
                playbackCursorRef.current = startAt + buffer.duration;

                if (!isPlayingRef.current) {
                    isPlayingRef.current = true;
                    isSpeakingRef.current = true;
                    setIsSpeaking(true);
                }

                scheduledChunksRef.current += 1;
                source.onended = () => {
                    activeSourcesRef.current.delete(source);
                    scheduledChunksRef.current = Math.max(0, scheduledChunksRef.current - 1);
                    if (audioQueueRef.current.length > 0) {
                        scheduleAudioPlayback();
                    } else if (scheduledChunksRef.current === 0) {
                        isPlayingRef.current = false;
                        isSpeakingRef.current = false;
                        setIsSpeaking(false);
                    }
                };

                source.start(startAt);
            }
        } catch (err) {
            console.error('Audio playback scheduler error:', err);
            isPlayingRef.current = false;
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        }
    }, []);

    // ── Mic level monitoring ──
    const startLevelMonitor = useCallback((analyser) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const startSilenceTimer = () => {
            if (silenceTimerRef.current) return;
            silenceTimerRef.current = setTimeout(() => {
                silenceTimerRef.current = null;
                if (!inUtteranceRef.current) return;
                inUtteranceRef.current = false;
                sendWsMessage({ type: 'turnComplete' });
            }, VAD_SILENCE_MS);
        };
        const update = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const level = Math.min(avg / 128, 1);
            setAudioLevel(level);

            if (statusRef.current === 'active' && wsRef.current?.readyState === WebSocket.OPEN) {
                if (isSpeakingRef.current) {
                    // Require sustained, stronger input before interrupting AI speech.
                    if (level > VAD_BARGE_IN_THRESHOLD) {
                        bargeInFramesRef.current += 1;
                        if (bargeInFramesRef.current >= VAD_BARGE_IN_MIN_FRAMES) {
                            interruptPlayback();
                            inUtteranceRef.current = true;
                            bargeInFramesRef.current = 0;
                            if (silenceTimerRef.current) {
                                clearTimeout(silenceTimerRef.current);
                                silenceTimerRef.current = null;
                            }
                        }
                    } else {
                        bargeInFramesRef.current = 0;
                    }
                } else if (level > VAD_START_THRESHOLD) {
                    inUtteranceRef.current = true;
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                } else if (inUtteranceRef.current) {
                    startSilenceTimer();
                }
            }
            animFrameRef.current = requestAnimationFrame(update);
        };
        update();
    }, [interruptPlayback, sendWsMessage]);

    // ── App screen capture (html2canvas — captures only Planora, no permission dialog) ──
    const startAppCapture = useCallback(() => {
        if (screenIntervalRef.current) return; // already running

        const doCapture = async () => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (isCapturingFrameRef.current) return;
            if (wsRef.current.bufferedAmount > 256 * 1024) return; // avoid socket congestion
            if (inUtteranceRef.current || isSpeakingRef.current) return; // prioritize audio round trip

            isCapturingFrameRef.current = true;
            try {
                const target = document.getElementById('root') || document.body;
                const canvas = await html2canvas(target, {
                    scale: 0.35,          // lower resolution to reduce CPU/network spikes
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    ignoreElements: (el) => {
                        // Skip the voice panel overlay itself so AI sees the page behind it
                        return el.getAttribute?.('data-voice-overlay') === 'true';
                    },
                });
                const base64 = canvas.toDataURL('image/jpeg', 0.45).split(',')[1];
                if (base64 && base64.length > 200) {
                    sendWsMessage({
                        type: 'screenshot',
                        data: base64,
                        mimeType: 'image/jpeg',
                    });
                }
            } catch (err) {
                console.warn('App capture error:', err);
            } finally {
                isCapturingFrameRef.current = false;
            }
        };

        setIsCapturing(true);
        doCapture(); // immediate first capture
        screenIntervalRef.current = setInterval(doCapture, SCREENSHOT_INTERVAL_MS);
    }, [sendWsMessage]);

    // ── Connect & Start ──
    const connect = useCallback(async (config, isReconnect = false) => {
        const {
            wsUrl,
            contextSource,
            studentGoal,
            sessionMemory,
            voiceName,
            onboardingContext,
            initialPrompt,
        } = config || {};
        lastConnectConfigRef.current = {
            wsUrl,
            contextSource,
            studentGoal,
            sessionMemory,
            voiceName,
            onboardingContext,
            initialPrompt,
        };
        if (!isReconnect) {
            reconnectAttemptsRef.current = 0;
            setIsReconnecting(false);
        }
        manualDisconnectRef.current = false;

        cleanup();
        setStatus('connecting');
        setError('');
        if (!isReconnect) {
            setTranscript('');
        }

        try {
            // 1. Get microphone with aggressive noise reduction
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: { ideal: AUDIO_SAMPLE_RATE },
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,  // Disable AGC for better control
                    latency: 0.01,  // Minimize latency
                },
            });
            micStreamRef.current = micStream;

            // 2. Set up AudioContext for mic capture
            const audioCtx = new AudioContext({
                sampleRate: AUDIO_SAMPLE_RATE,
                latencyHint: 'interactive',
            });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(micStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            source.connect(analyser);

            // AudioWorklet for PCM capture (replaces deprecated ScriptProcessorNode)
            const blob = new Blob([PCM16_WORKLET_CODE], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            workletBlobUrlRef.current = blobUrl;
            await audioCtx.audioWorklet.addModule(blobUrl);

            const workletNode = new AudioWorkletNode(audioCtx, 'pcm16-processor');
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (evt) => {
                const bytes = new Uint8Array(evt.data.pcm);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                sendWsMessage({ type: 'audio', data: btoa(binary) });
            };

            source.connect(workletNode);
            // AudioWorkletNode does not need to connect to destination to process audio

            startLevelMonitor(analyser);

            // 3. Connect WebSocket
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                reconnectAttemptsRef.current = 0;
                setIsReconnecting(false);
                // Send setup message
                sendWsMessage({
                    contextSource: contextSource || 'general',
                    studentGoal: studentGoal || '',
                    sessionMemory: sessionMemory || [],
                    voiceName: voiceName || 'Aoede',
                    onboardingContext: onboardingContext || {},
                    initialPrompt: initialPrompt || '',
                });
            };

            ws.onmessage = (event) => {
                let data = null;
                try {
                    data = JSON.parse(event.data);
                } catch (err) {
                    console.warn('Received non-JSON websocket message', err);
                    return;
                }

                switch (data.type) {
                    case 'ready':
                        setStatus('active');
                        // Start capturing the Planora app automatically — no permission dialog
                        startAppCapture();
                        break;

                    case 'audio':
                        // Keep queue bounded to avoid latency buildup under bursty network conditions
                        if (audioQueueRef.current.length >= MAX_AUDIO_QUEUE_CHUNKS) {
                            const overflow = audioQueueRef.current.length - MAX_AUDIO_QUEUE_CHUNKS + 1;
                            audioQueueRef.current.splice(0, overflow);
                        }
                        audioQueueRef.current.push(data.data);
                        scheduleAudioPlayback();
                        break;

                    case 'transcript':
                        setTranscript(prev => prev + (prev ? ' ' : '') + data.text);
                        break;

                    case 'turnComplete':
                        // AI finished speaking
                        break;

                    case 'error':
                        console.error('Voice session error:', data.message);
                        // Non-fatal errors (AI service warnings) - show but don't disconnect
                        if (data.message?.includes('AI service error')) {
                            setError(data.message);
                            // Clear non-fatal error after 5s so user can continue
                            setTimeout(() => setError(''), 5000);
                        } else {
                            setError(data.message || 'An error occurred');
                            setStatus('error');
                        }
                        break;

                    default:
                        break;
                }
            };

            ws.onerror = () => {
                setError('WebSocket connection error. Trying to recover...');
            };

            ws.onclose = () => {
                const shouldRetry = (
                    !manualDisconnectRef.current &&
                    reconnectAttemptsRef.current < RECONNECT_MAX_ATTEMPTS &&
                    lastConnectConfigRef.current
                );

                if (shouldRetry) {
                    const delay = RECONNECT_BASE_DELAY_MS * (2 ** reconnectAttemptsRef.current);
                    reconnectAttemptsRef.current += 1;
                    setIsReconnecting(true);
                    setStatus('connecting');
                    reconnectTimerRef.current = setTimeout(() => {
                        connect(lastConnectConfigRef.current, true);
                    }, delay);
                } else {
                    setIsReconnecting(false);
                    setStatus('idle');
                }
            };

        } catch (err) {
            console.error('Voice session connection error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone access was denied. Please allow mic access and try again.');
            } else {
                setError(err.message || 'Failed to start voice session.');
            }
            setStatus('error');
            cleanup();
        }
    }, [cleanup, scheduleAudioPlayback, sendWsMessage, startLevelMonitor, startAppCapture]);



    const stopAppCapture = useCallback(() => {
        if (screenIntervalRef.current) {
            clearInterval(screenIntervalRef.current);
            screenIntervalRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    // ── Disconnect ──
    const disconnect = useCallback(() => {
        manualDisconnectRef.current = true;
        cleanup();
        setStatus('idle');
        setTranscript('');
    }, [cleanup]);

    return {
        status,
        error,
        transcript,
        isSpeaking,
        isCapturing,
        isReconnecting,
        audioLevel,
        connect,
        disconnect,
        stopAppCapture,
    };
}
