import { FileText, Globe, Linkedin, CreditCard, Settings, LifeBuoy, Sun, Moon, LogOut } from 'lucide-react';
import { Menu } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { clearTokens, logoutBackend } from '../../utils/auth';
import { cx } from '../../utils/cx';

const initialOf = (user) => (user?.first_name || user?.username || user?.email || '?').charAt(0).toUpperCase();

export default function AvatarMenu({ user, side = 'top', compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logoutBackend();
    } catch {
      // Logout must still clear the session locally if the server call fails.
    }
    clearTokens();
    logout();
    window.location.href = '/login';
  };

  const items = [
    { label: 'Resume', icon: FileText, to: '/career/resume' },
    { label: 'Portfolio', icon: Globe, to: '/career/portfolio' },
    { label: 'LinkedIn check', icon: Linkedin, to: '/career/linkedin' },
    'divider',
    { label: 'Billing', icon: CreditCard, to: '/settings#billing' },
    { label: 'Settings', icon: Settings, to: '/settings' },
    { label: 'Support', icon: LifeBuoy, to: '/support' },
    { label: theme === 'light' ? 'Dark theme' : 'Light theme', icon: theme === 'light' ? Moon : Sun, onSelect: toggleTheme },
    'divider',
    { label: 'Log out', icon: LogOut, onSelect: handleLogout, danger: true },
  ];

  return (
    <Menu
      side={side}
      align={compact ? 'end' : 'start'}
      items={items}
      trigger={(props) => (
        <button
          type="button"
          aria-label="Account menu"
          {...props}
          className={cx(
            'flex items-center gap-2.5 rounded-md text-left text-sm text-muted hover:bg-surface-hover hover:text-fg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            compact ? 'p-1' : 'w-full px-2 py-1.5',
          )}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-hover text-xs font-semibold text-fg">
            {initialOf(user)}
          </span>
          {!compact && <span className="truncate">{user?.first_name || user?.username || 'Account'}</span>}
        </button>
      )}
    />
  );
}
