import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useNavigate } from 'react-router-dom';
import { logoutBackend, clearTokens, clearTrustedDeviceToken } from '../../utils/auth';

/**
 * UserMenu - User avatar and dropdown menu with theme toggle and logout
 *
 * Features:
 * - Avatar circle with gradient (indigo to blue)
 * - Shows first letter of user's first_name or 'U'
 * - Name label visible on sm+ screens
 * - Dropdown menu with:
 *   - User email
 *   - Theme toggle (Moon/Sun icon)
 *   - Logout button (red, LogOut icon)
 * - Click outside to close dropdown
 * - Dark mode support
 *
 * Uses:
 * - useAuthStore: user, logout
 * - useWorkspaceStore: theme, toggleTheme
 * - useNavigate: for redirecting to login
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useWorkspaceStore((state) => state.theme);
  const toggleTheme = useWorkspaceStore((state) => state.toggleTheme);
  const navigate = useNavigate();

  // Get user initial
  const userInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logoutBackend();
    clearTokens();
    clearTrustedDeviceToken();
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="User menu"
      >
        {/* Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-indigo to-accent-blue flex items-center justify-center text-white font-semibold text-sm">
          {userInitial}
        </div>

        {/* User Name - visible on sm+ screens */}
        {user?.first_name && (
          <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
            {user.first_name}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Email */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.email || 'User'}
            </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm border-t border-gray-200 dark:border-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
