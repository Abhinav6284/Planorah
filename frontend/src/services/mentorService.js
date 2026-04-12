import api from './api';

/**
 * Send a message to the AI mentor
 * @param {string} message - User message
 * @param {object} context - Additional context (optional)
 */
export const sendMessage = (message, context = {}) =>
  api.post('/ai_mentoring/chat/', { message, context });

/**
 * Fetch chat history
 */
export const getChatHistory = () =>
  api.get('/ai_mentoring/history/');

/**
 * Get AI mentor suggestions for a specific task
 * @param {string} taskId - Task ID to get suggestions for
 */
export const getTaskSuggestions = (taskId) =>
  api.get(`/ai_mentoring/suggestions/${taskId}/`);

/**
 * Get motivational messages from AI mentor
 */
export const getMotivationalMessage = () =>
  api.get('/ai_mentoring/motivation/');

/**
 * Clear chat history
 */
export const clearChatHistory = () =>
  api.delete('/ai_mentoring/history/');
