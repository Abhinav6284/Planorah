import api from '../api';

const AI_TIMEOUT_MS = 90000; // 90s for AI generation endpoints

export const planoraService = {
  // ── Subjects ──────────────────────────────────────────────────────────────
  getSubjects: async () => {
    const res = await api.get('planora/subjects/');
    return res.data;
  },

  createSubject: async (data) => {
    const res = await api.post('planora/subjects/', data);
    return res.data;
  },

  getSubject: async (id) => {
    const res = await api.get(`planora/subjects/${id}/`);
    return res.data;
  },

  updateSubject: async (id, data) => {
    const res = await api.patch(`planora/subjects/${id}/`, data);
    return res.data;
  },

  deleteSubject: async (id) => {
    const res = await api.delete(`planora/subjects/${id}/`);
    return res.data;
  },

  // ── Syllabus Upload ────────────────────────────────────────────────────────
  uploadSyllabus: async (subjectId, payload) => {
    // payload can be FormData (file upload) or plain object {syllabus_text}
    const isFormData = payload instanceof FormData;
    const res = await api.post(
      `planora/subjects/${subjectId}/upload-syllabus/`,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {},
    );
    return res.data;
  },

  generateTopics: async (subjectId, append = false) => {
    const res = await api.post(
      `planora/subjects/${subjectId}/generate-topics/`,
      { append },
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Exam Pattern ───────────────────────────────────────────────────────────
  getExamPattern: async (subjectId) => {
    const res = await api.get(`planora/subjects/${subjectId}/exam-pattern/`);
    return res.data;
  },

  saveExamPattern: async (subjectId, data) => {
    const res = await api.post(`planora/subjects/${subjectId}/exam-pattern/`, data);
    return res.data;
  },

  // ── Topics ─────────────────────────────────────────────────────────────────
  getTopics: async (subjectId) => {
    const res = await api.get(`planora/subjects/${subjectId}/topics/`);
    return res.data;
  },

  updateTopic: async (topicId, data) => {
    const res = await api.patch(`planora/topics/${topicId}/`, data);
    return res.data;
  },

  updateTopicProgress: async (topicId, data) => {
    const res = await api.patch(`planora/topics/${topicId}/progress/`, data);
    return res.data;
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  getNotes: async (topicId) => {
    const res = await api.get(`planora/topics/${topicId}/notes/`);
    return res.data;
  },

  generateNotes: async (topicId) => {
    const res = await api.post(
      `planora/topics/${topicId}/notes/`,
      {},
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Study Guide ────────────────────────────────────────────────────────────
  getStudyGuide: async (topicId) => {
    const res = await api.get(`planora/topics/${topicId}/guide/`);
    return res.data;
  },

  generateStudyGuide: async (topicId) => {
    const res = await api.post(
      `planora/topics/${topicId}/guide/`,
      {},
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },

  // ── Study Plan ─────────────────────────────────────────────────────────────
  getStudyPlan: async (subjectId) => {
    const res = await api.get(`planora/subjects/${subjectId}/plan/`);
    return res.data;
  },

  generateStudyPlan: async (subjectId, data) => {
    const res = await api.post(
      `planora/subjects/${subjectId}/plan/`,
      data,
      { timeout: AI_TIMEOUT_MS },
    );
    return res.data;
  },
};
