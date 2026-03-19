import { create } from 'zustand';
import { executionService } from '../api/executionService';

export const useExecutionStore = create((set, get) => ({
    mode: 'learning',
    todayTask: null,
    coach: null,
    tasks: [],
    examTasks: [],
    progress: null,
    activeExamPlan: null,
    loading: {
        bootstrap: false,
        coach: false,
        examPlan: false,
    },

    setMode: (mode) => set({ mode }),
    setTodayTask: (todayTaskOrUpdater) =>
        set((state) => ({
            todayTask:
                typeof todayTaskOrUpdater === 'function'
                    ? todayTaskOrUpdater(state.todayTask)
                    : todayTaskOrUpdater,
        })),

    refreshTodayTask: async () => {
        const todayTask = await executionService.getTodayTask();
        set({ todayTask });
        return todayTask;
    },

    bootstrap: async () => {
        set((state) => ({ loading: { ...state.loading, bootstrap: true } }));
        try {
            const [todayTaskResult, coachResult, tasksResult, examTasksResult, progressResult] = await Promise.allSettled([
                executionService.getTodayTask(),
                executionService.getAICoach(),
                executionService.getExecutionTasks('learning'),
                executionService.getExecutionTasks('exam'),
                executionService.getProgress(),
            ]);

            const todayTask = todayTaskResult.status === 'fulfilled' ? todayTaskResult.value : null;
            const coach = coachResult.status === 'fulfilled' ? coachResult.value : null;
            const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : [];
            const examTasks = examTasksResult.status === 'fulfilled' ? examTasksResult.value : [];
            const progress = progressResult.status === 'fulfilled' ? progressResult.value : null;

            set({
                todayTask,
                coach: coach || {
                    task: 'Start one focused 25-minute study sprint',
                    reason: 'Small wins rebuild momentum and improve consistency.',
                    difficulty: 'medium',
                    estimated_time: '25 min',
                    alternatives: [],
                },
                tasks,
                examTasks,
                progress,
                activeExamPlan: progress?.active_exam_plan || null,
                mode: progress?.mode || 'learning',
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
        const updated = await executionService.updateExecutionTask({ id: taskId, status });
        set((state) => {
            const updateList = (list) => list.map((item) => (item.id === taskId ? { ...item, ...updated } : item));
            const nextTasks = updateList(state.tasks);
            const nextExamTasks = updateList(state.examTasks);
            return {
                tasks: nextTasks,
                examTasks: nextExamTasks,
                todayTask: state.todayTask?.id === taskId ? { ...state.todayTask, ...updated } : state.todayTask,
            };
        });

        const progress = await executionService.getProgress();
        set({ progress, activeExamPlan: progress?.active_exam_plan || null });
    },

    createFocusSession: async (payload) => executionService.createFocusSession(payload),
    updateFocusSession: async (payload) => executionService.updateFocusSession(payload),

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
            return plan;
        } finally {
            set((state) => ({ loading: { ...state.loading, examPlan: false } }));
        }
    },
}));
