import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, DollarSign, CreditCard, TrendingUp,
  ArrowUpRight, AlertCircle,
} from 'lucide-react'
import { adminApi } from '../services/api'

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const dur = 1200
    const step = ts => {
      const p = Math.min((ts - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(target * ease)
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  const display = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()
  return <span>{prefix}{display}{suffix}</span>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, prefix, suffix, trend, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="bg-white rounded-lg p-6 shadow-level-2-card cursor-default"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-10 h-10 rounded-lg bg-charcoal text-white flex items-center justify-center">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        {trend != null && (
          <span className="flex items-center gap-1 text-xs font-inter font-medium text-charcoal bg-gray-50 px-2 py-1 rounded-lg border border-border-gray">
            <ArrowUpRight size={12} />
            {trend}%
          </span>
        )}
      </div>
      <p className="font-cal-sans font-semibold text-3xl text-charcoal mb-1.5 tracking-tight">
        <Counter target={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-sm font-inter text-mid-gray">{label}</p>
    </motion.div>
  )
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2.5 shadow-level-2-card bg-white text-xs font-inter">
      <p className="font-semibold text-charcoal mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-mid-gray">
          {p.name}:{' '}
          <span className="font-semibold text-charcoal">
            {p.name === 'Revenue' ? '₹' : ''}{Number(p.value).toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Sk({ h = 'h-4', w = 'w-full', r = 'rounded-lg' }) {
  return <div className={`${h} ${w} ${r} bg-gray-100 animate-pulse`} />
}

export default function Dashboard() {
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getAnalytics(12, 30)])
      .then(([s, a]) => { setStats(s); setAnalytics(a) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const revenueData = analytics
    ? analytics.revenue_chart.labels.map((label, i) => ({
        month: label,
        revenue: analytics.revenue_chart.values[i] ?? 0,
      }))
    : []

  const signupData = analytics
    ? analytics.signup_chart.labels.map((label, i) => ({
        month: label,
        newUsers: analytics.signup_chart.values[i] ?? 0,
      }))
    : []

  if (loading) {
    return (
      <div>
        <Sk h="h-9" w="w-40" />
        <div className="mt-1.5"><Sk h="h-4" w="w-56" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-level-2-card">
              <Sk h="h-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg p-6 shadow-level-2-card lg:col-span-2"><Sk h="h-64" /></div>
          <div className="bg-white rounded-lg p-6 shadow-level-2-card"><Sk h="h-64" /></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm font-inter font-semibold text-charcoal mb-1">Failed to load dashboard</p>
          <p className="text-xs font-inter text-mid-gray">{error}</p>
        </div>
      </div>
    )
  }

  const CARDS = [
    { icon: Users,      label: 'Total Users',          value: stats?.total_users ?? 0,              prefix: '',  trend: stats?.user_growth_pct ?? 0, delay: 0    },
    { icon: DollarSign, label: 'Monthly Recurring Rev', value: Math.round(stats?.mrr ?? 0),          prefix: '₹', trend: 12,                           delay: 0.06 },
    { icon: CreditCard, label: 'Active Subscriptions',  value: stats?.active_subscriptions ?? 0,     prefix: '',  trend: 8,                            delay: 0.12 },
    { icon: TrendingUp, label: 'Total Revenue',         value: Math.round(stats?.total_revenue ?? 0), prefix: '₹', trend: null,                         delay: 0.18 },
  ]

  const AXIS_STYLE = { fill: '#898989', fontSize: 11, fontFamily: 'Inter' }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm font-inter text-mid-gray mt-2">
          Platform overview · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {CARDS.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg p-8 shadow-level-2-card"
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-cal-sans font-semibold text-xl text-charcoal">Revenue Growth</h2>
              <p className="font-inter text-sm text-mid-gray mt-1">Monthly revenue (12 months)</p>
            </div>
            <span className="font-inter text-sm font-semibold text-charcoal bg-gray-50 rounded-lg px-3 py-1.5 border border-border-gray">
              ₹{Math.round(stats?.mrr ?? 0).toLocaleString()} MRR
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#242424" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#242424" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#242424" strokeWidth={2} fill="url(#gradRevenue)"
                dot={false} activeDot={{ r: 5, fill: '#242424' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* New Users */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.4 }}
          className="bg-white rounded-lg p-8 shadow-level-2-card"
        >
          <h2 className="font-cal-sans font-semibold text-xl text-charcoal mb-1">New Users</h2>
          <p className="font-inter text-sm text-mid-gray mb-6">Daily signups (30 days)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={signupData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="newUsers" name="Users" fill="#242424" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Active Users (7d)', value: (stats?.active_users    ?? 0).toLocaleString() },
          { label: 'New This Month',    value: (stats?.new_users_month ?? 0).toLocaleString() },
          { label: 'Total Roadmaps',    value: (stats?.total_roadmaps  ?? 0).toLocaleString() },
          { label: 'Tasks Completed',   value: (stats?.tasks_completed ?? 0).toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg p-6 shadow-level-2-card">
            <p className="font-inter text-xs text-mid-gray mb-2">{label}</p>
            <p className="font-cal-sans font-semibold text-2xl text-charcoal">{value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
