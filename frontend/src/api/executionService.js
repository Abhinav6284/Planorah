import api from './axios';

const requestWith404Fallback = async (primaryRequest, fallbackRequest) => {
    try {
        return await primaryRequest();
    } catch (error) {
        if (error?.response?.status === 404 && fallbackRequest) {
            return fallbackRequest();
        }
        throw error;
    }
};

const shouldUseFallback = (error) => {
    const status = error?.response?.status;
    return status === 404 || (typeof status === 'number' && status >= 500);
};

const requestWithResilientFallback = async (primaryRequest, fallbackRequest) => {
    try {
        return await primaryRequest();
    } catch (error) {
        if (fallbackRequest && shouldUseFallback(error)) {
            return fallbackRequest();
        }
        throw error;
    }
};

const normalizeExecutionStatus = (task) => {
    const raw = String(task?.status || task?.user_status || '').toLowerCase();
    if (raw === 'completed') {
        return 'completed';
    }
    if (raw === 'in_progress' || raw === 'in progress') {
        return 'in_progress';
    }
    return 'pending';
};

const mapRoadmapTaskToExecutionTask = (task, type = 'learning') => {
    const minutes = Number(task?.estimated_minutes) || 25;
    const dueDate = task?.due_date || null;
    return {
        id: task?.id || task?.task_id,
        title: task?.title || 'Task',
        type,
        status: normalizeExecutionStatus(task),
        priority: 'medium',
        difficulty: 'medium',
        estimated_time: `${minutes} min`,
        estimated_minutes: minutes,
        reason: task?.description || task?.objective || '',
        ai_generated: false,
        metadata: {
            source: 'roadmap_tasks',
            roadmap_id: task?.roadmap || null,
            milestone_id: task?.milestone || null,
            day: task?.day || null,
        },
        scheduled_for: dueDate,
        completed_at: task?.completed_at || null,
        created_at: task?.created_at || null,
        updated_at: task?.updated_at || null,
    };
};

export const executionService = {
    getTodayTask: async () => {
        const response = await requestWith404Fallback(
            () => api.get('dashboard/today-task/'),
            () => api.get('today-task/')
        );
        return response.data;
    },

    getAICoach: async (payload = {}) => {
        const response = await requestWith404Fallback(
            () => api.post('dashboard/ai/coach/', payload),
            () => api.post('ai/coach/', payload)
        );
        return response.data;
    },

    getExecutionTasks: async (type = '') => {
        const params = type ? { type } : undefined;
        const response = await requestWithResilientFallback(
            () => api.get('dashboard/execution/tasks/', { params }),
            async () => {
                if (type === 'exam') {
                    return { data: [] };
                }

                try {
                    const fallbackResponse = await api.get('execution/tasks/', { params });
                    return fallbackResponse;
                } catch (error) {
                    if (!shouldUseFallback(error)) {
                        throw error;
                    }

                    const roadmapTasksResponse = await api.get('tasks/');
                    const payload = Array.isArray(roadmapTasksResponse?.data)
                        ? roadmapTasksResponse.data
                        : (Array.isArray(roadmapTasksResponse?.data?.tasks) ? roadmapTasksResponse.data.tasks : []);

                    return {
                        data: payload.map((task) => mapRoadmapTaskToExecutionTask(task, 'learning')),
                    };
                }
            }
        );
        return response.data;
    },

    createExecutionTask: async (payload) => {
        const response = await api.post('dashboard/execution/tasks/', payload);
        return response.data;
    },

    updateExecutionTask: async (payload) => {
        const response = await api.patch('dashboard/execution/tasks/', payload);
        return response.data;
    },

    createFocusSession: async (payload) => {
        const response = await api.post('dashboard/focus-session/', payload);
        return response.data;
    },

    updateFocusSession: async (payload) => {
        const response = await api.patch('dashboard/focus-session/', payload);
        return response.data;
    },

    generateExamPlan: async (payload) => {
        const response = await api.post('dashboard/exam/plan/', payload);
        return response.data;
    },

    applyRewards: async (payload) => {
        const response = await requestWith404Fallback(
            () => api.post('dashboard/rewards/apply/', payload),
            () => api.post('rewards/apply/', payload)
        );
        return response.data;
    },

    getProgress: async () => {
        const response = await requestWith404Fallback(
            () => api.get('dashboard/execution/progress/'),
            () => api.get('execution/progress/')
        );
        return response.data;
    },
};
