/**
 * Code Project Service
 * Handles CodeSpace project storage and GitHub push operations
 */
import api from './axios';

export const codeProjectService = {
    // List user's saved CodeSpace projects
    getProjects: async () => {
        const response = await api.get('/api/projects/');
        return response.data;
    },

    // Get a specific project with files
    getProject: async (projectId) => {
        const response = await api.get(`/api/projects/${projectId}/`);
        return response.data;
    },

    // Save a new project from CodeSpace
    saveProject: async (projectData) => {
        /**
         * projectData: {
         *   title: string,
         *   description: string,
         *   language: string,
         *   tech_stack: string[],
         *   files: [{ path: string, content: string, language: string }]
         * }
         */
        const response = await api.post('/api/projects/', projectData);
        return response.data;
    },

    // Update an existing project
    updateProject: async (projectId, projectData) => {
        const response = await api.put(`/api/projects/${projectId}/`, projectData);
        return response.data;
    },

    // Delete a project
    deleteProject: async (projectId) => {
        await api.delete(`/api/projects/${projectId}/`);
    },

    // Add a single file to a project
    addFile: async (projectId, path, content) => {
        const response = await api.post(`/api/projects/${projectId}/add_file/`, {
            path,
            content
        });
        return response.data;
    },

    // Get all files for a project
    getFiles: async (projectId) => {
        const response = await api.get(`/api/projects/${projectId}/files/`);
        return response.data;
    },

    // Prepare project for GitHub push (validate)
    prepareGitHub: async (projectId, repoName) => {
        const response = await api.post(`/api/projects/${projectId}/prepare_github/`, {
            repo_name: repoName
        });
        return response.data;
    },

    // Push project to GitHub
    pushToGitHub: async (projectId, options = {}) => {
        /**
         * options: {
         *   repo_name: string (optional),
         *   is_private: boolean (default: false),
         *   description: string (optional)
         * }
         */
        const response = await api.post('/api/github/publish_user_project/', {
            project_id: projectId,
            ...options
        });
        return response.data;
    },

    // Check GitHub connection status
    checkGitHubStatus: async () => {
        const response = await api.get('/api/github/status/');
        return response.data;
    }
};

export default codeProjectService;
