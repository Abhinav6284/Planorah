import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
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

const navItemBaseClass = 'flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[13px] leading-tight transition-all duration-200';
const navItemActiveClass = 'bg-gradient-to-r from-terracotta/20 to-terracotta/8 text-terracotta dark:text-terracotta shadow-[0_6px_14px_rgba(202,96,58,0.14)]';
const navItemDefaultClass = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/5';

const isPathMatch = (pathname, navPath) => pathname === navPath || pathname.startsWith(`${navPath}/`);

const getActiveNavPath = (pathname) => {
  const allNavPaths = navSections.flatMap((section) => {
    if (section.path) return [section.path];
    if (section.items) return section.items.map((item) => item.path);
    return [];
  });

  const matchedPaths = allNavPaths.filter((navPath) => isPathMatch(pathname, navPath));
  if (!matchedPaths.length) return null;

  // Prefer the most specific route (longest path) so nested routes don't double-highlight.
  return matchedPaths.sort((a, b) => b.length - a.length)[0];
};

const SidebarContent = ({ onNavClick = () => { }, user = null }) => {
  const location = useLocation();
  const activeNavPath = getActiveNavPath(location.pathname);
  const [expandedSections, setExpandedSections] = useState(() =>
    navSections.slice(1).reduce((acc, section) => {
      acc[section.section] = true;
      return acc;
    }, {})
  );

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

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
      <div className="px-4 py-4 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-charcoalDark">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-serif hover:text-terracotta transition-colors">
          Planorah<span className="text-terracotta">.</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-charcoalDark">
        <div className="flex items-center gap-2.5">
          <img
            src={userAvatar}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-terracotta/20"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-[13px] truncate">
              {getUserName()}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                {getUserRole()}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta/20 dark:bg-terracotta/20 text-terracotta font-semibold">
                {getUserLevel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 bg-white/95 dark:bg-charcoalDark space-y-4">
        {/* Dashboard Link */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/dashboard"
            onClick={onNavClick}
            className={`${navItemBaseClass} ${activeNavPath === '/dashboard'
              ? navItemActiveClass
              : navItemDefaultClass
              }`}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Dashboard</span>
          </Link>
        </motion.div>

        {/* Section Groups */}
        {navSections.slice(1).map((section, sectionIdx) => {
          const sectionId = `sidebar-section-${section.section.toLowerCase()}`;
          const isExpanded = !!expandedSections[section.section];

          return (
            <motion.div
              key={section.section}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (sectionIdx + 1) * 0.05 }}
            >
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection(section.section)}
                  aria-expanded={isExpanded}
                  aria-controls={sectionId}
                  className="w-full flex items-center justify-between px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{section.section}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={sectionId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1">
                        {section.items.map((item, itemIdx) => {
                          const itemActive = activeNavPath === item.path;
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
                                className={`${navItemBaseClass} ${itemActive
                                  ? navItemActiveClass
                                  : navItemDefaultClass
                                  }`}
                              >
                                <IconComponent className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2.5 py-3 border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-charcoalDark space-y-1.5">
        <motion.div
          whileHover={{ x: 2 }}
        >
          <Link
            to="/profile"
            onClick={onNavClick}
            className={`${navItemBaseClass} ${navItemDefaultClass}`}
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">Settings</span>
          </Link>
        </motion.div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] leading-tight text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all duration-200 font-medium"
        >
          <LogOut className="h-4 w-4" />
          <span className="truncate">Logout</span>
        </motion.button>
      </div>
    </>
  );
};

const Sidebar = ({ mobileOpen = false, onMobileClose = () => { }, user = null }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-white to-[#f8f7f4] dark:from-charcoalDark dark:to-[#131313] border-r border-gray-200 dark:border-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:shadow-lg overflow-y-auto">
        <SidebarContent onNavClick={() => { }} user={user} />
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
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-64 max-w-[82vw] z-50 lg:hidden flex flex-col bg-gradient-to-b from-white to-[#f8f7f4] dark:from-charcoalDark dark:to-[#131313] border-r border-gray-200 dark:border-white/10 overflow-y-auto shadow-xl"
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  onClick={onMobileClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <X className="h-4 w-4" />
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
