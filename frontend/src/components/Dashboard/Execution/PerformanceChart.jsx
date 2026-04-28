import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

// Extract CustomTooltip to module scope to prevent unmount/remount on every render
const ChartTooltip = ({ active, payload, isApiData }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  return (
    <div style={{ 
        background: 'var(--el-bg)', 
        border: '1px solid var(--el-border)', 
        borderRadius: 12, 
        padding: '12px 16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)'
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{entry?.day}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--el-text)' }} />
        <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--el-text)' }}>
          {payload[0]?.value} tasks
        </p>
      </div>
      {payload[1] && (
        <p style={{ fontSize: 11, color: 'var(--el-text-secondary)', marginTop: 4 }}>
          {payload[1]?.value} {isApiData ? 'min active' : 'total'}
        </p>
      )}
    </div>
  );
};

const PerformanceChart = ({ tasks = [], chartData: apiChartData = null }) => {
  // Build 7-day data — prefer real API data over task derivation
  const data = useMemo(() => {
    if (apiChartData && Array.isArray(apiChartData.dates) && apiChartData.dates.length) {
      return apiChartData.dates.map((iso, i) => ({
        day: new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: iso,
        completed: apiChartData.tasks_completed?.[i] ?? 0,
        total: apiChartData.minutes_active?.[i] ?? 0,
      }));
    }
    // Fallback: derive from tasks (existing logic)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);

      const completed = (tasks || []).filter(
        (t) => t.status === 'completed' &&
        String(t.completed_at || t.updated_at || '').slice(0, 10) === iso
      ).length;

      const scheduled = (tasks || []).filter(
        (t) => String(t.scheduled_for || t.created_at || '').slice(0, 10) === iso
      ).length;

      const total = Math.max(scheduled, completed);

      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: iso,
        completed,
        total,
      };
    });
  }, [tasks, apiChartData]);

  // Dynamic date range label
  const dateRangeLabel = useMemo(() => {
    if (!data?.length) return '7 Days';
    const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(data[0].fullDate)} – ${fmt(data[data.length - 1].fullDate)}`;
  }, [data]);

  return (
    <div style={{ 
        background: 'var(--el-bg)', 
        border: '1px solid var(--el-border)', 
        borderRadius: 16, 
        padding: 24, 
        boxShadow: 'var(--el-shadow-card)',
        color: 'var(--el-text)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>
            Performance Metrics
          </h3>
        </div>
        <div style={{ 
            fontSize: 11, fontWeight: 600, color: 'var(--el-text-secondary)',
            background: 'var(--el-bg-secondary)', padding: '4px 10px', borderRadius: 8
        }}>
          {dateRangeLabel}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--el-text)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--el-text)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--el-border)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--el-text-muted)"
              tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--el-text-muted)"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip 
              content={<ChartTooltip isApiData={!!apiChartData} />} 
              cursor={{ stroke: 'var(--el-border)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--el-text)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Completed"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ 
          display: 'flex', gap: 20, marginTop: 20, paddingTop: 20, 
          borderTop: '1px solid var(--el-border-subtle)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--el-text)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--el-text-secondary)' }}>Tasks Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--el-text-muted)' }}>Daily Average</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PerformanceChart);
