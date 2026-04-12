import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

/**
 * Navbar - Top navigation bar with search and user menu
 *
 * Layout:
 * - Left: SearchBar (flex-grow)
 * - Right: Notification bell + UserMenu
 *
 * Features:
 * - Sticky positioning at top
 * - White/dark mode background
 * - Subtle shadow and bottom border
 * - Notification badge on bell icon
 * - Responsive padding and layout
 *
 * Components:
 * - SearchBar: Search input with clear functionality
 * - Bell icon: Notification indicator
 * - UserMenu: Avatar + dropdown with theme/logout
 */
const Navbar = () => {
  // TODO: Connect to notifications store when implemented
  const [notificationCount] = useState(0);

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar - Left Side */}
        <SearchBar />

        {/* Right Side - Notifications + User Menu */}
        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <button
            className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
