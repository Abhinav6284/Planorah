import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, BarChart3,
  Settings, ChevronLeft, ChevronRight, Zap, LogOut,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/users',         icon: Users,           label: 'Users'         },
  { to: '/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics'     },
  { to: '/settings',      icon: Settings,        label: 'Settings'      },
]

const SIDEBAR_W  = 228
const SIDEBAR_W_COLLAPSED = 64

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <motion.aside
      animate={{ width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        background:  'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="h-[60px] flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)', boxShadow: '0 0 16px rgba(245,158,11,0.3)' }}
          >
            <Zap size={16} className="text-obs-base" fill="currentColor" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="font-display font-bold text-base tracking-tight whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                Planorah
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors relative overflow-hidden"
                style={{
                  background: active ? 'var(--accent-muted)' : 'transparent',
                  color:      active ? 'var(--accent)' : 'var(--text-muted)',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}
                title={collapsed ? label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--accent-muted)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
                <Icon size={17} className="flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{    opacity: 0, x: -6 }}
                      transition={{ duration: 0.16 }}
                      className="text-sm font-medium whitespace-nowrap relative z-10"
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

      {/* User + collapse */}
      <div className="flex-shrink-0 pb-3 px-2 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              className="px-3 pt-3 pb-1 flex items-center gap-2.5"
            >
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent)', color: '#080A0F' }}
              >
                {user?.name?.[0] ?? 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="text-[10px] truncate flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Shield size={10} />{user?.role}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer w-full"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
                className="text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-xl transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <ChevronLeft  size={15} />
          }
        </button>
      </div>
    </motion.aside>
  )
}
