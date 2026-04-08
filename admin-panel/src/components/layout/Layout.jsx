import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

const SIDEBAR_FULL      = 228
const SIDEBAR_COLLAPSED = 64

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -6 },
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const sw = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <Navbar  sidebarWidth={sw} />

      <motion.main
        animate={{ paddingLeft: sw }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="pt-[60px] min-h-screen"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
