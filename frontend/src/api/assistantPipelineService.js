import api from '../api';

const toJson = (value, fallback = {}) => {
  if (!value || typeof value !== 'object') {
    return fallback;
  }
  return value;
};

export const assistantPipelineService = {
  getConfig: async () => {
    const response = await api.get('assistant/v2/config/');
    return response.data;
  },

  sendTextTurn: async ({
    message,
    contextSource = 'assistant',
    frontendContext = {},
    conversationId = null,
    languagePreference = 'hinglish',
  }) => {
    const payload = {
      channel: 'text',
      message: String(message || '').trim(),
      context_source: contextSource,
      frontend_context: toJson(frontendContext),
      language_preference: languagePreference,
    };
    if (conversationId) payload.conversation_id = conversationId;
    const response = await api.post('assistant/v2/turn/', payload);
    return response.data;
  },

  sendVoiceTurn: async ({
    audioBlob,
    contextSource = 'assistant',
    frontendContext = {},
    conversationId = null,
    languagePreference = 'hinglish',
    voiceName = '',
  }) => {
    const formData = new FormData();
    formData.append('channel', 'voice');
    formData.append('context_source', contextSource);
    formData.append('frontend_context', JSON.stringify(toJson(frontendContext)));
    formData.append('language_preference', languagePreference);
    if (conversationId) formData.append('conversation_id', conversationId);
    if (voiceName) formData.append('voice_name', voiceName);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'turn.webm');
    }

    const response = await api.post('assistant/v2/turn/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
    return response.data;
  },

  confirmAction: async ({ conversationId, proposalId, confirmed, idempotencyKey = '' }) => {
    const payload = {
      conversation_id: conversationId,
      proposal_id: proposalId,
      confirmed: !!confirmed,
      idempotency_key: idempotencyKey,
    };
    const response = await api.post('assistant/v2/action/confirm/', payload);
    return response.data;
  },

  getJobStatus: async (jobId) => {
    const response = await api.get(`assistant/v2/jobs/${jobId}/`);
    return response.data;
  },

  getUserContext: async () => {
    const response = await api.get('assistant/v2/user-context/');
    return response.data;
  },

  getSuggestions: async (contextSource = 'general') => {
    const response = await api.get('assistant/v2/suggestions/', {
      params: { context_source: contextSource },
    });
    return response.data?.suggestions ?? [];
  },
};

