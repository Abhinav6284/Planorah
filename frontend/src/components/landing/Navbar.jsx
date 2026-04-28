import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing',  to: '/pricing'  },
  { label: 'Blog',     to: '/blogs'    },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <nav ref={navRef} className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">

          {/* Logo */}
          <Link to="/" className="lp-logo">
            <img 
              src="/planorah_logo.png" 
              alt="Planorah" 
              style={{ 
                width: 28, 
                height: 28, 
                objectFit: 'contain',
                filter: 'var(--logo-invert)',
                marginRight: 8
              }} 
            />
            Planorah
          </Link>

          {/* Desktop nav links — centred */}
          <div className="lp-nav-links desktop-links" style={{ flex: 1, marginLeft: 28 }}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`lp-nav-link${location.pathname === l.to ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="lp-nav-links" style={{ gap: 4, marginLeft: 'auto' }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="lp-btn lp-btn-sm lp-btn-plain"
              style={{ padding: '7px 8px' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link to="/login" className="lp-btn lp-btn-sm lp-btn-plain always-show">
              Log in
            </Link>
            <Link to="/register" className="lp-btn lp-btn-sm lp-btn-primary always-show">
              Get started →
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lp-btn lp-btn-sm lp-btn-plain lp-mobile-menu-btn"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: 56, zIndex: 99,
          background: 'var(--bg)',
          padding: '20px 20px 48px',
          display: 'flex', flexDirection: 'column', gap: 4,
          borderTop: '1px solid var(--border-subtle)',
          overflowY: 'auto',
        }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`lp-nav-link${location.pathname === l.to ? ' active' : ''}`}
              style={{ fontSize: 16, padding: '12px 14px' }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/login" className="lp-btn lp-btn-plain"
              style={{ padding: '12px 16px', justifyContent: 'center', fontSize: 15 }}
              onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link to="/register" className="lp-btn lp-btn-primary"
              style={{ padding: '12px 16px', justifyContent: 'center', fontSize: 15 }}
              onClick={() => setMobileOpen(false)}>
              Get started →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
