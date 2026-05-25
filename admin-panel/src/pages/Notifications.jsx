import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, CircleDot, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'

function timeAgo(iso) {
  if (!iso) return 'just now'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.floor(diff / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function Notifications() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [notifs, setNotifs] = useState([])

  const unreadCount = useMemo(() => notifs.filter(n => !n.is_read).length, [notifs])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const data = await adminApi.getNotifications()
      setNotifs(Array.isArray(data) ? data : [])
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, []) // eslint-disable-line

  async function markOneRead(id) {
    try {
      await adminApi.markNotificationRead(id)
      setNotifs(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)))
      addToast('Notification marked as read.', 'success')
    } catch (e) {
      addToast(e.message, 'error')
    }
  }

  async function markAllRead() {
    const ids = notifs.filter(n => !n.is_read).map(n => n.id)
    if (ids.length === 0) return

    setMarkingAll(true)
    try {
      await Promise.all(ids.map(id => adminApi.markNotificationRead(id)))
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      addToast('All notifications marked as read.', 'success')
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl text-[var(--text-primary)] tracking-tight">Notifications</h1>
          <p className="text-sm font-inter text-[var(--text-secondary)] mt-2">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-charcoal transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCheck size={14} />}
            onClick={markAllRead}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="bg-[var(--bg-card)] rounded-lg shadow-level-2-card overflow-hidden"
      >
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-18 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="py-14 text-center">
            <Bell size={26} className="text-[var(--text-secondary)] mx-auto mb-3" strokeWidth={1.6} />
            <p className="text-sm font-inter text-[var(--text-secondary)]">No notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifs.map(n => (
              <div key={n.id} className="px-5 py-4 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors">
                <CircleDot
                  size={14}
                  className={`mt-1 flex-shrink-0 ${n.is_read ? 'text-[var(--text-secondary)] opacity-30' : 'text-emerald-600'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-inter text-[var(--text-primary)] leading-relaxed">{n.message}</p>
                  <p className="text-xs font-inter text-[var(--text-secondary)] mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markOneRead(n.id)}
                    className="text-xs font-inter font-medium px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-charcoal transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
