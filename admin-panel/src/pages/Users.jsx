import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronLeft, ChevronRight, Eye, UserX, Trash2, MoreHorizontal, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const PAGE_SIZE = 20

function Sk() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded-md" style={{ width: `${50 + i*8}%` }} />
        </td>
      ))}
    </tr>
  )
}

function Avatar({ user }) {
  const colors = ['#6366F1','#F59E0B','#22C55E','#EC4899','#3B82F6','#8B5CF6']
  const color = colors[(user.name.charCodeAt(0) || 0) % colors.length]
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: color, color: '#080A0F' }}
    >
      {user.name[0]?.toUpperCase()}
    </div>
  )
}

export default function Users() {
  const { addToast } = useToast()
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search,     setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [menuId,     setMenuId]     = useState(null)

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const p = { page, page_size: PAGE_SIZE, ...params }
      if (search) p.q = search
      if (planFilter) p.plan = planFilter
      if (statusFilter) p.status = statusFilter
      const data = await adminApi.getUsers(p)
      setUsers(data.results)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, planFilter, statusFilter]) // eslint-disable-line

  useEffect(() => { fetchUsers() }, [page, planFilter, statusFilter]) // eslint-disable-line

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers({ page: 1 }) }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  async function suspendUser(id) {
    try {
      await adminApi.userAction(id, 'suspend')
      addToast('User suspended.', 'warning')
      setMenuId(null)
      setSelected(null)
      fetchUsers()
    } catch (e) { addToast(e.message, 'error') }
  }

  async function enableUser(id) {
    try {
      await adminApi.userAction(id, 'enable')
      addToast('User re-enabled.', 'success')
      setMenuId(null)
      setSelected(null)
      fetchUsers()
    } catch (e) { addToast(e.message, 'error') }
  }

  async function deleteUser(id) {
    try {
      await adminApi.userAction(id, 'delete')
      addToast('User deleted.', 'error')
      setMenuId(null)
      if (selected?.id === id) setSelected(null)
      fetchUsers()
    } catch (e) { addToast(e.message, 'error') }
  }

  const PLANS   = ['', 'Free', 'Explorer', 'Starter', 'Career Ready', 'Placement Pro']
  const STATUSES = ['', 'active', 'suspended', 'pending']

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {total} user{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => fetchUsers()} className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} />
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-4 mb-4 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            onFocus={e  => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
            onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter size={12} style={{ color: 'var(--text-muted)' }} />
          {PLANS.map(p => (
            <button
              key={p || 'all'}
              onClick={() => { setPlanFilter(p); setPage(1) }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: planFilter === p ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)',
                border:     planFilter === p ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                color:      planFilter === p ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >{p || 'All'}</button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {STATUSES.map(s => (
            <button
              key={s || 'all'}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize"
              style={{
                background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                border:     statusFilter === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                color:      statusFilter === s ? '#818CF8' : 'var(--text-muted)',
              }}
            >{s || 'All'}</button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User','Email','Status','Plan','Last Login','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i => <Sk key={i} />)
                : users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="row-hover group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={user} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-4 py-3"><Badge type="status" value={user.status} /></td>
                    <td className="px-4 py-3"><Badge type="plan" value={user.plan} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{user.last_login}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 relative">
                        <button
                          onClick={() => setSelected(user)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setMenuId(menuId === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        <AnimatePresence>
                          {menuId === user.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                animate={{ opacity: 1, scale: 1,    y: 0  }}
                                exit={{    opacity: 0, scale: 0.92, y: -4 }}
                                transition={{ duration: 0.14 }}
                                className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-2xl z-30 w-40"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)' }}
                              >
                                {user.status === 'active'
                                  ? <ActionItem icon={<UserX size={13} />} label="Suspend" onClick={() => suspendUser(user.id)} />
                                  : <ActionItem icon={<UserX size={13} />} label="Enable"  onClick={() => enableUser(user.id)} />
                                }
                                <ActionItem icon={<Trash2 size={13} />} label="Delete" onClick={() => deleteUser(user.id)} danger />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <PagBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </PagBtn>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = i + 1
                return <PagBtn key={n} active={page === n} onClick={() => setPage(n)}>{n}</PagBtn>
              })}
              <PagBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </PagBtn>
            </div>
          </div>
        )}
      </motion.div>

      {/* User detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{ background: '#6366F1', color: '#080A0F' }}>
                {selected.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.email}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge type="status" value={selected.status} />
                <Badge type="plan"   value={selected.plan}   />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['ID',         `#${selected.id}`],
                ['Username',   selected.username],
                ['Joined',     selected.joined_at],
                ['Last Login', selected.last_login],
                ['XP',         (selected.xp ?? 0).toLocaleString()],
                ['Country',    selected.country || '—'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {selected.status === 'active'
                ? <Button variant="danger" size="sm" icon={<UserX size={13} />} onClick={() => suspendUser(selected.id)} className="flex-1">Suspend</Button>
                : <Button variant="primary" size="sm" icon={<UserX size={13} />} onClick={() => enableUser(selected.id)} className="flex-1">Enable</Button>
              }
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => deleteUser(selected.id)} className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ActionItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer"
      style={{ color: danger ? '#EF4444' : 'var(--text-secondary)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}{label}
    </button>
  )
}

function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? 'var(--accent)' : 'var(--bg-elevated)',
        color:      active ? '#080A0F' : 'var(--text-secondary)',
        border:     active ? 'none' : '1px solid var(--border)',
      }}
    >{children}</button>
  )
}
