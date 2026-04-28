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
      { path: '/lab',              label: 'Virtual Lab',      icon: Beaker },
      { path: '/roadmap/list',     label: 'Learning Path',    icon: MapPin },
      { path: '/roadmap/projects', label: 'My Projects',      icon: FolderOpen },
      { path: '/planora',          label: 'Study Platform',   icon: BookOpen },
    ],
  },
  {
    section: 'Monitor',
    items: [
      { path: '/tasks',     label: 'Tasks',     icon: CheckSquare },
      { path: '/scheduler', label: 'Calendar',  icon: Calendar },
    ],
  },
  {
    section: 'Career',
    items: [
      { path: '/resume',          label: 'Resume Builder',   icon: FileText },
      { path: '/resume/compiled', label: 'Compiled Resumes', icon: Files },
      { path: '/ats',             label: 'Find Your Fit',    icon: Search },
      { path: '/jobs',            label: 'Job Finder',       icon: Briefcase },
      { path: '/interview',       label: 'Mock Interview',   icon: MessageSquare },
      { path: '/portfolio/edit',  label: 'Portfolio',        icon: Globe },
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

// ─── SidebarContent ──────────────────────────────────────────────────────────
const SidebarContent = ({ onNavClick = () => {}, user = null }) => {
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
              filter: 'invert(1)',
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

      {/* ── Workspace Selector ── */}
      <div style={{ padding: '0 12px 16px' }}>
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--el-sidebar-active)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#000',
            }}>P</div>
            My Workspace
          </span>
          <ChevronDown style={{ width: 14, height: 14, opacity: 0.4 }} />
        </button>
      </div>

      {/* ── Home Link ── */}
      <div style={{ padding: '0 12px 4px' }}>
        <Link
          to="/dashboard"
          onClick={onNavClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: activeNavPath === '/dashboard' ? 500 : 400,
            fontFamily: "'Inter', sans-serif",
            textDecoration: 'none',
            transition: 'all 0.2s',
            background: activeNavPath === '/dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeNavPath === '/dashboard' ? 'var(--el-sidebar-active)' : 'var(--el-sidebar-text)',
            boxShadow: activeNavPath === '/dashboard' ? 'inset 0 1px 1px rgba(255,255,255,0.05)' : 'none'
          }}
        >
          <LayoutDashboard style={{ width: 16, height: 16, opacity: activeNavPath === '/dashboard' ? 1 : 0.6 }} />
          Home
        </Link>
      </div>

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
                      {section.items.map((item) => {
                        const active = activeNavPath === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavClick}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '8px 12px',
                              borderRadius: 10,
                              fontSize: 13.5,
                              fontWeight: active ? 500 : 400,
                              fontFamily: "'Inter', sans-serif",
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                              color: active ? 'var(--el-sidebar-active)' : 'var(--el-sidebar-text)',
                              boxShadow: active ? 'inset 0 1px 1px rgba(255,255,255,0.05)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!active) {
                                e.currentTarget.style.background = 'var(--el-sidebar-hover-bg)';
                                e.currentTarget.style.color = 'var(--el-sidebar-active)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--el-sidebar-text)';
                              }
                            }}
                          >
                            <Icon style={{ width: 15, height: 15, opacity: active ? 1 : 0.5, flexShrink: 0 }} />
                            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                            {item.badge && (
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 8px',
                                borderRadius: 9999,
                                background: 'rgba(255,255,255,0.1)',
                                color: 'var(--el-sidebar-active)',
                                letterSpacing: '0.02em'
                              }}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
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
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}>
        <Link
          to="/settings"
          onClick={onNavClick}
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
            color: 'var(--el-sidebar-text)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--el-sidebar-hover-bg)';
            e.currentTarget.style.color = 'var(--el-sidebar-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--el-sidebar-text)';
          }}
        >
          <Settings style={{ width: 15, height: 15, opacity: 0.65 }} />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 10px',
            borderRadius: 7,
            fontSize: 13.5,
            fontWeight: 400,
            fontFamily: "'Inter', sans-serif",
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(239,68,68,0.7)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = 'rgba(239,68,68,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
          }}
        >
          <LogOut style={{ width: 15, height: 15 }} />
          Logout
        </button>
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ mobileOpen = false, onMobileClose = () => {}, user = null }) => (
  <>
    {/* Desktop — fixed dark sidebar */}
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--el-sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
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
                  background: 'rgba(255,255,255,0.08)',
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
