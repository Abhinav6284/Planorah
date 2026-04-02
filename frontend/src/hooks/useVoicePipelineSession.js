import { useCallback, useEffect, useRef, useState } from 'react';
import { assistantPipelineService } from '../api/assistantPipelineService';
import { buildFrontendAssistantContext } from '../utils/assistantContext';

const base64ToBlob = (base64, mimeType = 'audio/wav') => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

export function useVoicePipelineSession() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [actionProposals, setActionProposals] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const configRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const playbackRef = useRef(null);

  const stopLevelMonitor = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => null);
    }
    audioCtxRef.current = null;
    setAudioLevel(0);
  }, []);

  const cleanupMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setIsCapturing(false);
    stopLevelMonitor();
  }, [stopLevelMonitor]);

  useEffect(() => () => cleanupMedia(), [cleanupMedia]);

  const playTtsAudio = useCallback(async (tts) => {
    if (!tts?.audio_base64) return;
    try {
      const blob = base64ToBlob(tts.audio_base64, tts.mime_type || 'audio/wav');
      const objectUrl = URL.createObjectURL(blob);
      if (playbackRef.current) {
        playbackRef.current.pause();
      }
      const audio = new Audio(objectUrl);
      playbackRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(objectUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(objectUrl);
      };
      await audio.play();
    } catch (playErr) {
      setIsSpeaking(false);
      console.error('Pipeline TTS playback failed', playErr);
    }
  }, []);

  const handleTurnResponse = useCallback(async (response) => {
    setLatestResult(response);
    setActionProposals(Array.isArray(response?.action_proposals) ? response.action_proposals : []);
    if (response?.conversation_id) {
      setConversationId(response.conversation_id);
    }
    const nextTranscript = String(response?.transcript || '').trim();
    if (nextTranscript) {
      setTranscript(nextTranscript);
    }
    if (response?.tts) {
      await playTtsAudio(response.tts);
    }
  }, [playTtsAudio]);

  const connect = useCallback(async (config = {}) => {
    configRef.current = config || {};
    setError('');
    setStatus('active');
    const initialPrompt = String(config?.initialPrompt || '').trim();
    if (initialPrompt) {
      try {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        const response = await assistantPipelineService.sendTextTurn({
          message: initialPrompt,
          contextSource: config?.contextSource || 'general',
          frontendContext: buildFrontendAssistantContext({
            pathname,
            visiblePanel: 'voice_auto_intro',
            metadata: { channel: 'voice' },
          }),
          conversationId,
          languagePreference: config?.languagePreference || 'hinglish',
        });
        await handleTurnResponse(response);
      } catch (introErr) {
        console.error('Pipeline auto intro failed', introErr);
      }
    }
  }, [conversationId, handleTurnResponse]);

  const disconnect = useCallback(() => {
    cleanupMedia();
    setStatus('idle');
    setTranscript('');
    setActionProposals([]);
    setLatestResult(null);
  }, [cleanupMedia]);

  const startLevelMonitor = useCallback((stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
        setAudioLevel(Math.min(1, avg / 128));
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (_err) {
      setAudioLevel(0);
    }
  }, []);

  const startTurn = useCallback(async () => {
    if (status !== 'active') return;
    setError('');
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      startLevelMonitor(stream);
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.start(150);
    } catch (startErr) {
      console.error(startErr);
      setError('Microphone access denied or unavailable.');
      setIsCapturing(false);
      setStatus('error');
    }
  }, [startLevelMonitor, status]);

  const stopTurn = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      cleanupMedia();
      return;
    }

    const recorderStopped = new Promise((resolve) => {
      recorder.onstop = resolve;
    });
    recorder.stop();
    await recorderStopped;

    const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    cleanupMedia();
    setStatus('processing');

    try {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const frontendContext = buildFrontendAssistantContext({
        pathname,
        visiblePanel: 'voice',
        metadata: {
          channel: 'voice',
          captured_at: new Date().toISOString(),
        },
      });

      const response = await assistantPipelineService.sendVoiceTurn({
        audioBlob,
        contextSource: configRef.current?.contextSource || frontendContext.context_source || 'general',
        frontendContext,
        conversationId,
        languagePreference: configRef.current?.languagePreference || 'hinglish',
        voiceName: configRef.current?.voiceName || '',
      });
      await handleTurnResponse(response);
      setStatus('active');
    } catch (turnErr) {
      console.error(turnErr);
      setError(turnErr?.response?.data?.error || 'Failed to process voice turn.');
      setStatus('error');
    }
  }, [cleanupMedia, conversationId, handleTurnResponse]);

  const confirmProposal = useCallback(async (proposalId, confirmed) => {
    if (!conversationId || !proposalId) return null;
    try {
      const payload = await assistantPipelineService.confirmAction({
        conversationId,
        proposalId,
        confirmed,
        idempotencyKey: `${conversationId}:${proposalId}:${confirmed ? 'yes' : 'no'}`,
      });
      if (payload?.assistant_text) {
        setLatestResult((prev) => ({
          ...(prev || {}),
          assistant_text: payload.assistant_text,
        }));
      }
      setActionProposals((prev) =>
        prev.filter((proposal) => proposal.proposal_id !== proposalId)
      );
      if (payload?.job_id) {
        const poll = async () => {
          try {
            const job = await assistantPipelineService.getJobStatus(payload.job_id);
            if (job.status === 'queued' || job.status === 'running') {
              setTimeout(poll, 2000);
              return;
            }
            setLatestResult((prev) => ({
              ...(prev || {}),
              job_result: job,
            }));
          } catch (pollErr) {
            console.error('Failed polling assistant job', pollErr);
          }
        };
        setTimeout(poll, 1500);
      }
      return payload;
    } catch (confirmErr) {
      setError(confirmErr?.response?.data?.error || 'Unable to confirm action.');
      return null;
    }
  }, [conversationId]);

  return {
    status,
    error,
    transcript,
    isSpeaking,
    isCapturing,
    isReconnecting: false,
    audioLevel,
    latestResult,
    actionProposals,
    conversationId,
    connect,
    disconnect,
    startTurn,
    stopTurn,
    confirmProposal,
  };
}
