import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, AlertCircle, RefreshCw, Search } from 'lucide-react'
import { adminApi } from '../services/api'

function Sk({ h = 'h-4', w = 'w-full' }) {
  return (
    <div className={`${h} ${w} rounded-lg animate-pulse`}
         style={{ background: 'var(--bg-elevated)' }} />
  )
}

const ACTION_COLORS = {
  suspend: 'bg-amber-100 text-amber-700',
  enable:  'bg-emerald-100 text-emerald-700',
  delete:  'bg-red-100 text-red-700',
  cancel:  'bg-orange-100 text-orange-700',
  extend:  'bg-blue-100 text-blue-700',
  toggle:  'bg-purple-100 text-purple-700',
}

export default function Logs() {
  const [loading, setLoading] = useState(true)
  const [logs,    setLogs]    = useState([])
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('')

  function fetchLogs() {
    setLoading(true)
    setError(null)
    adminApi.getLogs(100)
      .then(data => setLogs(data.results))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = filter.trim()
    ? logs.filter(l =>
        l.action_display.toLowerCase().includes(filter.toLowerCase()) ||
        l.admin.toLowerCase().includes(filter.toLowerCase()) ||
        (l.target_user || '').toLowerCase().includes(filter.toLowerCase()) ||
        (l.detail || '').toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
            Admin Logs
          </h1>
          <p className="text-sm font-inter mt-2" style={{ color: 'var(--text-secondary)' }}>
            Audit trail of all admin actions
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-inter transition-colors disabled:opacity-50 hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-bright)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mb-6"
      >
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by action, admin, or user…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-inter outline-none border placeholder-mid-gray"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-4"
                 style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <Sk h="h-4" w="w-24" />
              <Sk h="h-4" w="w-20" />
              <Sk h="h-4" w="w-32" />
              <Sk h="h-4" w="w-48" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-inter font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Failed to load logs
            </p>
            <p className="text-xs font-inter" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={fetchLogs} className="mt-4 text-xs font-inter underline"
                    style={{ color: 'var(--text-secondary)' }}>
              Retry
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ScrollText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
            <p className="text-sm font-inter" style={{ color: 'var(--text-secondary)' }}>
              {filter ? 'No logs match your filter.' : 'No admin actions recorded yet.'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[140px_120px_160px_1fr_160px] gap-4 px-6 py-3 text-[11px] font-inter font-semibold uppercase tracking-widest"
            style={{
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Time</span>
            <span>Action</span>
            <span>Admin</span>
            <span>Detail</span>
            <span>Target</span>
          </div>

          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.015 }}
              className="grid grid-cols-[140px_120px_160px_1fr_160px] gap-4 px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors"
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}
            >
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                {log.created_at}
              </span>
              <span>
                <span className={`text-xs font-inter font-medium px-2 py-0.5 rounded-full ${
                  ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'
                }`}>
                  {log.action_display}
                </span>
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-primary)' }}>
                {log.admin}
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-secondary)' }}>
                {log.detail || '—'}
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-secondary)' }}>
                {log.target_user || '—'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs font-inter mt-4" style={{ color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {logs.length} entries
        </p>
      )}
    </div>
  )
}
