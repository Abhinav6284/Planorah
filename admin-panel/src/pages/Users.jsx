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

const ONBOARDING_DATA_FIELDS = [
  { key: 'life_stage', label: 'Life Stage', type: 'select', options: ['school', 'college', 'working', 'other'] },
  { key: 'daily_time', label: 'Daily Time', type: 'select', options: ['<1_hr', '1_2hrs', '2_3hrs', '3_5hrs', '5+_hrs'] },
  { key: 'school_class', label: 'School Class', type: 'text', placeholder: '10' },
  { key: 'school_stream', label: 'School Stream', type: 'text', placeholder: 'science' },
  { key: 'college_year', label: 'College Year', type: 'text', placeholder: '2nd_year' },
  { key: 'college_focus', label: 'College Focus', type: 'text', placeholder: 'placements' },
  { key: 'drop_year', label: 'Drop Year', type: 'text', placeholder: '2026' },
]

const DEFAULT_ONBOARDING_DATA = ONBOARDING_DATA_FIELDS.reduce((acc, field) => {
  acc[field.key] = ''
  return acc
}, {})

function asText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

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
          <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" style={{ width: w }} />
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
        danger ? 'text-red-600 hover:bg-[var(--bg-elevated)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
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
          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-charcoal hover:text-[var(--text-primary)]'
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
          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-charcoal hover:text-[var(--text-primary)]'
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
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingOnboarding, setSavingOnboarding] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    education_stage: '',
    validation_mode: 'automatic',
    weekly_hours: 5,
    goal_statement: '',
    onboarding_accepted_terms: false,
    onboarding_data: { ...DEFAULT_ONBOARDING_DATA },
    onboarding_extra: [{ key: '', value: '' }],
  })

  function hydrateOnboardingForm(data = {}) {
    const onboardingData = data.onboarding_data && typeof data.onboarding_data === 'object'
      ? data.onboarding_data
      : {}

    const knownData = { ...DEFAULT_ONBOARDING_DATA }
    const extraData = []

    Object.entries(onboardingData).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(knownData, key)) {
        knownData[key] = asText(value)
      } else {
        extraData.push({ key, value: asText(value) })
      }
    })

    setOnboardingForm({
      education_stage: data.education_stage || '',
      validation_mode: data.validation_mode || 'automatic',
      weekly_hours: Number.isFinite(Number(data.weekly_hours)) ? Number(data.weekly_hours) : 5,
      goal_statement: data.goal_statement || '',
      onboarding_accepted_terms: !!data.onboarding_accepted_terms,
      onboarding_data: knownData,
      onboarding_extra: extraData.length ? extraData : [{ key: '', value: '' }],
    })
  }

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

  async function openUserDetails(user) {
    setSelected(user)
    setDetailLoading(true)
    try {
      const detail = await adminApi.getUserDetail(user.id)
      setSelected(detail)
      hydrateOnboardingForm(detail.onboarding || {})
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  async function saveOnboardingAnswers() {
    if (!selected?.id) return

    const parsedOnboardingData = {}

    Object.entries(onboardingForm.onboarding_data || {}).forEach(([key, value]) => {
      const normalizedValue = asText(value).trim()
      if (normalizedValue) parsedOnboardingData[key] = normalizedValue
    })

    ;(onboardingForm.onboarding_extra || []).forEach(({ key, value }) => {
      const normalizedKey = asText(key).trim()
      if (!normalizedKey) return
      parsedOnboardingData[normalizedKey] = asText(value).trim()
    })

    setSavingOnboarding(true)
    try {
      const payload = {
        education_stage: onboardingForm.education_stage || null,
        validation_mode: onboardingForm.validation_mode || 'automatic',
        weekly_hours: Number(onboardingForm.weekly_hours) || 0,
        goal_statement: onboardingForm.goal_statement || '',
        onboarding_accepted_terms: onboardingForm.onboarding_accepted_terms,
        onboarding_data: parsedOnboardingData,
      }

      const res = await adminApi.updateUserOnboarding(selected.id, payload)
      const updatedOnboarding = res.onboarding || payload
      setSelected(prev => ({
        ...prev,
        onboarding: updatedOnboarding,
      }))
      hydrateOnboardingForm(updatedOnboarding)
      addToast('Onboarding answers saved successfully.', 'success')
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setSavingOnboarding(false)
    }
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
          <h1 className="font-cal-sans font-semibold text-4xl text-[var(--text-primary)] tracking-tight">Users</h1>
          <p className="text-sm font-inter text-[var(--text-secondary)] mt-2">
            {total} user{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-charcoal transition-colors"
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
        className="bg-[var(--bg-card)] rounded-lg p-4 shadow-level-2-card mb-4 flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-charcoal transition-colors bg-[var(--bg-card)]"
          />
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-[var(--text-secondary)]" />
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
        className="bg-[var(--bg-card)] rounded-lg shadow-level-2-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['User', 'Email', 'Status', 'Plan', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-inter font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
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
                      className="row-hover border-b border-[var(--border)] last:border-b-0 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <p className="text-sm font-inter font-medium text-[var(--text-primary)]">{user.name}</p>
                            <p className="text-xs text-[var(--text-secondary)] font-inter">#{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-[var(--text-secondary)]">{user.email}</td>
                      <td className="px-6 py-4"><Badge type="status" value={user.status} /></td>
                      <td className="px-6 py-4"><Badge type="plan" value={user.plan} /></td>
                      <td className="px-6 py-4 text-sm font-inter text-[var(--text-secondary)]">{user.last_login}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 relative">
                          <button
                            onClick={() => openUserDetails(user)}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setMenuId(menuId === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
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
                                  className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden shadow-level-2-card z-30 w-40 bg-[var(--bg-card)]"
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
          <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--border)]">
            <p className="text-xs font-inter text-[var(--text-secondary)]">
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
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details" width="max-w-6xl">
        {selected && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4 flex flex-col gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold bg-charcoal text-white">
                    {selected.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-inter font-semibold text-[var(--text-primary)] truncate">{selected.name}</p>
                    <p className="text-xs font-inter text-[var(--text-secondary)] truncate">{selected.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge type="status" value={selected.status} />
                  <Badge type="plan" value={selected.plan} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['ID', `#${selected.id}`],
                  ['Username', selected.username],
                  ['Joined', selected.joined_at],
                  ['Last Login', selected.last_login],
                  ['XP', (selected.xp ?? 0).toLocaleString()],
                  ['Country', selected.country || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
                    <p className="text-[11px] leading-4 font-inter uppercase tracking-wide text-[var(--text-secondary)]">{k}</p>
                    <p className="mt-1 text-sm leading-5 font-inter font-medium text-[var(--text-primary)] break-words">{v}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {selected.status === 'active'
                  ? <Button variant="secondary" size="sm" icon={<UserX size={13} />} onClick={() => suspendUser(selected.id)} className="w-full">Suspend</Button>
                  : <Button variant="primary" size="sm" icon={<UserX size={13} />} onClick={() => enableUser(selected.id)} className="w-full">Enable</Button>
                }
                <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => deleteUser(selected.id)} className="w-full">
                  Delete
                </Button>
              </div>
            </div>

            <div className="xl:col-span-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-inter font-semibold text-[var(--text-primary)]">Onboarding Questions</h3>
                {selected.onboarding?.onboarding_complete && (
                  <Badge type="status" value="active" />
                )}
              </div>

              {detailLoading ? (
                <p className="text-sm font-inter text-[var(--text-secondary)]">Loading onboarding details...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-inter text-[var(--text-secondary)]">Education Stage</label>
                      <input
                        value={onboardingForm.education_stage}
                        onChange={e => setOnboardingForm(prev => ({ ...prev, education_stage: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                        placeholder="undergraduate"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-inter text-[var(--text-secondary)]">Validation Mode</label>
                      <select
                        value={onboardingForm.validation_mode}
                        onChange={e => setOnboardingForm(prev => ({ ...prev, validation_mode: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                      >
                        <option value="automatic">automatic</option>
                        <option value="manual">manual</option>
                        <option value="mixed">mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-inter text-[var(--text-secondary)]">Weekly Hours</label>
                      <input
                        type="number"
                        min="0"
                        value={onboardingForm.weekly_hours}
                        onChange={e => setOnboardingForm(prev => ({ ...prev, weekly_hours: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm font-inter text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={onboardingForm.onboarding_accepted_terms}
                          onChange={e => setOnboardingForm(prev => ({ ...prev, onboarding_accepted_terms: e.target.checked }))}
                        />
                        Accepted Terms
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-inter text-[var(--text-secondary)]">Goal Statement</label>
                    <input
                      value={onboardingForm.goal_statement}
                      onChange={e => setOnboardingForm(prev => ({ ...prev, goal_statement: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                      placeholder="Student goal statement"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-inter text-[var(--text-secondary)]">Onboarding Answers</label>
                    <div className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ONBOARDING_DATA_FIELDS.map(field => (
                          <div key={field.key}>
                            <label className="text-[11px] font-inter uppercase tracking-wide text-[var(--text-secondary)]">
                              {field.label}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                value={onboardingForm.onboarding_data[field.key] || ''}
                                onChange={e => setOnboardingForm(prev => ({
                                  ...prev,
                                  onboarding_data: {
                                    ...prev.onboarding_data,
                                    [field.key]: e.target.value,
                                  },
                                }))}
                                className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                              >
                                <option value="">Select</option>
                                {field.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={onboardingForm.onboarding_data[field.key] || ''}
                                onChange={e => setOnboardingForm(prev => ({
                                  ...prev,
                                  onboarding_data: {
                                    ...prev.onboarding_data,
                                    [field.key]: e.target.value,
                                  },
                                }))}
                                className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                                placeholder={field.placeholder || ''}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <p className="text-[11px] font-inter uppercase tracking-wide text-[var(--text-secondary)] mb-2">Additional Answers</p>
                        <div className="flex flex-col gap-2">
                          {(onboardingForm.onboarding_extra || []).map((row, index) => (
                            <div key={`extra-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                              <input
                                value={row.key}
                                onChange={e => setOnboardingForm(prev => ({
                                  ...prev,
                                  onboarding_extra: prev.onboarding_extra.map((item, i) => (
                                    i === index ? { ...item, key: e.target.value } : item
                                  )),
                                }))}
                                className="w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                                placeholder="field_key"
                              />
                              <input
                                value={row.value}
                                onChange={e => setOnboardingForm(prev => ({
                                  ...prev,
                                  onboarding_extra: prev.onboarding_extra.map((item, i) => (
                                    i === index ? { ...item, value: e.target.value } : item
                                  )),
                                }))}
                                className="w-full px-3 py-2 rounded-lg text-sm font-inter outline-none border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                                placeholder="value"
                              />
                              <button
                                type="button"
                                onClick={() => setOnboardingForm(prev => ({
                                  ...prev,
                                  onboarding_extra: prev.onboarding_extra.length === 1
                                    ? [{ key: '', value: '' }]
                                    : prev.onboarding_extra.filter((_, i) => i !== index),
                                }))}
                                className="px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-red-600 hover:border-red-300 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setOnboardingForm(prev => ({
                              ...prev,
                              onboarding_extra: [...(prev.onboarding_extra || []), { key: '', value: '' }],
                            }))}
                            className="self-start px-3 py-1.5 rounded-lg text-xs font-inter font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-charcoal transition-colors"
                          >
                            Add Field
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={saveOnboardingAnswers}
                      disabled={savingOnboarding}
                      className="w-full md:w-auto"
                    >
                      {savingOnboarding ? 'Saving...' : 'Save Onboarding Answers'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
