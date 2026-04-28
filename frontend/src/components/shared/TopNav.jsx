import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Logo, Button } from './Primitives';
import { IconArrowRight, IconHome, IconList, IconCalendar, IconBook, IconSparkle, IconBell, IconSettings } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Dropdown data ────────────────────────────────────────
const FEATURES_ITEMS = [
  { label: 'AI Roadmap', desc: 'Upload syllabus, get a full plan', to: '/features/ai-roadmap' },
  { label: 'Daily Planner', desc: 'Tasks that show up at the right time', to: '/features/daily-planner' },
  { label: 'Focus Mode', desc: 'Pomodoro built into every block', to: '/features/focus-mode' },
  { label: 'Progress Analytics', desc: 'Streaks, velocity, burnout flags', to: '/features/progress-analytics' },
];

// ─── Custom Premium Marketing Logo ─────────────────────────
const PremiumLogo = ({ theme }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
    <img 
      src="/planorah_logo.png" 
      alt="Planorah" 
      style={{ 
        width: 32, 
        height: 32, 
        objectFit: 'contain',
        filter: theme === 'dark' ? 'invert(1)' : 'none',
        flexShrink: 0
      }} 
    />
    <span style={{
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: 'var(--fg-deep)',
      whiteSpace: 'nowrap'
    }}>
      Planorah
    </span>
  </div>
);

// ─── Dropdown component ───────────────────────────────────
const NavDropdown = ({ label, items, isOpen, onToggle, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="nav-link"
        onClick={onToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: isOpen ? 'color-mix(in srgb, var(--fg-deep) 6%, transparent)' : 'transparent',
          border: 'none', cursor: 'pointer',
          color: isOpen ? 'var(--fg-deep)' : 'var(--fg-muted)',
          fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
          padding: '8px 14px', borderRadius: 100,
          transition: 'all 0.2s ease',
        }}
      >
        {label}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor"
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M2 4l3 3 3-3" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 12px)', left: '50%',
              transform: 'translateX(-50%)',
              minWidth: 320, padding: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.04)',
              zIndex: 100,
              display: 'flex', flexDirection: 'column', gap: 4
            }}
          >
            {items.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                onClick={onClose}
                style={{ textDecoration: 'none', display: 'block', borderRadius: 12, overflow: 'hidden' }}
              >
                <motion.div
                  whileHover={{ backgroundColor: 'color-mix(in srgb, var(--fg-deep) 4%, transparent)' }}
                  style={{
                    padding: '12px 16px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile menu ──────────────────────────────────────────
const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: 'fixed', top: 88, left: 16, right: 16,
        background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        zIndex: 99,
        padding: '24px 20px', overflowY: 'auto',
        border: '1px solid color-mix(in srgb, var(--border-subtle) 60%, transparent)',
        borderRadius: 24,
        boxShadow: '0 24px 48px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.05)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 12px 6px' }}>Features</div>
        {FEATURES_ITEMS.map((item, i) => (
          <Link key={i} to={item.to} onClick={onClose}
            style={{ padding: '10px 12px', fontSize: 15, color: 'var(--fg-deep)', textDecoration: 'none', borderRadius: 8 }}>
            {item.label}
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />

        {[
          { label: 'How It Works', to: '/how-it-works' },
          { label: 'Demo', to: '/demo' },
          { label: 'Pricing', to: '/pricing' },
        ].map((link, i) => (
          <Link key={i} to={link.to} onClick={onClose}
            style={{ padding: '10px 12px', fontSize: 15, color: 'var(--fg-deep)', textDecoration: 'none', borderRadius: 8 }}>
            {link.label}
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />

        <Link to="/login" onClick={onClose} style={{ textDecoration: 'none' }}>
          <Button variant="plain" style={{ width: '100%' }}>Log in</Button>
        </Link>
        <Link to="/register" onClick={onClose} style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ width: '100%', marginTop: 8 }}>
            Get started <IconArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

// ─── App nav (authenticated) ──────────────────────────────
const APP_NAV = [
  { path: '/dashboard', label: 'Today', icon: IconHome },
  { path: '/tasks', label: 'Week', icon: IconList },
  { path: '/scheduler', label: 'Semester', icon: IconCalendar },
  { path: '/planora', label: 'Courses', icon: IconBook },
  { path: '/assistant', label: 'Ask AI', icon: IconSparkle },
];

// ─── Main export ──────────────────────────────────────────
export const TopNav = ({ inApp = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    if (!inApp) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [inApp]);

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [location.pathname]);

  if (inApp) {
    return (
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div className="nav-links" style={{ marginLeft: 24 }}>
            {APP_NAV.map(r => {
              const I = r.icon;
              return (
                <Link key={r.path}
                      to={r.path}
                      className="nav-link"
                      data-active={location.pathname === r.path ? 'true' : 'false'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  <I size={14} /> {r.label}
                </Link>
              );
            })}
          </div>
          <div className="nav-links">
            <button
              onClick={toggleTheme}
              className="nav-link"
              style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="nav-link" title="Notifications" style={{ padding: 8 }}>
              <IconBell size={16} />
            </div>
            <Link to="/settings" className="nav-link" title="Settings" style={{ padding: 8 }}>
              <IconSettings size={16} />
            </Link>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--charcoal)', color: 'var(--white)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, marginLeft: 6, cursor: 'pointer'
            }} onClick={() => navigate('/')} title="Back to marketing">
              AG
            </div>
          </div>
        </div>
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--fg-deep)', padding: 8, position: 'absolute', right: 16, top: 12
          }}
        >
          {mobileOpen ? (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          )}
        </button>
      </nav>
    );
  }

  // --- Premium Marketing Navbar ---
  return (
    <>
      <div style={{ height: 80 }} />
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: scrolled ? 12 : 20,
          left: 0,
          right: 0,
          margin: '0 auto',
          width: 'calc(100% - 40px)',
          maxWidth: 1060,
          height: scrolled ? 56 : 64,
          background: scrolled
            ? 'color-mix(in srgb, var(--surface) 96%, transparent)'
            : 'color-mix(in srgb, var(--surface) 88%, transparent)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid color-mix(in srgb, var(--fg-deep) 8%, transparent)',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6px 0 20px',
          zIndex: 100,
          boxShadow: scrolled 
            ? '0 12px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' 
            : '0 8px 24px rgba(0,0,0,0.05)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <PremiumLogo theme={theme} />
        </Link>

        {/* Desktop Links Center */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flex: 1, minWidth: 0 }}>
          <NavDropdown
            label="Features"
            items={FEATURES_ITEMS}
            isOpen={openDropdown === 'features'}
            onToggle={() => setOpenDropdown(openDropdown === 'features' ? null : 'features')}
            onClose={() => setOpenDropdown(null)}
          />
          {[
            { label: 'How It Works', to: '/how-it-works' },
            { label: 'Demo', to: '/demo' },
            { label: 'Pricing', to: '/pricing' },
          ].map((link, i) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={i} to={link.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ backgroundColor: 'color-mix(in srgb, var(--fg-deep) 6%, transparent)', color: 'var(--fg-deep)' }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? 'var(--fg-deep)' : 'var(--fg-muted)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute',
                        bottom: 4, left: 14, right: 14, height: 2,
                        background: 'var(--fg-deep)',
                        borderRadius: 2
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fg-muted)', transition: 'color 0.2s ease, background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--fg-deep) 6%, transparent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/login" style={{ textDecoration: 'none', marginLeft: 8 }}>
            <motion.div
              whileHover={{ color: 'var(--fg-deep)' }}
              style={{
                fontSize: 14, fontWeight: 600, color: 'var(--fg-muted)',
                padding: '8px 12px', transition: 'color 0.2s ease'
              }}
            >
              Log in
            </motion.div>
          </Link>
          
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.div
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={{
                rest: { scale: 1, boxShadow: '0 4px 12px color-mix(in srgb, var(--fg-deep) 15%, transparent)' },
                hover: { scale: 1.02, boxShadow: '0 8px 20px color-mix(in srgb, var(--fg-deep) 20%, transparent)' },
                tap: { scale: 0.98 }
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--fg-deep)', color: 'var(--bg)',
                padding: '9px 20px', borderRadius: 100,
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              Get started
              <motion.div 
                variants={{
                  rest: { x: 0 },
                  hover: { x: 4 }
                }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <IconArrowRight size={14} />
              </motion.div>
            </motion.div>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--fg-deep)', padding: 8
          }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          )}
        </button>
      </motion.div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {!inApp && mobileOpen && <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
