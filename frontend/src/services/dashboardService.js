import api from './api';

/**
 * Fetch dashboard statistics and overview
 */
export const getDashboardStats = () => api.get('/analytics/dashboard/');

/**
 * Fetch activity chart data
 * @param {number} days - Number of days to include in the chart (default: 7)
 */
export const getActivityChart = (days = 7) =>
  api.get('/analytics/activity_chart/', { params: { days } });

/**
 * Fetch productivity insights
 */
export const getProductivityInsights = () =>
  api.get('/analytics/productivity_insights/');

/**
 * Fetch user statistics
 */
export const getUserStats = () =>
  api.get('/analytics/user_stats/');

/**
 * Fetch streak data
 */
export const getStreakData = () =>
  api.get('/analytics/streak/');
