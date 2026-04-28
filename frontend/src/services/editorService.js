import api from './api';

/**
 * Save document with blocks
 * @param {array} blocks - Document blocks content
 */
export const saveDocument = (blocks) =>
  api.post('/notes/save/', { blocks });

/**
 * Fetch a specific document by ID
 * @param {string} id - Document ID
 */
export const getDocument = (id) =>
  api.get(`/notes/${id}/`);

/**
 * Update a document
 * @param {string} id - Document ID
 * @param {object} documentData - Updated document data (title, blocks, etc.)
 */
export const updateDocument = (id, documentData) =>
  api.patch(`/notes/${id}/`, documentData);

/**
 * Delete a document
 * @param {string} id - Document ID
 */
export const deleteDocument = (id) =>
  api.delete(`/notes/${id}/`);

/**
 * Fetch all documents for the current user
 */
export const getDocuments = () =>
  api.get('/notes/');

/**
 * Create a new document
 * @param {object} documentData - Document data (title, content, etc.)
 */
export const createDocument = (documentData) =>
  api.post('/notes/', documentData);
