import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const PerformanceChart = ({ tasks = [] }) => {
  // Build 7-day data
  const chartData = useMemo(() => {
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
        completed,
        total,
      };
    });
  }, [tasks]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-white/60 font-medium">{payload[0].payload.day}</p>
          <p className="text-sm font-bold text-terracotta mt-1">
            {payload[0].value} tasks
          </p>
          {payload[1] && (
            <p className="text-xs text-blue-400 mt-0.5">
              {payload[1].value} total
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wide">
            Performance
          </h3>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
          <span>01-07 May</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D96C4A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D96C4A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#D96C4A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompleted)"
              name="Completed"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
              name="Total"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-terracotta" />
          <span className="text-xs text-textSecondary dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-textSecondary dark:text-gray-400">Total</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
