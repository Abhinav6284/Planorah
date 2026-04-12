import api from './api';

/**
 * Fetch all roadmaps for the current user
 */
export const getRoadmaps = () => api.get('/roadmap/');

/**
 * Fetch a specific roadmap by ID
 * @param {string} id - Roadmap ID
 */
export const getRoadmap = (id) => api.get(`/roadmap/${id}/`);

/**
 * Update the status of a node in a roadmap
 * @param {string} roadmapId - Roadmap ID
 * @param {string} nodeId - Node ID
 * @param {string} status - New status (e.g., 'pending', 'in_progress', 'completed')
 */
export const updateNodeStatus = (roadmapId, nodeId, status) =>
  api.patch(`/roadmap/${roadmapId}/nodes/${nodeId}/`, { status });

/**
 * Create a new roadmap
 * @param {object} roadmapData - Roadmap data (title, description, etc.)
 */
export const createRoadmap = (roadmapData) =>
  api.post('/roadmap/', roadmapData);

/**
 * Update a roadmap
 * @param {string} id - Roadmap ID
 * @param {object} roadmapData - Updated roadmap data
 */
export const updateRoadmap = (id, roadmapData) =>
  api.patch(`/roadmap/${id}/`, roadmapData);

/**
 * Delete a roadmap
 * @param {string} id - Roadmap ID
 */
export const deleteRoadmap = (id) =>
  api.delete(`/roadmap/${id}/`);
