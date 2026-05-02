import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Shield, LogOut, User, X, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { mockUsers } from '../../services/mockData'

export default function Navbar({ sidebarWidth }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const searchRef  = useRef(null)
  const profileRef = useRef(null)

  const results = searchQuery.trim().length > 1
    ? mockUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  useEffect(() => {
    const handler = e => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const NOTIFS = [
    { id: 1, text: 'Aurora Reed just signed up',   time: '2m ago', type: 'success' },
    { id: 2, text: 'Payment of ₹999 received',     time: '1h ago', type: 'success' },
    { id: 3, text: 'Subscription canceled — Aria', time: '3h ago', type: 'warning' },
  ]

  return (
    <motion.header
      animate={{ paddingLeft: sidebarWidth + 32 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 right-0 left-0 h-20 z-30 flex items-center pr-8 gap-6"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-text transition-all border"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-bright)',
          }}
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
        >
          <Search size={15} className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
          {searchOpen ? (
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => { setSearchOpen(false); setSearchQuery('') }, 200)}
              className="flex-1 bg-transparent text-sm outline-none font-inter placeholder-mid-gray"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Search users…"
              autoFocus
            />
          ) : (
            <span className="text-sm flex-1 select-none font-inter" style={{ color: 'var(--text-secondary)' }}>
              Search <span className="text-xs opacity-40 ml-2">⌘K</span>
            </span>
          )}
          {searchOpen && searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-secondary)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchOpen && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 left-0 right-0 rounded-lg overflow-hidden shadow-level-2-card z-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {results.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-[var(--bg-elevated)]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-charcoal">
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-inter font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    <p className="text-xs font-inter" style={{ color: 'var(--text-secondary)' }}>{u.email}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-primary)' }}
          >
            <Bell size={17} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-charcoal" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0,   scale: 1    }}
                  exit={{   opacity: 0, y: -10, scale: 0.96  }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full right-0 mt-3 w-80 rounded-lg overflow-hidden shadow-level-2-card z-50"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-sm font-cal-sans font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                  </div>
                  {NOTIFS.map(n => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-inter" style={{ color: 'var(--text-primary)' }}>{n.text}</p>
                        <p className="text-xs font-inter mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.time}</p>
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
            className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-lg transition-colors border hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-bright)' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-charcoal flex-shrink-0">
              {user?.name?.[0] ?? 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-inter font-semibold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs font-inter leading-none capitalize" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,   scale: 1    }}
                exit={{   opacity: 0, y: -10, scale: 0.96  }}
                transition={{ duration: 0.18 }}
                className="absolute top-full right-0 mt-3 w-56 rounded-lg overflow-hidden shadow-level-2-card z-50"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-inter font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs font-inter mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                </div>
                <div className="py-1">
                  <DropItem icon={<User size={14} />}   label="Profile"  />
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
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-inter transition-colors cursor-pointer hover:bg-[var(--bg-elevated)]"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {icon}
      {label}
    </button>
  )
}
