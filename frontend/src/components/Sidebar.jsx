import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
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
  CreditCard,
  Tag,
  Receipt
} from 'lucide-react';
import { getUserAvatar } from '../utils/avatar';

const navSections = [
  {
    type: 'standalone',
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    section: 'LEARN',
    items: [
      { path: '/lab', label: 'Virtual Lab', icon: Beaker },
      { path: '/roadmap/list', label: 'Learning Path', icon: MapPin },
      { path: '/roadmap/projects', label: 'My Projects', icon: FolderOpen },
      { path: '/planora', label: 'Study Platform', icon: BookOpen },
    ]
  },
  {
    section: 'CAREER',
    items: [
      { path: '/resume', label: 'Resume Builder', icon: FileText },
      { path: '/resume/compiled', label: 'Compiled Resumes', icon: Files },
      { path: '/ats', label: 'Find Your Fit', icon: Search },
      { path: '/jobs', label: 'Job Finder', icon: Briefcase },
      { path: '/interview', label: 'Mock Interview', icon: MessageSquare },
      { path: '/portfolio/edit', label: 'Portfolio', icon: Globe },
    ]
  },
  {
    section: 'TOOLS',
    items: [
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/scheduler', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    section: 'ACCOUNT',
    items: [
      { path: '/subscription', label: 'Subscription', icon: CreditCard },
      { path: '/pricing', label: 'Pricing', icon: Tag },
      { path: '/billing/history', label: 'Billing History', icon: Receipt },
    ]
  },
];

const SidebarContent = ({ onNavClick = () => {}, user = null }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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

  const userAvatar = getUserAvatar(user);

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-charcoalDark">
        <Link to="/dashboard" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-serif hover:text-terracotta transition-colors">
          Planorah<span className="text-terracotta">.</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="px-5 py-5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-charcoalDark">
        <div className="flex items-center gap-3">
          <img
            src={userAvatar}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {getUserName()}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getUserRole()}
              </p>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-terracotta/20 dark:bg-terracotta/20 text-terracotta font-semibold">
                {getUserLevel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 bg-white dark:bg-charcoalDark space-y-6">
        {/* Dashboard Link */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/dashboard"
            onClick={onNavClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              location.pathname === '/dashboard'
                ? 'bg-terracotta/15 dark:bg-terracotta/15 text-terracotta dark:text-terracotta shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
        </motion.div>

        {/* Section Groups */}
        {navSections.slice(1).map((section, sectionIdx) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (sectionIdx + 1) * 0.05 }}
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 px-4 pb-3">
                {section.section}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item, itemIdx) => {
                  const itemActive = location.pathname.startsWith(item.path);
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: (sectionIdx + 1) * 0.05 + itemIdx * 0.03 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link
                        to={item.path}
                        onClick={onNavClick}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                          itemActive
                            ? 'bg-terracotta/15 dark:bg-terracotta/15 text-terracotta dark:text-terracotta shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-charcoalDark space-y-2">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ x: 2 }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 font-medium"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </motion.button>

        <motion.div
          whileHover={{ x: 2 }}
        >
          <Link
            to="/profile"
            onClick={onNavClick}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 font-medium"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </motion.div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all duration-200 font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </>
  );
};

const Sidebar = ({ mobileOpen = false, onMobileClose = () => {}, user = null }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-charcoalDark border-r border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg overflow-y-auto">
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
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden flex flex-col bg-white dark:bg-charcoalDark border-r border-gray-200 dark:border-white/10 overflow-y-auto shadow-xl"
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  onClick={onMobileClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <X className="h-5 w-5" />
                </motion.button>
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
