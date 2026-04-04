import { create } from 'zustand';
import { executionService } from '../api/executionService';

const EXECUTION_CACHE_KEY = 'planora.execution.cache.v1';

const defaultCoach = {
    task: 'Start one focused 25-minute study sprint',
    reason: 'Small wins rebuild momentum and improve consistency.',
    difficulty: 'medium',
    estimated_time: '25 min',
    alternatives: [],
};

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const readExecutionCache = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(EXECUTION_CACHE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_error) {
        return null;
    }
};

const isCacheFresh = (cache) => {
    if (!cache?.cached_at) return false;
    return Date.now() - new Date(cache.cached_at).getTime() < CACHE_TTL_MS;
};

let memoryCache = readExecutionCache() || {};

const writeExecutionCache = (partial) => {
    if (typeof window === 'undefined') {
        return;
    }

    memoryCache = {
        ...memoryCache,
        ...partial,
        cached_at: new Date().toISOString(),
    };

    try {
        window.localStorage.setItem(EXECUTION_CACHE_KEY, JSON.stringify(memoryCache));
    } catch (_error) {
        // Ignore cache failures to avoid impacting dashboard UX.
    }
};

const initialCache = isCacheFresh(memoryCache) ? memoryCache : {};

export const useExecutionStore = create((set, get) => ({
    mode: initialCache.mode || 'learning',
    todayTask: initialCache.todayTask || null,
    coach: initialCache.coach || defaultCoach,
    tasks: Array.isArray(initialCache.tasks) ? initialCache.tasks : [],
    examTasks: Array.isArray(initialCache.examTasks) ? initialCache.examTasks : [],
    progress: initialCache.progress || null,
    activeExamPlan: null,
    loading: {
        bootstrap: false,
        coach: false,
        examPlan: false,
        rewards: false,
    },
    currentState: 'NOT_STARTED', // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

    setExecutionState: (state) => set({ currentState: state }),
    setMode: (mode) => {
        set({ mode });
        writeExecutionCache({ mode });
    },
    setTodayTask: (todayTaskOrUpdater) =>
        set((state) => {
            const nextTodayTask =
                typeof todayTaskOrUpdater === 'function'
                    ? todayTaskOrUpdater(state.todayTask)
                    : todayTaskOrUpdater;

            writeExecutionCache({ todayTask: nextTodayTask });
            return { todayTask: nextTodayTask };
        }),

    refreshTodayTask: async () => {
        const todayTask = await executionService.getTodayTask();
        set({ todayTask });
        writeExecutionCache({ todayTask });
        return todayTask;
    },

    bootstrap: async () => {
        set((state) => ({ loading: { ...state.loading, bootstrap: true } }));
        try {
            set((state) => ({
                coach: state.coach || defaultCoach,
                tasks: state.tasks?.length ? state.tasks : (Array.isArray(initialCache.tasks) ? initialCache.tasks : []),
                examTasks: state.examTasks?.length ? state.examTasks : (Array.isArray(initialCache.examTasks) ? initialCache.examTasks : []),
                progress: state.progress || initialCache.progress || null,
                todayTask: state.todayTask || initialCache.todayTask || null,
                mode: state.mode || initialCache.mode || 'learning',
            }));

            const requests = [
                executionService.getTodayTask().catch(() => null),
                executionService.getAICoach().catch(() => null),
                executionService.getExecutionTasks('learning').catch(() => null),
                executionService.getExecutionTasks('exam').catch(() => null),
                executionService.getProgress().catch(() => null),
            ];

            const [todayTaskResult, coachResult, tasksResult, examTasksResult, progressResult] =
                await Promise.allSettled(requests);

            // Extract successful results with fallbacks
            const nextTodayTask = todayTaskResult.status === 'fulfilled' ? todayTaskResult.value : get().todayTask;
            const nextCoach = coachResult.status === 'fulfilled' ? (coachResult.value || defaultCoach) : get().coach;
            const nextTasks = tasksResult.status === 'fulfilled' ? (Array.isArray(tasksResult.value) ? tasksResult.value : []) : get().tasks;
            const nextExamTasks = examTasksResult.status === 'fulfilled' ? (Array.isArray(examTasksResult.value) ? examTasksResult.value : []) : get().examTasks;
            const nextProgress = progressResult.status === 'fulfilled' ? progressResult.value : get().progress;
            const nextMode = nextProgress?.mode || get().mode || 'learning';

            // Single set() call — React 18 batches this automatically, one re-render wave
            set({
                todayTask: nextTodayTask,
                coach: nextCoach,
                tasks: nextTasks,
                examTasks: nextExamTasks,
                progress: nextProgress,
                activeExamPlan: nextProgress?.active_exam_plan || null,
                mode: nextMode,
            });

            writeExecutionCache({
                todayTask: nextTodayTask,
                coach: nextCoach,
                tasks: nextTasks,
                examTasks: nextExamTasks,
                progress: nextProgress,
                mode: nextMode,
            });
        } finally {
            set((state) => ({ loading: { ...state.loading, bootstrap: false } }));
        }
    },

    regenerateCoach: async () => {
        set((state) => ({ loading: { ...state.loading, coach: true } }));
        try {
            const pending = [...get().tasks, ...get().examTasks]
                .filter((item) => item.status !== 'completed')
                .map((item) => item.title);

            const coach = await executionService.getAICoach({ pending_tasks: pending });
            set({ coach });
            return coach;
        } finally {
            set((state) => ({ loading: { ...state.loading, coach: false } }));
        }
    },

    updateTaskStatus: async (taskId, status) => {
        // Fetch both in parallel
        const [updated, progress] = await Promise.all([
            executionService.updateExecutionTask({ id: taskId, status }),
            executionService.getProgress(),
        ]);

        // Single set() call with all updates
        set((state) => {
            const updateList = (list) => list.map((item) => (item.id === taskId ? { ...item, ...updated } : item));
            const nextTasks = updateList(state.tasks);
            const nextExamTasks = updateList(state.examTasks);
            const nextTodayTask = state.todayTask?.id === taskId ? { ...state.todayTask, ...updated } : state.todayTask;

            writeExecutionCache({
                tasks: nextTasks,
                examTasks: nextExamTasks,
                todayTask: nextTodayTask,
                progress,
            });

            return {
                tasks: nextTasks,
                examTasks: nextExamTasks,
                todayTask: nextTodayTask,
                progress,
                activeExamPlan: progress?.active_exam_plan || null,
            };
        });
    },

    createFocusSession: async (payload) => executionService.createFocusSession(payload),
    updateFocusSession: async (payload) => executionService.updateFocusSession(payload),

    applyRewards: async (taskId) => {
        set((state) => ({ loading: { ...state.loading, rewards: true } }));
        try {
            const [reward, progress] = await Promise.all([
                executionService.applyRewards({ task_id: taskId }),
                executionService.getProgress(),
            ]);
            set({ progress, activeExamPlan: progress?.active_exam_plan || null });
            writeExecutionCache({ progress });
            return reward;
        } finally {
            set((state) => ({ loading: { ...state.loading, rewards: false } }));
        }
    },

    createExamPlan: async (payload) => {
        set((state) => ({ loading: { ...state.loading, examPlan: true } }));
        try {
            const plan = await executionService.generateExamPlan(payload);
            const [examTasks, progress] = await Promise.all([
                executionService.getExecutionTasks('exam'),
                executionService.getProgress(),
            ]);

            set({
                examTasks,
                activeExamPlan: plan,
                progress,
                mode: 'exam',
            });
            writeExecutionCache({
                examTasks,
                progress,
                mode: 'exam',
            });
            return plan;
        } finally {
            set((state) => ({ loading: { ...state.loading, examPlan: false } }));
        }
    },
}));
