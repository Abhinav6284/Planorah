import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const weeklyData = [
  { day: 'Mon', tasks: 8, completed: 7 },
  { day: 'Tue', tasks: 10, completed: 9 },
  { day: 'Wed', tasks: 12, completed: 11 },
  { day: 'Thu', tasks: 9, completed: 8 },
  { day: 'Fri', tasks: 11, completed: 10 },
  { day: 'Sat', tasks: 6, completed: 6 },
  { day: 'Sun', tasks: 5, completed: 5 },
];

const productivityData = [
  { name: 'Completed', value: 68, fill: '#10b981' },
  { name: 'In Progress', value: 22, fill: '#3b82f6' },
  { name: 'Planned', value: 10, fill: '#f3f4f6' },
];

const skillData = [
  { month: 'Jan', xp: 240 },
  { month: 'Feb', xp: 380 },
  { month: 'Mar', xp: 290 },
  { month: 'Apr', xp: 450 },
  { month: 'May', xp: 620 },
  { month: 'Jun', xp: 750 },
];

export default function StatsWithCharts() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Analytics</p>
          <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            See your progress like never before
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real-time analytics and insights to keep you accountable.
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Weekly Performance */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8">
            <h3 className="text-xl font-outfit font-semibold text-gray-950 dark:text-white mb-6">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }} 
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tasks" stackId="a" fill="#dbeafe" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-6 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-950 dark:text-white mt-1">52/56</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">92.8%</p>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8">
            <h3 className="text-xl font-outfit font-semibold text-gray-950 dark:text-white mb-6">Task Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productivityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {productivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-6 text-sm justify-center">
              {productivityData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <p className="font-semibold text-gray-950 dark:text-white">{item.value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* XP Growth */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8 md:col-span-2">
            <h3 className="text-xl font-outfit font-semibold text-gray-950 dark:text-white mb-6">Your XP Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-50 dark:bg-white/[0.06] rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-gray-950 dark:text-white">3,730</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.06] rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                <p className="text-2xl font-bold text-blue-500">750</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.06] rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Level</p>
                <p className="text-2xl font-bold text-purple-500">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
