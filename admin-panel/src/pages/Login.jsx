import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function Login() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  const [email,    setEmail]    = useState('admin@planorah.me')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Both fields are required.'); return }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      addToast('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* background blobs */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background:  'var(--bg-surface)',
            border:      '1px solid var(--border)',
            boxShadow:   '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.7, rotate: -15 }}
              animate={{ scale: 1,   rotate: 0   }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:  'var(--accent)',
                boxShadow:   '0 0 28px rgba(245,158,11,0.35)',
              }}
            >
              <Zap size={22} className="text-obs-base" fill="currentColor" />
            </motion.div>
            <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Admin Portal
            </h1>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Sign in to manage Planorah
            </p>
          </div>

          {/* Auth hint */}
          <div
            className="mb-5 px-3 py-2.5 rounded-xl text-xs flex items-start gap-2"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
            <div style={{ color: 'var(--text-secondary)' }}>
              Sign in with your <span className="font-semibold" style={{ color: 'var(--accent)' }}>Django staff account</span> credentials. Requires <code className="text-[10px]">is_staff=True</code>.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@planorah.me"
              icon={<Mail size={15} />}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none"
                  style={{
                    background: 'var(--bg-elevated)',
                    border:     error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color:      'var(--text-primary)',
                  }}
                  onFocus={e  => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={e   => (e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 flex items-center gap-1"
                >
                  <AlertCircle size={11} />{error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1 font-display tracking-wide"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Planorah Admin v2.0 · Restricted Access
        </p>
      </motion.div>
    </div>
  )
}
