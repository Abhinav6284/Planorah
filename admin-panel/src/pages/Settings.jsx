import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Shield, Bell, Globe, Zap, User } from 'lucide-react'
import { adminApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'

// ─── Toggle switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 focus:outline-none ${
        enabled ? 'bg-charcoal' : 'bg-gray-200'
      }`}
    >
      <motion.span
        animate={{ x: enabled ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`w-4 h-4 rounded-full transition-colors ${enabled ? 'bg-white' : 'bg-mid-gray'}`}
      />
    </button>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-charcoal text-white flex items-center justify-center">
        <Icon size={15} />
      </div>
      <h2 className="font-cal-sans font-semibold text-lg text-charcoal">{title}</h2>
    </div>
  )
}

// ─── Setting row ──────────────────────────────────────────────────────────────
function SettingRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border-gray last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-inter text-charcoal capitalize">{label}</p>
        {description && <p className="text-xs font-inter text-mid-gray mt-0.5">{description}</p>}
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  )
}

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-inter font-semibold uppercase tracking-wide text-mid-gray block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-inter outline-none border border-border-gray text-charcoal placeholder-mid-gray focus:border-charcoal transition-colors bg-white"
      />
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const [loading,       setLoading]       = useState(true)
  const [flags,         setFlags]         = useState([])
  const [name,          setName]          = useState(user?.name  ?? '')
  const [email,         setEmail]         = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [notifications, setNotifications] = useState({
    newSignups:      true,
    paymentFailed:   true,
    subscriptionEnd: true,
    systemAlerts:    true,
  })

  useEffect(() => {
    adminApi.getFlags()
      .then(data => setFlags(data.results))
      .catch(e => addToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  async function toggleFlag(id) {
    try {
      const updated = await adminApi.toggleFlag(id)
      setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: updated.enabled } : f))
      addToast(`Feature flag ${updated.enabled ? 'enabled' : 'disabled'}.`, updated.enabled ? 'success' : 'info')
    } catch (e) {
      addToast(e.message, 'error')
    }
  }

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const parts      = name.trim().split(' ')
      const first_name = parts[0] || ''
      const last_name  = parts.slice(1).join(' ') || ''
      const updated    = await adminApi.updateMe({ first_name, last_name, email })
      updateUser({ name: updated.name, email: updated.email })
      addToast('Profile saved successfully.', 'success')
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const NOTIF_DESCRIPTIONS = {
    newSignups:      'Alert when a new user registers',
    paymentFailed:   'Alert when a payment fails',
    subscriptionEnd: 'Alert before subscriptions expire',
    systemAlerts:    'Critical system notifications',
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">Settings</h1>
        <p className="text-sm font-inter text-mid-gray mt-2">Platform configuration and admin preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Admin profile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-lg p-6 shadow-level-2-card"
          >
            <SectionHeader icon={User} title="Admin Profile" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-border-gray">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-charcoal text-white flex-shrink-0">
                  {user?.name?.[0] ?? 'A'}
                </div>
                <div>
                  <p className="text-sm font-inter font-medium text-charcoal">{user?.name}</p>
                  <p className="text-xs font-inter text-mid-gray capitalize">{user?.role}</p>
                </div>
              </div>
              <InputField label="Display Name" value={name}  onChange={setName}  />
              <InputField label="Email"        value={email} onChange={setEmail} type="email" />
              <Button variant="primary" size="sm" icon={<Save size={13} />} loading={savingProfile} onClick={saveProfile} className="w-full">
                Save Profile
              </Button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-lg p-6 shadow-level-2-card"
          >
            <SectionHeader icon={Bell} title="Notifications" />
            <div>
              {Object.entries(notifications).map(([k, v]) => (
                <SettingRow
                  key={k}
                  label={k.replace(/([A-Z])/g, ' $1').trim()}
                  description={NOTIF_DESCRIPTIONS[k]}
                  enabled={v}
                  onChange={() => setNotifications(prev => ({ ...prev, [k]: !prev[k] }))}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle column — Platform info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white rounded-lg p-6 shadow-level-2-card h-fit"
        >
          <SectionHeader icon={Globe} title="Platform Info" />
          <div className="flex flex-col gap-2">
            {[
              { label: 'Platform',    value: 'Planorah' },
              { label: 'Backend',     value: 'Django + DRF' },
              { label: 'Auth',        value: 'JWT (SimpleJWT)' },
              { label: 'Database',    value: 'PostgreSQL' },
              { label: 'API Base',    value: import.meta.env.VITE_API_URL || 'http://localhost:8000' },
              { label: 'Admin Panel', value: 'React + Vite' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 border-b border-border-gray last:border-b-0">
                <p className="text-xs font-inter text-mid-gray">{label}</p>
                <p className="text-xs font-mono font-medium text-charcoal text-right truncate max-w-[60%]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-border-gray">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={13} className="text-mid-gray" />
              <p className="text-xs font-inter font-semibold text-charcoal">Security</p>
            </div>
            <p className="text-xs font-inter text-mid-gray leading-relaxed">
              All admin API endpoints require JWT Bearer token and{' '}
              <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded text-charcoal font-mono">is_staff=True</code>.
            </p>
          </div>
        </motion.div>

        {/* Right column — Feature flags */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white rounded-lg p-6 shadow-level-2-card h-fit"
        >
          <SectionHeader icon={Zap} title="Feature Flags" />

          {loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="py-8 text-center">
              <Zap size={24} className="text-mid-gray mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-inter text-mid-gray">No feature flags yet.</p>
              <p className="text-xs font-inter text-mid-gray mt-1 opacity-60">
                Create them at <code className="font-mono">/saas-admin/flags/</code>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {flags.map(flag => (
                <motion.div
                  key={flag.id}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.12 }}
                  className={`flex items-start justify-between gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                    flag.enabled
                      ? 'bg-gray-50 border-border-gray'
                      : 'bg-white border-border-gray hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFlag(flag.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter font-medium text-charcoal truncate">{flag.label}</p>
                    <p className="text-xs font-inter text-mid-gray mt-0.5 truncate">{flag.description}</p>
                    <code className="text-[10px] font-mono text-mid-gray opacity-60 mt-0.5 block truncate">
                      {flag.key}
                    </code>
                  </div>
                  <ToggleSwitch enabled={flag.enabled} onChange={() => toggleFlag(flag.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
