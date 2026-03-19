import api from '../api';
import env from '../config/env';

const AI_TIMEOUT_MS = 90000; // 90s for AI generation endpoints

const PLANORA_BASE = `${String(env.API_ORIGIN || '').replace(/\/+$/, '')}/planora/`;
const API_PLANORA_BASE = `${String(env.API_ORIGIN || '').replace(/\/+$/, '')}/api/planora/`;

const isNotFound = (error) => error?.response?.status === 404;

const hasStructuredApiError = (error) => {
  const data = error?.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  return typeof data.error !== 'undefined' || typeof data.detail !== 'undefined';
};

// Prefer /planora/* and fall back to /api/planora/* for mixed deployments.
const requestPlanora = async (method, path, data, config = {}) => {
  const requestConfig = {
    method,
    url: `${PLANORA_BASE}${path}`,
    ...config,
  };

  if (typeof data !== 'undefined') {
    requestConfig.data = data;
  }

  try {
    return await api.request(requestConfig);
  } catch (error) {
    // Only retry 404 on the alternate base path when this looks like
    // a route mismatch, not a real API/business-level 404.
    if (!isNotFound(error) || hasStructuredApiError(error)) {
      throw error;
    }

    return api.request({
      ...requestConfig,
      url: `${API_PLANORA_BASE}${path}`,
    });
  }
};

export const planoraService = {
  // ── Subjects ──────────────────────────────────────────────────────────────
  getSubjects: async () => {
    const res = await requestPlanora('get', 'subjects/');
    return res.data;
  },

  createSubject: async (data) => {
    const res = await requestPlanora('post', 'subjects/', data);
    return res.data;
  },

  getSubject: async (id) => {
    const res = await requestPlanora('get', `subjects/${id}/`);
    return res.data;
  },

  updateSubject: async (id, data) => {
    const res = await requestPlanora('patch', `subjects/${id}/`, data);
    return res.data;
  },

  deleteSubject: async (id) => {
    const res = await requestPlanora('delete', `subjects/${id}/`);
    return res.data;
  },

  // ── Syllabus Upload ────────────────────────────────────────────────────────
  uploadSyllabus: async (subjectId, payload) => {
    // payload can be FormData (file upload) or plain object {syllabus_text}
    const isFormData = payload instanceof FormData;
    const res = await requestPlanora(
      'post',
      `subjects/${subjectId}/upload-syllabus/`,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {},
    );
    return res.data;
  },

  generateTopics: async (subjectId, append = false) => {
    const res = await requestPlanora(
      'post',
      `subjects/${subjectId}/generate-topics/`,
      { append },
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Exam Pattern ───────────────────────────────────────────────────────────
  getExamPattern: async (subjectId) => {
    const res = await requestPlanora('get', `subjects/${subjectId}/exam-pattern/`);
    return res.data;
  },

  saveExamPattern: async (subjectId, data) => {
    const res = await requestPlanora('post', `subjects/${subjectId}/exam-pattern/`, data);
    return res.data;
  },

  // ── Topics ─────────────────────────────────────────────────────────────────
  getTopics: async (subjectId) => {
    const res = await requestPlanora('get', `subjects/${subjectId}/topics/`);
    return res.data;
  },

  updateTopic: async (topicId, data) => {
    const res = await requestPlanora('patch', `topics/${topicId}/`, data);
    return res.data;
  },

  updateTopicProgress: async (topicId, data) => {
    const res = await requestPlanora('patch', `topics/${topicId}/progress/`, data);
    return res.data;
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  getNotes: async (topicId) => {
    const res = await requestPlanora('get', `topics/${topicId}/notes/`);
    return res.data;
  },

  generateNotes: async (topicId) => {
    const res = await requestPlanora(
      'post',
      `topics/${topicId}/notes/`,
      {},
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Study Guide ────────────────────────────────────────────────────────────
  getStudyGuide: async (topicId) => {
    const res = await requestPlanora('get', `topics/${topicId}/guide/`);
    return res.data;
  },

  generateStudyGuide: async (topicId) => {
    const res = await requestPlanora(
      'post',
      `topics/${topicId}/guide/`,
      {},
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Study Plan ─────────────────────────────────────────────────────────────
  getStudyPlan: async (subjectId) => {
    const res = await requestPlanora('get', `subjects/${subjectId}/plan/`);
    return res.data;
  },

  generateStudyPlan: async (subjectId, data) => {
    const res = await requestPlanora(
      'post',
      `subjects/${subjectId}/plan/`,
      data,
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },
};
