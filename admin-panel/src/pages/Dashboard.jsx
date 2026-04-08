import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, DollarSign, CreditCard, TrendingUp,
  UserPlus, Crown, AlertCircle, XCircle, Trash2,
} from 'lucide-react'
import { adminApi } from '../services/api'

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const dur   = 1200
    const step  = ts => {
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

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, prefix, suffix, sub, accentColor, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: d, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="card p-5 relative overflow-hidden cursor-default"
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <Icon size={18} />
        </div>
        {sub && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            {sub}
          </span>
        )}
      </div>
      <p className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
        <Counter target={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </motion.div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs"
      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.name === 'Revenue' ? '₹' : ''}{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

function Sk({ h = 'h-4', w = 'w-full', r = 'rounded-lg' }) {
  return <div className={`skeleton ${h} ${w} ${r}`} />
}

export default function Dashboard() {
  const [loading,  setLoading]  = useState(true)
  const [stats,    setStats]    = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getAnalytics(12, 30)])
      .then(([s, a]) => { setStats(s); setAnalytics(a) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Build chart data arrays from API response
  const revenueData = analytics ? analytics.revenue_chart.labels.map((label, i) => ({
    month: label,
    revenue: analytics.revenue_chart.values[i] ?? 0,
  })) : []

  const signupData = analytics ? analytics.signup_chart.labels.map((label, i) => ({
    month: label,
    newUsers: analytics.signup_chart.values[i] ?? 0,
  })) : []

  if (loading) {
    return (
      <div>
        <Sk h="h-7" w="w-48" r="rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[0,1,2,3].map(i => <div key={i} className="card p-5"><Sk h="h-24" /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="card p-5 lg:col-span-2"><Sk h="h-64" /></div>
          <div className="card p-5"><Sk h="h-64" /></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm font-medium mb-2" style={{ color: '#EF4444' }}>Failed to load dashboard</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    )
  }

  const CARDS = [
    { icon: Users,      label: 'Total Users',           value: stats?.total_users ?? 0,          prefix: '',  accentColor: '#6366F1', sub: `+${stats?.user_growth_pct ?? 0}%`, delay: 0    },
    { icon: DollarSign, label: 'Monthly Recurring Rev',  value: Math.round(stats?.mrr ?? 0),      prefix: '₹', accentColor: '#F59E0B', sub: '↑ MRR',                            delay: 0.06 },
    { icon: CreditCard, label: 'Active Subscriptions',   value: stats?.active_subscriptions ?? 0, prefix: '',  accentColor: '#22C55E', sub: null,                               delay: 0.12 },
    { icon: TrendingUp, label: 'Total Revenue',           value: Math.round(stats?.total_revenue ?? 0), prefix: '₹', accentColor: '#EC4899', sub: null,                         delay: 0.18 },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Platform overview · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {CARDS.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.35 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue Growth</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly revenue (12 mo)</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent)' }}>
              ₹{Math.round(stats?.mrr ?? 0).toLocaleString()} MRR
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#F59E0B" strokeWidth={2} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: '#F59E0B' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* New users bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.35 }}
          className="card p-5"
        >
          <p className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>New Users</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Daily signups (30 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={signupData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
              barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="newUsers" name="Users" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Key stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.35 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Users (7d)', value: (stats?.active_users ?? 0).toLocaleString(), color: '#22C55E' },
          { label: 'New This Month',    value: (stats?.new_users_month ?? 0).toLocaleString(), color: '#6366F1' },
          { label: 'Total Roadmaps',    value: (stats?.total_roadmaps ?? 0).toLocaleString(), color: '#F59E0B' },
          { label: 'Tasks Completed',   value: (stats?.tasks_completed ?? 0).toLocaleString(), color: '#EC4899' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="font-display font-bold text-xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
