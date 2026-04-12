import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  TrendingUp,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import NavItem from './NavItem';

/**
 * Navigation items configuration
 */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Sidebar - Navigation sidebar with collapse/expand, mobile overlay
 *
 * Features:
 * - Desktop: Fixed left sidebar, 256px open / 64px collapsed
 * - Mobile: Hidden by default, shows as overlay with backdrop
 * - Smooth animations on width and opacity changes
 * - Header with logo, footer with copyright
 * - 5 navigation items with active state indication
 *
 * Uses:
 * - useWorkspaceStore: sidebarOpen, currentSection
 * - Actions: setSidebarOpen, setCurrentSection
 */
const Sidebar = ({ user }) => {
  const [isMobile, setIsMobile] = useState(false);
  const sidebarOpen = useWorkspaceStore((state) => state.sidebarOpen);
  const currentSection = useWorkspaceStore((state) => state.currentSection);
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const setCurrentSection = useWorkspaceStore((state) => state.setCurrentSection);

  // Detect mobile breakpoint (lg breakpoint is 1024px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (sectionId) => {
    setCurrentSection(sectionId);
    // Close sidebar on mobile after nav click
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackdropClick = () => {
    setSidebarOpen(false);
  };

  // Mobile version - overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg z-40 flex flex-col lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <button
                onClick={handleBackdropClick}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Header */}
              <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center px-4">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Planora
                </h1>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={currentSection === item.id}
                    isExpanded={true}
                    onClick={() => handleNavClick(item.id)}
                  />
                ))}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.name && (
                    <span className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                  )}
                  &copy; 2026 Planora
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors z-20 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </>
    );
  }

  // Desktop version - fixed sidebar with collapse
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 fixed top-0 left-0 h-screen"
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        {sidebarOpen && (
          <motion.div
            className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Planora
            </h1>
          </motion.div>
        )}

        {/* Collapsed Header - Just Icon */}
        {!sidebarOpen && (
          <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-500 rounded-lg" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentSection === item.id}
              isExpanded={sidebarOpen}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </nav>

        {/* Collapse Button */}
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-16 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.div>
          )}
        </motion.button>

        {/* Footer */}
        {sidebarOpen && (
          <motion.div
            className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.name && (
                <span className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
              )}
              &copy; 2026 Planora
            </p>
          </motion.div>
        )}
      </motion.aside>

      {/* Desktop Spacer - Prevents content overlap */}
      <motion.div
        className="hidden lg:block bg-transparent"
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
    </>
  );
};

export default Sidebar;
