import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Founder', to: '/founder' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
  { label: 'Blog', to: '/blogs' },
];

export default function PublicTopNav() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-beigeMuted/90 bg-beigePrimary/90 backdrop-blur-xl dark:border-charcoalMuted dark:bg-charcoalDark/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white shadow-sm dark:bg-charcoal">
            <img src="/planorah_logo.png" alt="Planorah" className="h-full w-full rounded-full object-contain" />
          </div>
          <span className="font-cormorant text-2xl font-bold text-textPrimary dark:text-beigePrimary">Planorah</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary dark:text-gray-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-full p-2 text-textSecondary transition-colors hover:bg-beigeSecondary hover:text-textPrimary dark:text-gray-300 dark:hover:bg-charcoal dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            to="/register"
            className="hidden rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-beigePrimary transition-colors hover:bg-charcoalMuted dark:bg-beigePrimary dark:text-charcoal dark:hover:bg-beigeSecondary sm:inline-flex"
          >
            Start Free
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-textSecondary transition-colors hover:bg-beigeSecondary hover:text-textPrimary dark:text-gray-300 dark:hover:bg-charcoal dark:hover:text-white md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-beigeMuted px-4 pb-5 pt-3 dark:border-charcoalMuted md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-textSecondary transition-colors hover:bg-beigeSecondary hover:text-textPrimary dark:text-gray-300 dark:hover:bg-charcoal dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex justify-center rounded-xl bg-charcoal px-4 py-2 text-sm font-semibold text-beigePrimary dark:bg-beigePrimary dark:text-charcoal"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
