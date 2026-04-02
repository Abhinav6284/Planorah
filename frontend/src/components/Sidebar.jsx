import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { getUserAvatar } from '../utils/avatar';

const navGroups = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    type: 'link',
    icon: LayoutDashboard
  },
  {
    label: 'Career',
    type: 'dropdown',
    icon: Briefcase,
    items: [
      { path: '/resume', label: 'Resume Builder' },
      { path: '/resume/compiled', label: 'Compiled Resumes' },
      { path: '/ats', label: 'Find Your Fit' },
      { path: '/jobs', label: 'Job Finder' },
      { path: '/interview', label: 'Mock Interview' },
      { path: '/portfolio/edit', label: 'Portfolio' },
    ]
  },
  {
    label: 'Productivity',
    type: 'dropdown',
    icon: CheckSquare,
    items: [
      { path: '/tasks', label: 'Tasks' },
      { path: '/scheduler', label: 'Calendar' },
    ]
  },
  {
    label: 'Learning',
    type: 'dropdown',
    icon: BookOpen,
    items: [
      { path: '/lab', label: 'Virtual Lab' },
      { path: '/roadmap/list', label: 'Learning Path' },
      { path: '/roadmap/projects', label: 'My Projects' },
      { path: '/planora', label: 'Study Platform' },
    ]
  },
  {
    label: 'Account',
    type: 'dropdown',
    icon: CreditCard,
    items: [
      { path: '/subscription', label: 'Subscription' },
      { path: '/pricing', label: 'Pricing' },
      { path: '/billing/history', label: 'Billing History' },
    ]
  },
];

const SidebarContent = ({ onNavClick = () => {}, user = null }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Auto-expand group containing active route
  useEffect(() => {
    const activeGroup = navGroups.find(group => {
      if (group.type === 'link') {
        return location.pathname === group.path;
      }
      return group.items?.some(item => location.pathname.startsWith(item.path));
    });
    if (activeGroup && activeGroup.type === 'dropdown') {
      setExpandedGroup(activeGroup.label);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const getUserName = () => {
    if (user?.user?.first_name) {
      return user.user.first_name;
    }
    if (user?.profile?.first_name) {
      return user.profile.first_name;
    }
    return 'User';
  };

  const getUserRole = () => {
    if (user?.profile?.role) return user.profile.role;
    return 'Student';
  };

  const getUserLevel = () => {
    if (user?.profile?.level) return user.profile.level;
    if (user?.statistics?.level) return user.statistics.level;
    return 'Beginner';
  };

  const userAvatar = getUserAvatar(user?.user?.profile_picture || user?.profile?.profile_picture || '');

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-borderMuted dark:border-white/10">
        <Link to="/dashboard" className="text-2xl font-serif font-bold tracking-tight text-textPrimary dark:text-white">
          Planora<span className="text-terracotta">.</span>
        </Link>
      </div>

      {/* User Profile Mini-Card */}
      <div className="px-4 py-4 border-b border-borderMuted dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-terracotta/60 to-terracotta p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-black p-[1px]">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-beigePrimary dark:border-[#1a1a1a] bg-green-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-textPrimary dark:text-white truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-textSecondary dark:text-slate-400 truncate">
              {getUserRole()}
            </p>
          </div>
          <span className="flex-shrink-0 rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-bold text-terracotta dark:text-terracotta/80">
            {getUserLevel()}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const isGroupActive = group.type === 'link'
            ? location.pathname === group.path
            : group.items?.some(item => location.pathname.startsWith(item.path));

          if (group.type === 'link') {
            return (
              <Link
                key={group.label}
                to={group.path}
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isGroupActive
                    ? 'bg-terracotta/10 text-terracotta border-l-2 border-terracotta pl-[10px]'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-beigeMuted dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                {group.label}
              </Link>
            );
          }

          // Dropdown group
          const isOpen = expandedGroup === group.label;
          return (
            <div key={group.label}>
              <button
                onClick={() => setExpandedGroup(isOpen ? null : group.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isGroupActive
                    ? 'text-terracotta bg-terracotta/5'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-beigeMuted dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-7 mt-1 space-y-0.5 border-l border-borderMuted dark:border-white/10 pl-3">
                      {group.items.map((item) => {
                        const itemActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavClick}
                            className={`block px-3 py-2 rounded-lg text-[13px] transition-colors ${
                              itemActive
                                ? 'text-terracotta font-semibold bg-terracotta/5'
                                : 'text-textSecondary hover:text-textPrimary hover:bg-beigeMuted dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                          >
                            {item.label}
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

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-borderMuted dark:border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-textSecondary hover:text-textPrimary hover:bg-beigeMuted dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <Link
          to="/profile"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-textSecondary hover:text-textPrimary hover:bg-beigeMuted dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
};

const Sidebar = ({ mobileOpen = false, onMobileClose = () => {}, user = null }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-beigePrimary to-beigeSecondary border-r border-borderMuted dark:from-[#0f0f0f] dark:to-[#1a1a1a] dark:border-white/10 overflow-y-auto">
        <SidebarContent onNavClick={() => {}} user={user} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden flex flex-col bg-gradient-to-b from-beigePrimary to-beigeSecondary dark:from-[#0f0f0f] dark:to-[#1a1a1a] border-r border-borderMuted dark:border-white/10 overflow-y-auto shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onMobileClose}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-borderMuted dark:border-white/10 bg-white dark:bg-white/5 text-textPrimary dark:text-white hover:bg-beigeMuted dark:hover:bg-white/10 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="pt-12">
                <SidebarContent onNavClick={onMobileClose} user={user} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
