import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Grid,
} from 'recharts';

/**
 * ActivityChart Component
 * Displays weekly activity with Recharts line chart
 */
export default function ActivityChart({ data = [] }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          {/* Grid */}
          <Grid
            strokeDasharray="3 3"
            stroke={isDark ? '#475569' : '#e5e7eb'}
            vertical={false}
          />

          {/* Axes */}
          <XAxis
            dataKey="date"
            stroke={isDark ? '#94a3b8' : '#9ca3af'}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={isDark ? '#94a3b8' : '#9ca3af'}
            style={{ fontSize: '12px' }}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#f1f5f9' : '#111827',
            }}
            labelStyle={{
              color: isDark ? '#f1f5f9' : '#111827',
            }}
            formatter={(value) => [`${value} tasks`, 'Tasks']}
          />

          {/* Line */}
          <Line
            type="monotone"
            dataKey="tasks"
            stroke="#4f46e5"
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
