import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, BarChart3,
  Settings, ChevronLeft, ChevronRight, Zap, LogOut,
  Shield, ScrollText,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/users',         icon: Users,           label: 'Users'         },
  { to: '/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics'     },
  { to: '/logs',          icon: ScrollText,      label: 'Admin Logs'    },
  { to: '/settings',      icon: Settings,        label: 'Settings'      },
]

const SIDEBAR_W           = 256
const SIDEBAR_W_COLLAPSED = 80

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <motion.aside
      animate={{ width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-charcoal">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-cal-sans font-semibold text-lg tracking-tight whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                Planorah
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors relative overflow-hidden ${
                  active ? 'bg-charcoal text-white' : 'hover:bg-[var(--bg-elevated)]'
                }`}
                style={active ? {} : { color: 'var(--text-secondary)' }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="text-sm font-inter font-medium whitespace-nowrap relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 pb-4 px-3 flex flex-col gap-2 pt-4"
           style={{ borderTop: '1px solid var(--border)' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold bg-charcoal text-white">
                {user?.name?.[0] ?? 'A'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-inter font-semibold truncate"
                   style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate flex items-center gap-1"
                   style={{ color: 'var(--text-secondary)' }}>
                  <Shield size={10} />
                  {user?.role}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer w-full font-inter text-sm hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  )
}
