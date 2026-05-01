import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Beaker,
  MapPin,
  FolderOpen,
  BookOpen,
  FileText,
  Files,
  Search,
  Briefcase,
  MessageSquare,
  Globe,
  CheckSquare,
  Calendar,
} from 'lucide-react';

/**
 * ElevenLabs-inspired dark sidebar navigation
 * 
 * Design: Dark charcoal (#0f0f0f) sidebar with muted white text,
 * collapsible sections, warm hover states, and a clean minimal structure.
 */

const navSections = [
  {
    section: 'Configure',
    items: [
      { path: '/lab', label: 'Virtual Lab', icon: Beaker },
      { path: '/roadmap/list', label: 'Learning Path', icon: MapPin },
      { path: '/roadmap/projects', label: 'My Projects', icon: FolderOpen },
      { path: '/planora', label: 'Study Platform', icon: BookOpen },
    ],
  },
  {
    section: 'Monitor',
    items: [
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/scheduler', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    section: 'Career',
    items: [
      { path: '/resume', label: 'Resume Builder', icon: FileText },
      { path: '/resume/compiled', label: 'Compiled Resumes', icon: Files },
      { path: '/ats', label: 'Find Your Fit', icon: Search },
      { path: '/jobs', label: 'Job Finder', icon: Briefcase },
      { path: '/interview', label: 'Mock Interview', icon: MessageSquare },
      { path: '/portfolio/edit', label: 'Portfolio', icon: Globe },
    ],
  },

];

const isPathMatch = (pathname, navPath) =>
  pathname === navPath || pathname.startsWith(`${navPath}/`);

const getActiveNavPath = (pathname) => {
  const allPaths = ['/dashboard', ...navSections.flatMap((s) => s.items.map((i) => i.path))];
  const matched = allPaths.filter((p) => isPathMatch(pathname, p));
  if (!matched.length) return null;
  return matched.sort((a, b) => b.length - a.length)[0];
};

// ─── SettingsLink ────────────────────────────────────────────────────────────
const SettingsLink = ({ onNavClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to="/settings"
      onClick={onNavClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 7,
        fontSize: 13.5,
        fontWeight: 400,
        fontFamily: "'Inter', sans-serif",
        textDecoration: 'none',
        transition: 'color 0.15s',
        background: hovered ? 'var(--el-sidebar-hover-bg)' : 'transparent',
        color: hovered ? 'var(--el-sidebar-active)' : 'var(--el-sidebar-text)',
      }}
    >
      <Settings style={{ width: 15, height: 15, opacity: 0.65 }} />
      Settings
    </Link>
  );
};

// ─── HomeLink ────────────────────────────────────────────────────────────────
const HomeLink = ({ activeNavPath, onNavClick }) => {
  const [hovered, setHovered] = useState(false);
  const active = activeNavPath === '/dashboard';
  return (
    <div style={{ padding: '0 12px 4px' }}>
      <Link
        to="/dashboard"
        onClick={onNavClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          fontFamily: "'Inter', sans-serif",
          textDecoration: 'none',
          transition: 'color 0.15s',
          background: !active && hovered ? 'var(--el-sidebar-hover-bg)' : 'transparent',
          color: active || hovered ? 'var(--el-sidebar-active)' : 'var(--el-sidebar-text)',
        }}
      >
        <LayoutDashboard style={{ width: 16, height: 16, opacity: active ? 1 : 0.6 }} />
        Home
      </Link>
    </div>
  );
};

// ─── NavItemLink ─────────────────────────────────────────────────────────────
const NavItemLink = ({ item, active, onNavClick }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onNavClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: active ? 600 : 400,
        fontFamily: "'Inter', sans-serif",
        textDecoration: 'none',
        transition: 'color 0.15s',
        background: !active && hovered ? 'var(--el-sidebar-hover-bg)' : 'transparent',
        color: active || hovered ? 'var(--el-sidebar-active)' : 'var(--el-sidebar-text)',
      }}
    >
      <Icon style={{ width: 15, height: 15, opacity: active ? 1 : 0.5, flexShrink: 0 }} />
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </span>
      {item.badge && (
        <span style={{
          marginLeft: 'auto',
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 8px',
          borderRadius: 9999,
          background: 'var(--el-sidebar-item-active-bg)',
          color: 'var(--el-sidebar-active)',
          letterSpacing: '0.02em'
        }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
};

// ─── SidebarContent ──────────────────────────────────────────────────────────
const SidebarContent = ({ onNavClick = () => { }, user = null }) => {
  const location = useLocation();
  const activeNavPath = getActiveNavPath(location.pathname);
  const [expandedSections, setExpandedSections] = useState(() =>
    navSections.reduce((acc, s) => {
      acc[s.section] = true;
      return acc;
    }, {})
  );

  const toggleSection = (name) =>
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--el-sidebar-bg)', color: 'var(--el-sidebar-text)' }}>
      {/* ── Brand ── */}
      <div style={{ padding: '24px 20px 20px' }}>
        <Link
          to="/dashboard"
          onClick={onNavClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            color: 'var(--el-sidebar-active)',
          }}
        >
          <img
            src="/planorah_logo.png"
            alt="Planorah"
            style={{
              width: 24,
              height: 24,
              objectFit: 'contain',
              filter: 'var(--el-sidebar-logo-filter)',
              flexShrink: 0,
            }}
          />
          <span style={{
            fontSize: 18,
            fontWeight: 300,
            letterSpacing: '-0.04em',
            fontFamily: "'Inter', sans-serif",
            color: 'var(--el-sidebar-active)'
          }}>
            Planorah
          </span>
        </Link>
      </div>

      {/* ── Home Link ── */}
      <HomeLink activeNavPath={activeNavPath} onNavClick={onNavClick} />

      {/* ── Sections ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navSections.map((section) => {
          const isExpanded = !!expandedSections[section.section];
          const sectionId = `el-sb-${section.section.toLowerCase()}`;

          return (
            <div key={section.section}>
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(section.section)}
                aria-expanded={isExpanded}
                aria-controls={sectionId}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 10px 6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--el-sidebar-section)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--el-sidebar-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--el-sidebar-section)'}
              >
                <span>{section.section}</span>
                <ChevronDown
                  style={{
                    width: 12, height: 12,
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Section items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    id={sectionId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {section.items.map((item) => (
                        <NavItemLink
                          key={item.path}
                          item={item}
                          active={activeNavPath === item.path}
                          onNavClick={onNavClick}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--el-sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}>
        <SettingsLink onNavClick={onNavClick} />
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ mobileOpen = false, onMobileClose = () => { }, user = null }) => (
  <>
    {/* Desktop — fixed dark sidebar */}
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--el-sidebar-bg)',
        borderRight: '1px solid var(--el-sidebar-border)',
      }}
    >
      <SidebarContent user={user} />
    </aside>

    {/* Mobile overlay */}
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 lg:hidden flex flex-col overflow-y-auto"
            style={{
              width: 280,
              maxWidth: '85vw',
              background: 'var(--el-sidebar-bg)',
            }}
          >
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <button
                onClick={onMobileClose}
                type="button"
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8,
                  background: 'var(--el-sidebar-item-active-bg)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--el-sidebar-text)',
                  transition: 'background 0.15s',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <SidebarContent onNavClick={onMobileClose} user={user} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
);

export default Sidebar;
