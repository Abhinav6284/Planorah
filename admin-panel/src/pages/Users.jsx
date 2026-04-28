import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, UserX, Trash2, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const PAGE_SIZE = 20

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkRow() {
  return (
    <tr>
      {[180, 200, 80, 80, 100, 60].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Action menu item ─────────────────────────────────────────────────────────
function ActionItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-charcoal hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Pagination button ────────────────────────────────────────────────────────
function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-inter font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? 'bg-charcoal text-white'
          : 'bg-white text-mid-gray border border-border-gray hover:border-charcoal hover:text-charcoal'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-inter font-medium transition-all cursor-pointer ${
        active
          ? 'bg-charcoal text-white'
          : 'bg-white text-mid-gray border border-border-gray hover:border-charcoal hover:text-charcoal'
      }`}
    >
      {label || 'All'}
    </button>
  )
}

export default function Users() {
  const { addToast } = useToast()
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [search,       setSearch]       = useState('')
  const [planFilter,   setPlanFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)
  const [menuId,       setMenuId]       = useState(null)

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const p = { page, page_size: PAGE_SIZE, ...params }
      if (search)       p.q      = search
      if (planFilter)   p.plan   = planFilter
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

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers({ page: 1 }) }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  async function suspendUser(id) {
    try {
      await adminApi.userAction(id, 'suspend')
      addToast('User suspended.', 'warning')
      setMenuId(null); setSelected(null); fetchUsers()
    } catch (e) { addToast(e.message, 'error') }
  }

  async function enableUser(id) {
    try {
      await adminApi.userAction(id, 'enable')
      addToast('User re-enabled.', 'success')
      setMenuId(null); setSelected(null); fetchUsers()
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

  const PLANS    = ['', 'Free', 'Explorer', 'Starter', 'Career Ready', 'Placement Pro']
  const STATUSES = ['', 'active', 'suspended', 'pending']

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-end justify-between"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">Users</h1>
          <p className="text-sm font-inter text-mid-gray mt-2">
            {total} user{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="p-2.5 rounded-lg border border-border-gray text-mid-gray hover:text-charcoal hover:border-charcoal transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-lg p-4 shadow-level-2-card mb-4 flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-inter outline-none border border-border-gray text-charcoal placeholder-mid-gray focus:border-charcoal transition-colors bg-white"
          />
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-mid-gray" />
          {PLANS.map(p => (
            <FilterChip key={p || 'all-plan'} label={p || 'All'} active={planFilter === p} onClick={() => { setPlanFilter(p); setPage(1) }} />
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <FilterChip key={s || 'all-status'} label={s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1) }} />
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="bg-white rounded-lg shadow-level-2-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-gray">
                {['User', 'Email', 'Status', 'Plan', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-inter font-semibold uppercase tracking-wide text-mid-gray">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0, 1, 2, 3, 4].map(i => <SkRow key={i} />)
                : users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="row-hover border-b border-border-gray last:border-b-0 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <p className="text-sm font-inter font-medium text-charcoal">{user.name}</p>
                            <p className="text-xs text-mid-gray font-inter">#{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-mid-gray">{user.email}</td>
                      <td className="px-6 py-4"><Badge type="status" value={user.status} /></td>
                      <td className="px-6 py-4"><Badge type="plan" value={user.plan} /></td>
                      <td className="px-6 py-4 text-sm font-inter text-mid-gray">{user.last_login}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 relative">
                          <button
                            onClick={() => setSelected(user)}
                            className="p-1.5 rounded-lg text-mid-gray hover:text-charcoal hover:bg-gray-50 transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setMenuId(menuId === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg text-mid-gray hover:text-charcoal hover:bg-gray-50 transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          <AnimatePresence>
                            {menuId === user.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setMenuId(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                                  animate={{ opacity: 1, scale: 1,    y: 0  }}
                                  exit={{   opacity: 0, scale: 0.94, y: -4 }}
                                  transition={{ duration: 0.14 }}
                                  className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden shadow-level-2-card z-30 w-40 bg-white"
                                >
                                  {user.status === 'active'
                                    ? <ActionItem icon={<UserX size={13} />}  label="Suspend" onClick={() => suspendUser(user.id)} />
                                    : <ActionItem icon={<UserX size={13} />}  label="Enable"  onClick={() => enableUser(user.id)} />
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
          <div className="px-6 py-4 flex items-center justify-between border-t border-border-gray">
            <p className="text-xs font-inter text-mid-gray">
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

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 pb-4 border-b border-border-gray">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold bg-charcoal text-white">
                {selected.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-inter font-semibold text-charcoal">{selected.name}</p>
                <p className="text-sm font-inter text-mid-gray">{selected.email}</p>
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
                <div key={k} className="p-3 rounded-lg bg-gray-50 border border-border-gray">
                  <p className="text-xs font-inter text-mid-gray mb-1">{k}</p>
                  <p className="text-sm font-inter font-medium text-charcoal capitalize">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              {selected.status === 'active'
                ? <Button variant="secondary" size="sm" icon={<UserX size={13} />} onClick={() => suspendUser(selected.id)} className="flex-1">Suspend</Button>
                : <Button variant="primary"   size="sm" icon={<UserX size={13} />} onClick={() => enableUser(selected.id)}  className="flex-1">Enable</Button>
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
