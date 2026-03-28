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

const writeExecutionCache = (partial) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const current = readExecutionCache() || {};
        const next = {
            ...current,
            ...partial,
            cached_at: new Date().toISOString(),
        };
        window.localStorage.setItem(EXECUTION_CACHE_KEY, JSON.stringify(next));
    } catch (_error) {
        // Ignore cache failures to avoid impacting dashboard UX.
    }
};

const initialCache = readExecutionCache() || {};

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
                executionService.getTodayTask()
                    .then((todayTask) => {
                        set({ todayTask });
                        writeExecutionCache({ todayTask });
                    })
                    .catch(() => null),
                executionService.getAICoach()
                    .then((coach) => {
                        const nextCoach = coach || defaultCoach;
                        set({ coach: nextCoach });
                        writeExecutionCache({ coach: nextCoach });
                    })
                    .catch(() => null),
                executionService.getExecutionTasks('learning')
                    .then((tasks) => {
                        const nextTasks = Array.isArray(tasks) ? tasks : [];
                        set({ tasks: nextTasks });
                        writeExecutionCache({ tasks: nextTasks });
                    })
                    .catch(() => null),
                executionService.getExecutionTasks('exam')
                    .then((examTasks) => {
                        const nextExamTasks = Array.isArray(examTasks) ? examTasks : [];
                        set({ examTasks: nextExamTasks });
                        writeExecutionCache({ examTasks: nextExamTasks });
                    })
                    .catch(() => null),
                executionService.getProgress()
                    .then((progress) => {
                        const mode = progress?.mode || get().mode || 'learning';
                        set({
                            progress,
                            activeExamPlan: progress?.active_exam_plan || null,
                            mode,
                        });
                        writeExecutionCache({
                            progress,
                            mode,
                        });
                    })
                    .catch(() => null),
            ];

            await Promise.allSettled(requests);
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
        const updated = await executionService.updateExecutionTask({ id: taskId, status });
        set((state) => {
            const updateList = (list) => list.map((item) => (item.id === taskId ? { ...item, ...updated } : item));
            const nextTasks = updateList(state.tasks);
            const nextExamTasks = updateList(state.examTasks);
            const nextTodayTask = state.todayTask?.id === taskId ? { ...state.todayTask, ...updated } : state.todayTask;

            writeExecutionCache({
                tasks: nextTasks,
                examTasks: nextExamTasks,
                todayTask: nextTodayTask,
            });

            return {
                tasks: nextTasks,
                examTasks: nextExamTasks,
                todayTask: nextTodayTask,
            };
        });

        const progress = await executionService.getProgress();
        set({ progress, activeExamPlan: progress?.active_exam_plan || null });
        writeExecutionCache({ progress });
    },

    createFocusSession: async (payload) => executionService.createFocusSession(payload),
    updateFocusSession: async (payload) => executionService.updateFocusSession(payload),

    applyRewards: async (taskId) => {
        set((state) => ({ loading: { ...state.loading, rewards: true } }));
        try {
            const reward = await executionService.applyRewards({ task_id: taskId });
            const progress = await executionService.getProgress();
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
