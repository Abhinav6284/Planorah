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
    // Flush every ~250 ms worth of samples at 16 kHz = 4000 samples
    while (this._buf.length >= 4000) {
      const slice = this._buf.splice(0, 4000);
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

    const wsRef = useRef(null);
    const micStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const workletNodeRef = useRef(null);
    const workletBlobUrlRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const playbackCtxRef = useRef(null);
    const screenIntervalRef = useRef(null);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);

    // ── Cleanup ──
    const cleanup = useCallback(() => {
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
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
        audioContextRef.current = null;

        if (playbackCtxRef.current?.state !== 'closed') {
            playbackCtxRef.current?.close();
        }
        playbackCtxRef.current = null;

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
        setIsCapturing(false);
        setAudioLevel(0);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // ── Audio playback (queued) ──
    const playNextChunk = useCallback(() => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) {
            if (audioQueueRef.current.length === 0) {
                setIsSpeaking(false);
            }
            return;
        }

        isPlayingRef.current = true;
        setIsSpeaking(true);

        const base64Data = audioQueueRef.current.shift();
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        // Convert Int16 PCM to Float32
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768;
        }

        if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
            playbackCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
        }

        const ctx = playbackCtxRef.current;
        const buffer = ctx.createBuffer(1, float32.length, PLAYBACK_SAMPLE_RATE);
        buffer.getChannelData(0).set(float32);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => {
            isPlayingRef.current = false;
            playNextChunk();
        };
        source.start();
    }, []);

    // ── Mic level monitoring ──
    const startLevelMonitor = useCallback((analyser) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const update = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(Math.min(avg / 128, 1));
            animFrameRef.current = requestAnimationFrame(update);
        };
        update();
    }, []);

    // ── Connect & Start ──
    const connect = useCallback(async ({ wsUrl, contextSource, studentGoal, sessionMemory, voiceName }) => {
        cleanup();
        setStatus('connecting');
        setError('');
        setTranscript('');

        try {
            // 1. Get microphone
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: AUDIO_SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            micStreamRef.current = micStream;

            // 2. Set up AudioContext for mic capture
            const audioCtx = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
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
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                const bytes = new Uint8Array(evt.data.pcm);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                wsRef.current.send(JSON.stringify({ type: 'audio', data: btoa(binary) }));
            };

            source.connect(workletNode);
            // AudioWorkletNode does not need to connect to destination to process audio

            startLevelMonitor(analyser);

            // 3. Connect WebSocket
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                // Send setup message
                ws.send(JSON.stringify({
                    contextSource: contextSource || 'general',
                    studentGoal: studentGoal || '',
                    sessionMemory: sessionMemory || [],
                    voiceName: voiceName || 'Aoede',
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'ready':
                        setStatus('active');
                        // Start capturing the Planora app automatically — no permission dialog
                        startAppCapture();
                        break;

                    case 'audio':
                        audioQueueRef.current.push(data.data);
                        playNextChunk();
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
                setError('WebSocket connection error. Is the voice proxy running?');
                setStatus('error');
            };

            ws.onclose = () => {
                if (status !== 'error') {
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
    }, [cleanup, playNextChunk, startLevelMonitor, status]);

    // ── App screen capture (html2canvas — captures only Planora, no permission dialog) ──
    const startAppCapture = useCallback(() => {
        if (screenIntervalRef.current) return; // already running

        const doCapture = async () => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            try {
                const target = document.getElementById('root') || document.body;
                const canvas = await html2canvas(target, {
                    scale: 0.5,           // half resolution — good enough for AI context
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    ignoreElements: (el) => {
                        // Skip the voice panel overlay itself so AI sees the page behind it
                        return el.getAttribute?.('data-voice-overlay') === 'true';
                    },
                });
                const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                if (base64 && base64.length > 200) {
                    wsRef.current.send(JSON.stringify({
                        type: 'screenshot',
                        data: base64,
                        mimeType: 'image/jpeg',
                    }));
                }
            } catch (err) {
                console.warn('App capture error:', err);
            }
        };

        setIsCapturing(true);
        doCapture(); // immediate first capture
        screenIntervalRef.current = setInterval(doCapture, 4000);
    }, []);

    const stopAppCapture = useCallback(() => {
        if (screenIntervalRef.current) {
            clearInterval(screenIntervalRef.current);
            screenIntervalRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    // ── Disconnect ──
    const disconnect = useCallback(() => {
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
        audioLevel,
        connect,
        disconnect,
        stopAppCapture,
    };
}
