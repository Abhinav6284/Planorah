import { useState, useEffect } from 'react';
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
      <div className="px-4 py-4 border-b border-white/10">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight text-white font-serif">
          Planora<span className="text-terracotta">.</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={userAvatar}
              alt="Profile"
              className="h-12 w-12 rounded-lg object-cover border-2 border-terracotta"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-gray-400">
              {getUserRole()}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Level</span>
          <span className="font-semibold text-terracotta bg-terracotta/10 px-2 py-1 rounded">
            {getUserLevel()}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isGroupActive
                    ? 'bg-terracotta text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                {group.label}
              </Link>
            );
          }

          const isOpen = expandedGroup === group.label;
          return (
            <div key={group.label}>
              <button
                onClick={() => setExpandedGroup(isOpen ? null : group.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isGroupActive
                    ? 'text-terracotta bg-terracotta/10'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const itemActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavClick}
                            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              itemActive
                                ? 'text-terracotta bg-terracotta/10 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
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
      <div className="px-3 py-4 border-t border-gray-200 dark:border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        <Link
          to="/profile"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-[#0f1419] border-r border-white/10 overflow-y-auto">
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
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden flex flex-col bg-[#0f1419] border-r border-white/10 overflow-y-auto shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onMobileClose}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
