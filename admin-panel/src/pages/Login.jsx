import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  const [email,    setEmail]    = useState('')
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
      style={{ background: '#080808' }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 32px 80px rgba(0,0,0,0.9)',
          }}
        >
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
              className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.6)' }}
            >
              <Zap size={22} style={{ color: '#080808' }} fill="#080808" />
            </motion.div>

            <h1 className="font-cal-sans text-2xl font-semibold tracking-tight mb-1.5" style={{ color: '#fff' }}>
              Admin Portal
            </h1>
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sign in to manage Planorah
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                     style={{ color: 'rgba(255,255,255,0.3)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@planorah.me"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                  onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.22)')}
                  onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                     style={{ color: 'rgba(255,255,255,0.3)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: error ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                  onFocus={e  => (e.target.style.borderColor = error ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.22)')}
                  onBlur={e   => (e.target.style.borderColor = error ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 flex items-center gap-1.5 mt-0.5"
                >
                  <AlertCircle size={11} />{error}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold font-inter mt-2 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{
                background: '#fff',
                color: '#080808',
                boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset',
              }}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <Shield size={10} style={{ color: 'rgba(255,255,255,0.18)' }} />
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Planorah Admin v2.0 · Restricted Access
          </p>
        </div>
      </motion.div>
    </div>
  )
}
