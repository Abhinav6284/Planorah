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
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-4">
        <nav
          className={`flex items-center justify-between gap-6 px-4 md:px-6 py-2.5 rounded-full transition-all duration-500 max-w-6xl w-full ${scrolled
              ? "bg-white dark:bg-gray-900 shadow-lg shadow-gray-200 dark:shadow-black border border-gray-200 dark:border-gray-700"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            }`}
        >
          {/* Brand */}
          <Link
            to="/"
            className="text-base md:text-lg font-bold font-serif tracking-tight text-gray-900 dark:text-white whitespace-nowrap"
          >
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-0 inset-x-0 bottom-0 z-40 bg-white dark:bg-gray-900 pt-28 px-6"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-900 dark:text-white">
              {navLinks.map((link) => (
                link.to ? (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-gray-100 dark:border-white/[0.07] pb-4 text-gray-900 dark:text-gray-200"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-gray-100 dark:border-white/[0.07] pb-4 text-gray-900 dark:text-gray-200"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium"
                >
                  Join for free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
