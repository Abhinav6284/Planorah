import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../services/api'
import { TrendingUp, Users, Activity, Target, ArrowUpRight } from 'lucide-react'

const RANGES       = ['3M', '6M', '12M']
const RANGE_MONTHS = { '3M': 3, '6M': 6, '12M': 12 }
const AXIS_STYLE   = { fill: '#898989', fontSize: 11, fontFamily: 'Inter' }

// ─── Tooltip ──────────────────────────────────────────────────────────────────
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

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, delta, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.3 }}
      className="bg-white rounded-lg p-6 shadow-level-2-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-charcoal text-white flex items-center justify-center">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <span className="flex items-center gap-1 text-xs font-inter font-medium text-charcoal bg-gray-50 px-2 py-1 rounded-lg border border-border-gray">
          <ArrowUpRight size={12} />
          {delta}
        </span>
      </div>
      <p className="font-cal-sans font-semibold text-2xl text-charcoal mb-1 tracking-tight">{value}</p>
      <p className="text-xs font-inter text-mid-gray">{label}</p>
    </motion.div>
  )
}

// ─── Chart card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.35 }}
      className="bg-white rounded-lg p-8 shadow-level-2-card"
    >
      <div className="mb-6">
        <h2 className="font-cal-sans font-semibold text-xl text-charcoal">{title}</h2>
        {subtitle && <p className="text-sm font-inter text-mid-gray mt-1">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ h = 'h-48' }) {
  return <div className={`${h} bg-gray-100 rounded-lg animate-pulse`} />
}

export default function Analytics() {
  const [range,   setRange]   = useState('12M')
  const [loading, setLoading] = useState(true)
  const [data,    setData]    = useState(null)

  useEffect(() => {
    setLoading(true)
    adminApi.getAnalytics(RANGE_MONTHS[range], 30)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const revenueData = data
    ? data.revenue_chart.labels.map((label, i) => ({
        month:   label,
        revenue: data.revenue_chart.values[i] ?? 0,
        subs:    data.sub_growth.values[i] ?? 0,
      }))
    : []

  const signupData = data
    ? data.signup_chart.labels.map((label, i) => ({
        month:    label,
        newUsers: data.signup_chart.values[i] ?? 0,
        dau:      data.dau_chart.values[i] ?? 0,
      }))
    : []

  const revSlice = revenueData.slice(-RANGE_MONTHS[range])
  const mrr   = data?.mrr              ?? 0
  const arr   = data?.arr              ?? 0
  const churn = data?.churn_rate       ?? 0
  const conv  = data?.conversion_rate  ?? 0

  const gradDefs = (id, color) => (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor={color} stopOpacity={0.10} />
        <stop offset="95%" stopColor={color} stopOpacity={0}    />
      </linearGradient>
    </defs>
  )

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-end justify-between"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">Analytics</h1>
          <p className="text-sm font-inter text-mid-gray mt-2">Platform growth and revenue metrics</p>
        </div>

        {/* Range picker */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-50 border border-border-gray">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-inter font-medium transition-all cursor-pointer ${
                range === r
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-mid-gray hover:text-charcoal'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard icon={TrendingUp} label="MRR"          value={`₹${Math.round(mrr).toLocaleString()}`}  delta={`${conv}% conv`}  delay={0}    />
        <MetricCard icon={Users}      label="ARR Estimate" value={`₹${Math.round(arr).toLocaleString()}`}  delta="Annualised"        delay={0.06} />
        <MetricCard icon={Activity}   label="Churn Rate"   value={`${churn}%`}                              delta="This month"        delay={0.12} />
        <MetricCard icon={Target}     label="Conversion"   value={`${conv}%`}                               delta="Paid users"        delay={0.18} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue (INR)" delay={0.24}>
          {loading ? <Sk /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revSlice} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                {gradDefs('gRev', '#242424')}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#242424" strokeWidth={2} fill="url(#gRev)"
                  dot={false} activeDot={{ r: 4, fill: '#242424' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Subscription Growth" subtitle="New subscriptions per month" delay={0.28}>
          {loading ? <Sk /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revSlice} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                {gradDefs('gSubs', '#242424')}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="subs" name="Subscriptions"
                  stroke="#242424" strokeWidth={2} fill="url(#gSubs)"
                  dot={false} activeDot={{ r: 4, fill: '#242424' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Daily Signups" subtitle="New user registrations (30 days)" delay={0.32}>
          {loading ? <Sk h="h-40" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="newUsers" name="Signups" fill="#242424" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Daily Active Users" subtitle="DAU from streak activity (30 days)" delay={0.36}>
          {loading ? <Sk h="h-40" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={signupData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,42,53,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="dau" name="DAU"
                  stroke="#242424" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: '#242424' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Plan breakdown */}
      {data?.plan_breakdown?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.35 }}
          className="bg-white rounded-lg p-8 shadow-level-2-card"
        >
          <h2 className="font-cal-sans font-semibold text-xl text-charcoal mb-6">
            Active Subscriptions by Plan
          </h2>
          <div className="flex flex-wrap gap-4">
            {data.plan_breakdown.map(pb => (
              <div
                key={pb.plan__name}
                className="flex-1 min-w-[120px] p-5 rounded-lg bg-gray-50 border border-border-gray text-center"
              >
                <p className="font-cal-sans font-semibold text-2xl text-charcoal tracking-tight">{pb.count}</p>
                <p className="text-xs font-inter text-mid-gray mt-1.5">
                  {pb.plan__display_name || pb.plan__name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
