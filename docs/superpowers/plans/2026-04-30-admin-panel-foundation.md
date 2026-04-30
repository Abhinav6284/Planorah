# Admin Panel Foundation & Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken visual elements in the existing `admin-panel/` React app, add a light/dark theme toggle using CSS custom properties, wire the Settings profile save to the real backend, and add the missing Admin Logs page.

**Architecture:** All color tokens are defined as CSS custom properties in two token sets (`:root` for light, `.dark` for dark). A `ThemeContext` toggles the `dark` class on `document.documentElement` and persists the choice to `localStorage`. Components use `var(--*)` CSS vars for color values — no Tailwind `dark:` classes anywhere.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Framer Motion, Lucide React, Django REST Framework (SimpleJWT)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `admin-panel/src/index.css` | Modify | Add CSS token sets + smooth transition |
| `admin-panel/src/context/ThemeContext.jsx` | Create | Theme state, toggle, localStorage sync |
| `admin-panel/src/main.jsx` | Modify | Wrap app in `<ThemeProvider>` |
| `admin-panel/src/context/AuthContext.jsx` | Modify | Expose `updateUser()` for profile save |
| `admin-panel/src/components/ui/Input.jsx` | Modify | Replace dark-only hardcoded classes with CSS vars |
| `admin-panel/src/components/ui/Toast.jsx` | Modify | Use `--bg-toast` / `--text-on-toast` tokens |
| `admin-panel/src/components/layout/Layout.jsx` | Modify | Use `var(--bg-base)` instead of `bg-white` |
| `admin-panel/src/components/layout/Sidebar.jsx` | Modify | CSS vars for bg/border/text; add Logs nav entry |
| `admin-panel/src/components/layout/Navbar.jsx` | Modify | Add Sun/Moon theme toggle; CSS vars for colors |
| `admin-panel/src/services/api.js` | Modify | Add `updateMe(data)` PATCH endpoint |
| `admin-panel/src/pages/Settings.jsx` | Modify | Wire profile save to real API |
| `admin-panel/src/pages/Logs.jsx` | Create | Admin logs page with filter + table |
| `admin-panel/src/App.jsx` | Modify | Add `/logs` route |
| `backend/saas_admin/api_views.py` | Modify | Add PATCH support to `me` view |

---

## Task 1: CSS Token System

**Files:**
- Modify: `admin-panel/src/index.css` (lines 14-28, replace entire `:root` block)

- [ ] **Step 1: Replace the `:root` block and add `.dark` + transition in `index.css`**

Replace lines 14–28 (the existing `:root` block) with:

```css
:root {
  /* ── Surface ── */
  --bg-base:        #ffffff;
  --bg-elevated:    #f9fafb;
  --bg-card:        #ffffff;
  --bg-toast:       #1e1e1e;   /* stays dark in both modes */

  /* ── Text ── */
  --text-primary:   #242424;
  --text-secondary: #898989;
  --text-on-toast:  #f1f5f9;

  /* ── Border ── */
  --border:         rgba(34,42,53,0.08);
  --border-bright:  rgba(34,42,53,0.14);

  /* Cal.com legacy (used by Tailwind config names) */
  --charcoal:      #242424;
  --midnight:      #111111;
  --mid-gray:      #898989;
  --white:         #ffffff;
  --border-ring:   rgba(34, 42, 53, 0.08);

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error:   #ef4444;
  --info:    #3b82f6;
}

.dark {
  --bg-base:        #111111;
  --bg-elevated:    #1a1a1a;
  --bg-card:        #1e1e1e;
  --bg-toast:       #2a2a2a;

  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-on-toast:  #f1f5f9;

  --border:         rgba(255,255,255,0.06);
  --border-bright:  rgba(255,255,255,0.12);
}

*,
*::before,
*::after {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

- [ ] **Step 2: Start the dev server to confirm no build errors**

```bash
cd admin-panel && npm run dev
```

Expected: Server starts on port 3001 with no errors in terminal.

- [ ] **Step 3: Commit**

```bash
cd admin-panel
git add src/index.css
git commit -m "feat(admin): add CSS color token system for light/dark theming"
```

---

## Task 2: ThemeContext

**Files:**
- Create: `admin-panel/src/context/ThemeContext.jsx`
- Modify: `admin-panel/src/main.jsx`

- [ ] **Step 1: Create `ThemeContext.jsx`**

Create `admin-panel/src/context/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('admin_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('admin_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 2: Wrap the app with `ThemeProvider` in `main.jsx`**

Replace the entire content of `admin-panel/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 3: Verify dev server still starts cleanly**

```bash
cd admin-panel && npm run dev
```

Expected: Port 3001, no console errors.

- [ ] **Step 4: Commit**

```bash
cd admin-panel
git add src/context/ThemeContext.jsx src/main.jsx
git commit -m "feat(admin): add ThemeContext with light/dark toggle and localStorage persistence"
```

---

## Task 3: Fix Input Component

**Files:**
- Modify: `admin-panel/src/components/ui/Input.jsx`

- [ ] **Step 1: Rewrite `Input.jsx` to use CSS vars**

Replace the entire file:

```jsx
export default function Input({
  label,
  error,
  icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label
          className="text-xs font-medium tracking-wide uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            {icon}
          </span>
        )}
        <input
          className={[
            'w-full rounded-xl text-sm px-3.5 py-2.5 transition-colors duration-150 outline-none border',
            'placeholder-mid-gray',
            error
              ? 'border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20'
              : 'focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50',
            icon ? 'pl-9' : '',
            inputClassName,
          ].join(' ')}
          style={{
            background: 'var(--bg-elevated)',
            borderColor: error ? undefined : 'var(--border-bright)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Open `http://localhost:3001/login` and verify the email and password inputs are visible**

Expected: Inputs render with a light gray background in light mode. Text is legible. No invisible text.

- [ ] **Step 3: Commit**

```bash
cd admin-panel
git add src/components/ui/Input.jsx
git commit -m "fix(admin): rewrite Input to use CSS vars — fixes invisible inputs in light mode"
```

---

## Task 4: Fix Toast Component

**Files:**
- Modify: `admin-panel/src/components/ui/Toast.jsx`

- [ ] **Step 1: Update Toast to use `--bg-toast` and `--text-on-toast`**

Replace the entire file:

```jsx
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-400" />,
  error:   <XCircle      size={16} className="text-red-400"   />,
  warning: <AlertCircle  size={16} className="text-yellow-400"/>,
  info:    <Info         size={16} className="text-sky-400"   />,
}

const BARS = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-sky-400',
}

export default function Toast({ toast, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1     }}
      exit={{    opacity: 0, x: 60, scale: 0.92   }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-[360px]"
      style={{
        background: 'var(--bg-toast)',
        border:     '1px solid var(--border-bright)',
        boxShadow:  '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${BARS[toast.type] ?? BARS.info}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3.5, ease: 'linear' }}
      />

      <span className="flex-shrink-0">{ICONS[toast.type] ?? ICONS.info}</span>
      <p className="text-sm flex-1" style={{ color: 'var(--text-on-toast)' }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-on-toast)' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 2: Trigger a toast to verify it renders**

In the browser console on any admin page:
Open DevTools → Application tab → verify localStorage has `admin_tokens`. If not logged in, log in first, then trigger a 401 or navigate to Settings and toggle any feature flag to trigger a success toast.

Expected: Dark toast pill appears bottom-right with colored progress bar. Text is white and legible.

- [ ] **Step 3: Commit**

```bash
cd admin-panel
git add src/components/ui/Toast.jsx
git commit -m "fix(admin): use --bg-toast/--text-on-toast tokens so toasts render dark in both modes"
```

---

## Task 5: Layout Shell Theming + Theme Toggle

**Files:**
- Modify: `admin-panel/src/components/layout/Layout.jsx`
- Modify: `admin-panel/src/components/layout/Sidebar.jsx`
- Modify: `admin-panel/src/components/layout/Navbar.jsx`

- [ ] **Step 1: Update `Layout.jsx` to use `var(--bg-base)` instead of `bg-white`**

Replace the entire file:

```jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const SIDEBAR_FULL      = 256
const SIDEBAR_COLLAPSED = 80

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const sw = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <Navbar sidebarWidth={sw} />

      <motion.main
        animate={{ paddingLeft: sw }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="pt-20 min-h-screen"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
```

- [ ] **Step 2: Update `Sidebar.jsx` with CSS vars for bg/border/text and add Logs nav entry**

Replace the entire file:

```jsx
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, BarChart3,
  Settings, ChevronLeft, ChevronRight, Zap, LogOut,
  Shield, ScrollText,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/users',         icon: Users,           label: 'Users'        },
  { to: '/subscriptions', icon: CreditCard,      label: 'Subscriptions'},
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics'    },
  { to: '/logs',          icon: ScrollText,      label: 'Admin Logs'   },
  { to: '/settings',      icon: Settings,        label: 'Settings'     },
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
                <p className="text-xs font-inter font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
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
```

- [ ] **Step 3: Update `Navbar.jsx` — add theme toggle button, update colors to CSS vars**

Replace the entire file:

```jsx
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
            color: 'var(--text-secondary)',
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-inter transition-colors cursor-pointer ${
        danger ? 'text-red-600 hover:bg-red-50' : 'hover:bg-[var(--bg-elevated)]'
      }`}
      style={danger ? {} : { color: 'var(--text-primary)' }}
    >
      {icon}
      {label}
    </button>
  )
}
```

- [ ] **Step 4: Verify theme toggle works**

1. Open `http://localhost:3001/dashboard`
2. Click the Moon icon in the top-right navbar
3. Page should smoothly transition to dark background (`#111111`), dark sidebar, dark navbar
4. Click Sun icon to return to light mode
5. Refresh the page — theme preference should be preserved (localStorage)

- [ ] **Step 5: Commit**

```bash
cd admin-panel
git add src/components/layout/Layout.jsx src/components/layout/Sidebar.jsx src/components/layout/Navbar.jsx
git commit -m "feat(admin): theme-aware layout shell + sun/moon toggle in navbar"
```

---

## Task 6: Backend PATCH /api/admin/me/

**Files:**
- Modify: `backend/saas_admin/api_views.py` (lines 36–50, the `me` view)

- [ ] **Step 1: Add PATCH support to the `me` view**

In `backend/saas_admin/api_views.py`, replace the `me` function (lines 36–50):

```python
@api_view(['GET', 'PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """Return or update current admin user info."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    user = request.user

    if request.method == 'PATCH':
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name  = request.data.get('last_name',  user.last_name)
        user.email      = request.data.get('email',      user.email)
        user.save(update_fields=['first_name', 'last_name', 'email'])

    return Response({
        'id':       user.id,
        'name':     f'{user.first_name} {user.last_name}'.strip() or user.username,
        'email':    user.email,
        'role':     'superadmin' if user.is_superuser else 'admin',
        'username': user.username,
    })
```

- [ ] **Step 2: Start Django and test the PATCH endpoint with curl**

Start the Django dev server:
```bash
cd backend && python manage.py runserver
```

First get a token (replace credentials with your staff account):
```bash
curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@planorah.com", "password": "yourpassword"}' \
  | python -m json.tool
```

Copy the `access` token. Then test PATCH:
```bash
curl -X PATCH http://localhost:8000/api/admin/me/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test", "last_name": "Admin", "email": "admin@planorah.com"}'
```

Expected response:
```json
{
  "id": 1,
  "name": "Test Admin",
  "email": "admin@planorah.com",
  "role": "superadmin",
  "username": "admin"
}
```

- [ ] **Step 3: Commit**

```bash
cd backend
git add saas_admin/api_views.py
git commit -m "feat(admin-api): add PATCH support to /api/admin/me/ for profile updates"
```

---

## Task 7: Wire Settings Profile Save

**Files:**
- Modify: `admin-panel/src/context/AuthContext.jsx`
- Modify: `admin-panel/src/services/api.js`
- Modify: `admin-panel/src/pages/Settings.jsx`

- [ ] **Step 1: Add `updateUser` to `AuthContext.jsx`**

Replace the entire file:

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { loginWithCredentials, logout as apiLogout, getStoredUser, isAuthenticated } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      const stored = getStoredUser()
      if (stored) setUser(stored)
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { user: adminUser } = await loginWithCredentials(email, password)
    setUser(adminUser)
    return adminUser
  }

  function logout() {
    apiLogout()
    setUser(null)
  }

  function updateUser(patch) {
    setUser(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('admin_user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Add `updateMe` to `adminApi` in `api.js`**

In `admin-panel/src/services/api.js`, add `updateMe` to the `adminApi` object after `getLogs`:

```js
  // Profile
  updateMe: (data) =>
    apiFetch('/api/admin/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
```

The full `adminApi` object tail should look like:

```js
  // Logs
  getLogs: (limit = 20) =>
    apiFetch(`/api/admin/logs/?limit=${limit}`),

  // Profile
  updateMe: (data) =>
    apiFetch('/api/admin/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}
```

- [ ] **Step 3: Update `saveProfile` in `Settings.jsx` to call the real API**

In `admin-panel/src/pages/Settings.jsx`:

1. Add `updateUser` to the `useAuth` destructure on line 70:
```jsx
const { user, updateUser } = useAuth()
```

2. Replace the `saveProfile` function (lines 102–107):
```jsx
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
```

- [ ] **Step 4: Test profile save in the browser**

1. Navigate to `http://localhost:3001/settings`
2. Change the Display Name field to a new value
3. Click "Save Profile"
4. Expected: success toast appears, navbar top-right updates to show new name immediately (no page reload)
5. Refresh the page — new name should persist (stored in localStorage + backend)

- [ ] **Step 5: Commit**

```bash
cd admin-panel
git add src/context/AuthContext.jsx src/services/api.js src/pages/Settings.jsx
git commit -m "feat(admin): wire Settings profile save to PATCH /api/admin/me/"
```

---

## Task 8: Admin Logs Page

**Files:**
- Create: `admin-panel/src/pages/Logs.jsx`
- Modify: `admin-panel/src/App.jsx`

(Sidebar already updated with the nav entry in Task 5.)

- [ ] **Step 1: Create `Logs.jsx`**

Create `admin-panel/src/pages/Logs.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, AlertCircle, RefreshCw, Search } from 'lucide-react'
import { adminApi } from '../services/api'

function Sk({ h = 'h-4', w = 'w-full' }) {
  return <div className={`${h} ${w} rounded-lg bg-gray-100 animate-pulse`} />
}

const ACTION_COLORS = {
  suspend:  'bg-amber-100 text-amber-700',
  enable:   'bg-emerald-100 text-emerald-700',
  delete:   'bg-red-100 text-red-700',
  cancel:   'bg-orange-100 text-orange-700',
  extend:   'bg-blue-100 text-blue-700',
  toggle:   'bg-purple-100 text-purple-700',
}

export default function Logs() {
  const [loading, setLoading] = useState(true)
  const [logs,    setLogs]    = useState([])
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('')

  function fetchLogs() {
    setLoading(true)
    setError(null)
    adminApi.getLogs(100)
      .then(data => setLogs(data.results))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = filter.trim()
    ? logs.filter(l =>
        l.action_display.toLowerCase().includes(filter.toLowerCase()) ||
        l.admin.toLowerCase().includes(filter.toLowerCase()) ||
        (l.target_user || '').toLowerCase().includes(filter.toLowerCase()) ||
        (l.detail || '').toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-cal-sans font-semibold text-4xl tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
            Admin Logs
          </h1>
          <p className="text-sm font-inter mt-2" style={{ color: 'var(--text-secondary)' }}>
            Audit trail of all admin actions
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-inter transition-colors hover:bg-[var(--bg-elevated)] disabled:opacity-50"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-bright)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mb-6"
      >
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by action, admin, or user…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-inter outline-none border placeholder-mid-gray"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-4"
                 style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <Sk h="h-4" w="w-24" />
              <Sk h="h-4" w="w-20" />
              <Sk h="h-4" w="w-32" />
              <Sk h="h-4" w="w-48" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-inter font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Failed to load logs
            </p>
            <p className="text-xs font-inter" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={fetchLogs}
                    className="mt-4 text-xs font-inter underline"
                    style={{ color: 'var(--text-secondary)' }}>
              Retry
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ScrollText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
            <p className="text-sm font-inter" style={{ color: 'var(--text-secondary)' }}>
              {filter ? 'No logs match your filter.' : 'No admin actions recorded yet.'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[140px_120px_160px_1fr_160px] gap-4 px-6 py-3 text-xs font-inter font-semibold uppercase tracking-wide"
               style={{
                 background: 'var(--bg-elevated)',
                 borderBottom: '1px solid var(--border)',
                 color: 'var(--text-secondary)',
               }}>
            <span>Time</span>
            <span>Action</span>
            <span>Admin</span>
            <span>Detail</span>
            <span>Target</span>
          </div>

          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-[140px_120px_160px_1fr_160px] gap-4 px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors"
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}
            >
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                {log.created_at}
              </span>
              <span>
                <span className={`text-xs font-inter font-medium px-2 py-0.5 rounded-full ${
                  ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'
                }`}>
                  {log.action_display}
                </span>
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-primary)' }}>
                {log.admin}
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-secondary)' }}>
                {log.detail || '—'}
              </span>
              <span className="text-xs font-inter truncate" style={{ color: 'var(--text-secondary)' }}>
                {log.target_user || '—'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs font-inter mt-4" style={{ color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {logs.length} entries
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add the `/logs` route to `App.jsx`**

In `admin-panel/src/App.jsx`:

1. Add import at the top (after the Analytics import):
```jsx
import Logs from './pages/Logs'
```

2. Add the route inside the Layout route block (after the analytics route):
```jsx
<Route path="analytics"     element={<Analytics />} />
<Route path="logs"          element={<Logs />} />
<Route path="settings"      element={<Settings />} />
```

The full `App.jsx` should look like:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Subscriptions from './pages/Subscriptions'
import Analytics from './pages/Analytics'
import Logs from './pages/Logs'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="users"         element={<Users />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="logs"          element={<Logs />} />
          <Route path="settings"      element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Verify Logs page in browser**

1. Navigate to `http://localhost:3001/logs`
2. Expected: "Admin Logs" heading, a search filter bar, and a table of log entries fetched from `GET /api/admin/logs/?limit=100`
3. If the backend has no logs yet, an empty state with the `ScrollText` icon should appear
4. Type in the filter box — rows should filter in real time

- [ ] **Step 4: Commit**

```bash
cd admin-panel
git add src/pages/Logs.jsx src/App.jsx
git commit -m "feat(admin): add Admin Logs page at /logs with filter and audit table"
```

---

## Self-Review Checklist

After implementation, verify:

- [ ] Light mode: white background, charcoal text, gray borders — no dark artifacts
- [ ] Dark mode: `#111111` background, `#f1f5f9` text — all elements legible
- [ ] Theme preference survives page refresh (localStorage `admin_theme`)
- [ ] Login page inputs are visible in both modes
- [ ] Toasts render dark in both light and dark mode with legible text
- [ ] Profile save POSTs to backend (check Django request log in terminal)
- [ ] Navbar name updates immediately after profile save (no reload)
- [ ] `/logs` route loads and renders the audit table
- [ ] Sidebar shows "Admin Logs" entry between Analytics and Settings
- [ ] Dev server builds with no TypeScript/lint errors: `npm run build`
