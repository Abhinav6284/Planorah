import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // State
      stats: {
        currentStreak: 0,
        tasksCompletedToday: 0,
        overallCompletion: 0,
      },
      chartData: [],
      isLoading: false,
      lastUpdated: null,

      // Actions
      setStats: (stats) =>
        set(
          (state) => ({
            stats: { ...state.stats, ...stats },
            lastUpdated: new Date().toISOString(),
          }),
          false,
          'dashboardStore/setStats'
        ),

      setChartData: (chartData) =>
        set({ chartData }, false, 'dashboardStore/setChartData'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'dashboardStore/setLoading'),

      updateStat: (statKey, value) =>
        set(
          (state) => ({
            stats: {
              ...state.stats,
              [statKey]: value,
            },
            lastUpdated: new Date().toISOString(),
          }),
          false,
          'dashboardStore/updateStat'
        ),
    }),
    { name: 'dashboardStore' }
  )
);
