import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, CreditCard, Calendar, TrendingDown, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

function StatCard({ label, value, color, delay: d }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.3 }}
      className="card p-4"
    >
      <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-display font-bold text-xl" style={{ color }}>{value}</p>
    </motion.div>
  )
}

export default function Subscriptions() {
  const { addToast } = useToast()
  const [subs,    setSubs]    = useState([])
  const [summary, setSummary] = useState({ active: 0, cancelled: 0, grace: 0, mrr: 0, arr: 0 })
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter,   setPlanFilter]   = useState('')
  const [selected, setSelected] = useState(null)
  const [total,    setTotal]    = useState(0)

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page_size: 50 }
      if (search) params.q = search
      if (statusFilter) params.status = statusFilter
      if (planFilter)   params.plan   = planFilter
      const data = await adminApi.getSubscriptions(params)
      setSubs(data.results)
      setSummary(data.summary)
      setTotal(data.total)
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, planFilter]) // eslint-disable-line

  useEffect(() => { fetchSubs() }, [statusFilter, planFilter]) // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(fetchSubs, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  async function cancelSub(id) {
    try {
      await adminApi.subscriptionAction(id, 'cancel')
      addToast('Subscription cancelled.', 'warning')
      setSelected(null)
      fetchSubs()
    } catch (e) {
      addToast(e.message, 'error')
    }
  }

  const STATUSES = ['', 'active', 'cancelled', 'grace', 'expired']
  const PLANS    = ['', 'Explorer', 'Starter', 'Career Ready', 'Placement Pro']

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Subscriptions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} total subscriptions</p>
        </div>
        <button onClick={fetchSubs} className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} />
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Active Subs"   value={summary.active}                        color="var(--accent)"  delay={0}    />
        <StatCard label="Monthly MRR"   value={`₹${Math.round(summary.mrr).toLocaleString()}`} color="#6366F1" delay={0.06} />
        <StatCard label="Cancelled"     value={summary.cancelled}                     color="#EF4444"        delay={0.12} />
        <StatCard label="ARR Estimate"  value={`₹${Math.round(summary.arr).toLocaleString()}`} color="#22C55E" delay={0.18} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card p-4 mb-4 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user email…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            onFocus={e  => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
            onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <FilterChips options={STATUSES} active={statusFilter} onChange={setStatusFilter} color="#6366F1" />
        <FilterChips options={PLANS}    active={planFilter}   onChange={setPlanFilter}   color="var(--accent)" />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User','Plan','Status','Billing','Amount/mo','End Date','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i => <SkRow key={i} />)
                : subs.slice(0, 20).map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className="row-hover"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sub.user_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.user_email}</p>
                    </td>
                    <td className="px-4 py-3"><Badge type="plan" value={sub.plan} /></td>
                    <td className="px-4 py-3"><Badge type="status" value={sub.status} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-lg capitalize"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                        {sub.billing_cycle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        ₹{Math.round(sub.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{sub.end_date}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(sub)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Subscription Details" width="max-w-lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <CreditCard size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.user_name}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.user_email}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge type="plan" value={selected.plan} />
                <Badge type="status" value={selected.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Sub ID',    `#${selected.id}`],
                ['Billing',   selected.billing_cycle],
                ['Amount',    `₹${Math.round(selected.amount)}/mo`],
                ['Start',     selected.start_date],
                ['End Date',  selected.end_date],
                ['MRR',       `₹${Math.round(selected.mrr)}`],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>

            {selected.payment_history?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                  Payment History
                </p>
                <div className="flex flex-col gap-1.5">
                  {selected.payment_history.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{ background: 'var(--bg-elevated)' }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.date}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>₹{p.amount}</span>
                      <Badge type="status" value={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === 'active' && (
              <Button variant="danger" size="sm" icon={<TrendingDown size={13} />}
                onClick={() => cancelSub(selected.id)}>
                Cancel Subscription
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function FilterChips({ options, active, onChange, color }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {options.map(o => (
        <button key={o || 'all'}
          onClick={() => onChange(o)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize"
          style={{
            background: active === o ? `${color}20` : 'var(--bg-elevated)',
            border:     active === o ? `1px solid ${color}50` : '1px solid var(--border)',
            color:      active === o ? color : 'var(--text-muted)',
          }}
        >{o || 'All'}</button>
      ))}
    </div>
  )
}

function SkRow() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {[120, 70, 80, 70, 60, 90, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-3.5 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}
