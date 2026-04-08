import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../services/api'
import { TrendingUp, Users, Activity, Target } from 'lucide-react'

const RANGES = ['3M', '6M', '12M']
const RANGE_MONTHS = { '3M': 3, '6M': 6, '12M': 12 }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs z-50"
      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="flex items-center gap-2 mb-0.5" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-1">
            {p.name === 'Revenue' ? '₹' : ''}{Number(p.value).toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, delta, color, delay: d }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.3 }}
      className="card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={16} />
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
          {delta}
        </span>
      </div>
      <p className="font-display font-bold text-xl mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </motion.div>
  )
}

function ChartCard({ title, subtitle, children, delay: d }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.35 }}
      className="card p-5"
    >
      <div className="mb-4">
        <p className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}

function Sk({ h = 'h-48' }) {
  return <div className={`skeleton ${h} rounded-xl`} />
}

export default function Analytics() {
  const [range,    setRange]    = useState('12M')
  const [loading,  setLoading]  = useState(true)
  const [data,     setData]     = useState(null)

  useEffect(() => {
    setLoading(true)
    const months = RANGE_MONTHS[range]
    adminApi.getAnalytics(months, 30)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  // Build revenue data from API labels/values
  const revenueData = data ? data.revenue_chart.labels.map((label, i) => ({
    month: label,
    revenue: data.revenue_chart.values[i] ?? 0,
    subs: data.sub_growth.values[i] ?? 0,
  })) : []

  // Signup/DAU data (daily, last 30 days)
  const signupData = data ? data.signup_chart.labels.map((label, i) => ({
    month: label,
    newUsers: data.signup_chart.values[i] ?? 0,
    dau: data.dau_chart.values[i] ?? 0,
  })) : []

  // Slice to range
  const revSlice = revenueData.slice(-RANGE_MONTHS[range])

  const mrr   = data?.mrr   ?? 0
  const arr   = data?.arr   ?? 0
  const churn = data?.churn_rate ?? 0
  const conv  = data?.conversion_rate ?? 0

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Platform growth and revenue metrics</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: range === r ? 'var(--bg-surface)' : 'transparent',
                color:      range === r ? 'var(--text-primary)' : 'var(--text-muted)',
                border:     range === r ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >{r}</button>
          ))}
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard icon={TrendingUp} label="MRR"            value={`₹${Math.round(mrr).toLocaleString()}`}  delta={`${conv}% conv`} color="#F59E0B" delay={0}    />
        <MetricCard icon={Users}      label="ARR Estimate"   value={`₹${Math.round(arr).toLocaleString()}`}  delta="Annualised"      color="#6366F1" delay={0.06} />
        <MetricCard icon={Activity}   label="Churn Rate"     value={`${churn}%`}                              delta="This month"       color="#EF4444" delay={0.12} />
        <MetricCard icon={Target}     label="Conversion"     value={`${conv}%`}                               delta="Paid users"       color="#22C55E" delay={0.18} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue (INR)" delay={0.24}>
          {loading ? <Sk /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revSlice} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#F59E0B" strokeWidth={2} fill="url(#gRev)" dot={false}
                  activeDot={{ r: 4, fill: '#F59E0B' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Subscription Growth" subtitle="New subscriptions per month" delay={0.28}>
          {loading ? <Sk /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revSlice} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="subs" name="Subscriptions"
                  stroke="#6366F1" strokeWidth={2} fill="url(#gSubs)" dot={false}
                  activeDot={{ r: 4, fill: '#6366F1' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Daily Signups" subtitle="New user registrations (30 days)" delay={0.32}>
          {loading ? <Sk h="h-40" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="newUsers" name="Signups" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Daily Active Users" subtitle="DAU from streak activity (30 days)" delay={0.36}>
          {loading ? <Sk h="h-40" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={signupData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="dau" name="DAU"
                  stroke="#EC4899" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: '#EC4899' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Plan breakdown */}
      {data?.plan_breakdown?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.35 }}
          className="card p-5 mt-4"
        >
          <p className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Active Subscriptions by Plan</p>
          <div className="flex flex-wrap gap-3">
            {data.plan_breakdown.map(pb => (
              <div key={pb.plan__name} className="flex-1 min-w-[120px] p-3 rounded-xl text-center"
                style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{pb.count}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pb.plan__display_name || pb.plan__name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
