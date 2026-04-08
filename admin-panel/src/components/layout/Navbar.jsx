import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Shield, LogOut, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockUsers } from '../../services/mockData'

export default function Navbar({ sidebarWidth }) {
  const { user, logout } = useAuth()
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [profileOpen,   setProfileOpen]   = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const searchRef  = useRef(null)
  const profileRef = useRef(null)

  const results = searchQuery.trim().length > 1
    ? mockUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  // close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const NOTIFS = [
    { id: 1, text: 'Aurora Reed just signed up', time: '2m ago',  dot: 'bg-emerald-400' },
    { id: 2, text: 'Payment of $99 received',    time: '1h ago',  dot: 'bg-gold'       },
    { id: 3, text: 'Subscription canceled — Aria', time: '3h ago', dot: 'bg-red-400'   },
  ]

  return (
    <motion.header
      animate={{ paddingLeft: sidebarWidth + 16 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 right-0 left-0 h-[60px] z-30 flex items-center pr-5 gap-4"
      style={{
        background:   'rgba(8,10,15,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-text transition-all"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          {searchOpen
            ? (
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { setTimeout(() => { setSearchOpen(false); setSearchQuery('') }, 200) }}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
                placeholder="Search users…"
                autoFocus
              />
            )
            : <span className="text-sm flex-1 select-none" style={{ color: 'var(--text-muted)' }}>
                Search <span className="text-xs opacity-50 ml-1">⌘K</span>
              </span>
          }
          {searchOpen && searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {searchOpen && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)' }}
            >
              {results.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: u.avatarColor, color: '#080A0F' }}
                  >
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={16} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-full right-0 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl z-50"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)' }}
                >
                  <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Notifications
                  </p>
                  {NOTIFS.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{n.text}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent)', color: '#080A0F' }}
            >
              {user?.name?.[0] ?? 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-[10px] leading-none capitalize flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Shield size={9} />{user?.role}
              </p>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)' }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
                <div className="py-1">
                  <DropItem icon={<User size={14} />} label="Profile" />
                  <DropItem icon={<Shield size={14} />} label="Security" />
                </div>
                <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <DropItem icon={<LogOut size={14} />} label="Logout" danger onClick={logout} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

function DropItem({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors cursor-pointer"
      style={{ color: danger ? '#EF4444' : 'var(--text-secondary)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}{label}
    </button>
  )
}
