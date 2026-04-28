import React, { useEffect, useRef } from 'react';
import { Flame, CheckCircle, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useToast } from '../shared/Toast';
import StatsCard from './StatsCard';
import ActivityChart from './ActivityChart';
import * as dashboardService from '../../services/dashboardService';

/**
 * Mock data for initial development
 */
const MOCK_STATS = {
  currentStreak: 5,
  tasksCompletedToday: 3,
  overallCompletion: 45,
};

const MOCK_ACTIVITY = [
  { date: 'Mon', tasks: 3 },
  { date: 'Tue', tasks: 5 },
  { date: 'Wed', tasks: 2 },
  { date: 'Thu', tasks: 4 },
  { date: 'Fri', tasks: 6 },
  { date: 'Sat', tasks: 1 },
  { date: 'Sun', tasks: 3 },
];

/**
 * DashboardView Component
 * Main analytics dashboard with stats cards and activity chart
 */
export default function DashboardView() {
  const { stats, chartData, setStats, setChartData } = useDashboardStore();
  const { showToast } = useToast();
  const refreshIntervalRef = useRef(null);

  // Fetch dashboard stats and chart data
  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await dashboardService.getDashboardStats();
      if (statsResponse.data) {
        setStats({
          currentStreak: statsResponse.data.current_streak || MOCK_STATS.currentStreak,
          tasksCompletedToday: statsResponse.data.tasks_completed_today || MOCK_STATS.tasksCompletedToday,
          overallCompletion: statsResponse.data.overall_completion || MOCK_STATS.overallCompletion,
        });
      } else {
        setStats(MOCK_STATS);
      }

      // Fetch activity chart data
      const chartResponse = await dashboardService.getActivityChart(7);
      if (chartResponse.data && Array.isArray(chartResponse.data)) {
        setChartData(chartResponse.data);
      } else {
        setChartData(MOCK_ACTIVITY);
      }
    } catch (error) {
      showToast(`Failed to load dashboard data: ${error.message}`, 'error');
      // Fallback to mock data on error
      setStats(MOCK_STATS);
      setChartData(MOCK_ACTIVITY);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    refreshIntervalRef.current = setInterval(fetchDashboardData, 60000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Get user's first name from localStorage or use default
  const getUserName = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.first_name || 'there';
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }
    return 'there';
  };

  const userName = getUserName();
  const displayChartData = chartData.length > 0 ? chartData : MOCK_ACTIVITY;

  return (
    <div className="w-full h-full min-h-screen bg-beigePrimary dark:bg-charcoalDark p-6 md:p-8 lg:p-10">
      {/* Container */}
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your productivity overview
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Streak Card */}
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="days"
          />

          {/* Tasks Completed Today Card */}
          <StatsCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Tasks Today"
            value={stats.tasksCompletedToday}
            subtitle="completed"
          />

          {/* Overall Completion Card */}
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Overall Progress"
            value={`${stats.overallCompletion}%`}
            subtitle="complete"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Weekly Activity
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tasks completed per day
            </p>
          </div>

          {/* Chart */}
          <div className="w-full">
            <ActivityChart data={displayChartData} />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
