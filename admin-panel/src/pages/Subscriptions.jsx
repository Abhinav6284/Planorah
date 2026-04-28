import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, CreditCard, Calendar, TrendingDown, RefreshCw, ArrowUpRight } from 'lucide-react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.3 }}
      className="bg-white rounded-lg p-6 shadow-level-2-card"
    >
      <p className="text-xs font-inter text-mid-gray mb-2">{label}</p>
      <p className="font-cal-sans font-semibold text-2xl text-charcoal tracking-tight">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs font-inter text-mid-gray">
          <ArrowUpRight size={12} />
          {trend}
        </div>
      )}
    </motion.div>
  )
}

// ─── Filter chips ─────────────────────────────────────────────────────────────
function FilterChips({ options, active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={o || 'all'}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-lg text-xs font-inter font-medium transition-all cursor-pointer capitalize ${
            active === o
              ? 'bg-charcoal text-white'
              : 'bg-white text-mid-gray border border-border-gray hover:border-charcoal hover:text-charcoal'
          }`}
        >
          {o || 'All'}
        </button>
      ))}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkRow() {
  return (
    <tr>
      {[160, 80, 80, 80, 80, 100, 60].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Subscriptions() {
  const { addToast } = useToast()
  const [subs,         setSubs]         = useState([])
  const [summary,      setSummary]      = useState({ active: 0, cancelled: 0, grace: 0, mrr: 0, arr: 0 })
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter,   setPlanFilter]   = useState('')
  const [selected,     setSelected]     = useState(null)
  const [total,        setTotal]        = useState(0)

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page_size: 50 }
      if (search)       params.q      = search
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-end justify-between"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">Subscriptions</h1>
          <p className="text-sm font-inter text-mid-gray mt-2">{total} total subscriptions</p>
        </div>
        <button
          onClick={fetchSubs}
          className="p-2.5 rounded-lg border border-border-gray text-mid-gray hover:text-charcoal hover:border-charcoal transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Active Subscriptions" value={summary.active}                                    delay={0}    />
        <StatCard label="Monthly MRR"          value={`₹${Math.round(summary.mrr).toLocaleString()}`}   delay={0.06} />
        <StatCard label="Cancelled"            value={summary.cancelled}                                 delay={0.12} />
        <StatCard label="ARR Estimate"         value={`₹${Math.round(summary.arr).toLocaleString()}`}   delay={0.18} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-4 shadow-level-2-card mb-4 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-inter outline-none border border-border-gray text-charcoal placeholder-mid-gray focus:border-charcoal transition-colors bg-white"
          />
        </div>
        <FilterChips options={STATUSES} active={statusFilter} onChange={setStatusFilter} />
        <FilterChips options={PLANS}    active={planFilter}   onChange={setPlanFilter}   />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-lg shadow-level-2-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-gray">
                {['User', 'Plan', 'Status', 'Billing', 'Amount/mo', 'End Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-inter font-semibold uppercase tracking-wide text-mid-gray">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0, 1, 2, 3, 4].map(i => <SkRow key={i} />)
                : subs.slice(0, 20).map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="row-hover border-b border-border-gray last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-inter font-medium text-charcoal">{sub.user_name}</p>
                        <p className="text-xs font-inter text-mid-gray">{sub.user_email}</p>
                      </td>
                      <td className="px-6 py-4"><Badge type="plan"   value={sub.plan}   /></td>
                      <td className="px-6 py-4"><Badge type="status" value={sub.status} /></td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-inter px-2.5 py-1 rounded-lg capitalize bg-gray-50 text-mid-gray border border-border-gray">
                          {sub.billing_cycle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-inter font-semibold text-charcoal">
                          ₹{Math.round(sub.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-mid-gray">{sub.end_date}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelected(sub)}
                          className="text-xs font-inter px-3 py-1.5 rounded-lg border border-border-gray text-mid-gray hover:border-charcoal hover:text-charcoal transition-colors bg-white"
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
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 pb-4 border-b border-border-gray">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-border-gray">
                <CreditCard size={18} className="text-mid-gray" />
              </div>
              <div>
                <p className="font-inter font-semibold text-charcoal">{selected.user_name}</p>
                <p className="text-sm font-inter text-mid-gray">{selected.user_email}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge type="plan"   value={selected.plan}   />
                <Badge type="status" value={selected.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Sub ID',   `#${selected.id}`],
                ['Billing',  selected.billing_cycle],
                ['Amount',   `₹${Math.round(selected.amount)}/mo`],
                ['Start',    selected.start_date],
                ['End Date', selected.end_date],
                ['MRR',      `₹${Math.round(selected.mrr)}`],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-gray-50 border border-border-gray">
                  <p className="text-xs font-inter text-mid-gray mb-1">{k}</p>
                  <p className="text-sm font-inter font-medium text-charcoal capitalize">{v}</p>
                </div>
              ))}
            </div>

            {selected.payment_history?.length > 0 && (
              <div>
                <p className="text-xs font-inter font-semibold uppercase tracking-wide text-mid-gray mb-2">
                  Payment History
                </p>
                <div className="flex flex-col gap-1.5">
                  {selected.payment_history.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 border border-border-gray">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-mid-gray" />
                        <span className="text-xs font-inter text-mid-gray">{p.date}</span>
                      </div>
                      <span className="text-xs font-inter font-semibold text-charcoal">₹{p.amount}</span>
                      <Badge type="status" value={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === 'active' && (
              <Button variant="danger" size="sm" icon={<TrendingDown size={13} />} onClick={() => cancelSub(selected.id)}>
                Cancel Subscription
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
