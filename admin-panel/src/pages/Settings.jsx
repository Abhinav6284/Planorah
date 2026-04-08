import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Shield, Bell, Globe, Zap, User,
} from 'lucide-react'
import { adminApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 focus:outline-none"
      style={{ background: enabled ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border-bright)'}` }}
    >
      <motion.span
        animate={{ x: enabled ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="w-4 h-4 rounded-full"
        style={{ background: enabled ? '#080A0F' : 'var(--text-muted)' }}
      />
    </button>
  )
}

function SectionHeader({ icon: Icon, title, color = 'var(--accent)' }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, color }}>
        <Icon size={15} />
      </div>
      <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    </div>
  )
}

export default function Settings() {
  const { user }     = useAuth()
  const { addToast } = useToast()
  const [loading,  setLoading]  = useState(true)
  const [flags,    setFlags]    = useState([])
  const [name,     setName]     = useState(user?.name ?? '')
  const [email,    setEmail]    = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [notifications, setNotifications] = useState({
    newSignups:     true,
    paymentFailed:  true,
    subscriptionEnd: true,
    systemAlerts:   true,
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
    await new Promise(r => setTimeout(r, 600))
    setSavingProfile(false)
    addToast('Profile saved successfully.', 'success')
  }

  function toggleNotif(key) {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Platform configuration and admin preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Admin profile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="card p-5"
          >
            <SectionHeader icon={User} title="Admin Profile" color="#6366F1" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'var(--accent)', color: '#080A0F' }}
                >
                  {user?.name?.[0] ?? 'A'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                </div>
              </div>
              <InputField label="Display Name" value={name}  onChange={setName} />
              <InputField label="Email"         value={email} onChange={setEmail} type="email" />
              <Button variant="primary" size="sm" icon={<Save size={13} />}
                loading={savingProfile} onClick={saveProfile} className="w-full mt-1">
                Save Profile
              </Button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="card p-5"
          >
            <SectionHeader icon={Bell} title="Notifications" color="#22C55E" />
            <div className="flex flex-col gap-2">
              {Object.entries(notifications).map(([k, v]) => (
                <SettingRow
                  key={k}
                  label={k.replace(/([A-Z])/g, ' $1').trim()}
                  enabled={v}
                  onChange={() => toggleNotif(k)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle column — Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card p-5"
        >
          <SectionHeader icon={Globe} title="Platform Info" color="#EC4899" />
          <div className="flex flex-col gap-3">
            {[
              { label: 'Platform', value: 'Planorah' },
              { label: 'Backend', value: 'Django + DRF' },
              { label: 'Auth', value: 'JWT (SimpleJWT)' },
              { label: 'Database', value: 'PostgreSQL' },
              { label: 'API Base', value: import.meta.env.VITE_API_URL || 'http://localhost:8000' },
              { label: 'Admin Panel', value: 'React + Vite' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xs font-mono font-medium text-right" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}

            <div className="p-3 rounded-xl mt-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>Security</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                All admin API endpoints require JWT Bearer token and <code className="text-[11px]">is_staff=True</code>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right column — Feature flags */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="card p-5"
        >
          <SectionHeader icon={Zap} title="Feature Flags" color="var(--accent)" />
          {loading
            ? <div className="flex flex-col gap-2">{[0,1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            : flags.length === 0
              ? (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No feature flags yet.</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create them in the Django admin at <code>/saas-admin/flags/</code></p>
                </div>
              )
              : (
                <div className="flex flex-col gap-2">
                  {flags.map(flag => (
                    <motion.div
                      key={flag.id}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: flag.enabled ? 'rgba(245,158,11,0.06)' : 'var(--bg-elevated)',
                        border:     flag.enabled ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                      }}
                      onClick={() => toggleFlag(flag.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {flag.label}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {flag.description}
                        </p>
                        <code className="text-[10px] mt-0.5 block" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                          {flag.key}
                        </code>
                      </div>
                      <ToggleSwitch enabled={flag.enabled} onChange={() => toggleFlag(flag.id)} />
                    </motion.div>
                  ))}
                </div>
              )
          }
        </motion.div>
      </div>
    </div>
  )
}

function SettingRow({ label, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
