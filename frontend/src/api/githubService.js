/**
 * GitHub Integration Service
 * Handles GitHub OAuth and project publishing
 */
import api from './axios';

export const githubService = {
    // Get GitHub connection status
    getStatus: async () => {
        const response = await api.get('/api/github/status/');
        return response.data;
    },

    // Connect GitHub account
    connect: async (code, redirectUri = null) => {
        const data = { code };
        if (redirectUri) {
            data.redirect_uri = redirectUri;
        }
        const response = await api.post('/api/github/connect/', data);
        return response.data;
    },

    // Disconnect GitHub account
    disconnect: async () => {
        const response = await api.post('/api/github/disconnect/');
        return response.data;
    },

    // Publish project to GitHub
    publish: async (projectId, projectType = 'roadmap', repoName = null, isPrivate = false, commitMessage = null) => {
        const data = {
            project_id: projectId,
            project_type: projectType,
            is_private: isPrivate
        };
        if (repoName) {
            data.repo_name = repoName;
        }
        if (commitMessage) {
            data.commit_message = commitMessage;
        }
        const response = await api.post('/api/github/publish/', data);
        return response.data;
    },

    // Get all published repositories
    getRepositories: async () => {
        const response = await api.get('/api/github/repositories/');
        return response.data;
    },

    // Get publish logs
    getLogs: async (repoId = null) => {
        const params = repoId ? { repo_id: repoId } : {};
        const response = await api.get('/api/github/logs/', { params });
        return response.data;
    },

    // Sync GitHub stats
    syncStats: async (repoId = null) => {
        const data = repoId ? { repo_id: repoId } : {};
        const response = await api.post('/api/github/sync_stats/', data);
        return response.data;
    }
};
