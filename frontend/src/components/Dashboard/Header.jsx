import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from "../../context/ThemeContext";
import { userService } from "../../api/userService";
import { AnimatePresence, motion } from 'framer-motion';
import { User, Bell, Mail, Sun, Moon, LogOut } from 'lucide-react';
import { getUserAvatar } from '../../utils/avatar';

const Header = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const fetchProfile = async () => {
            try {
                const profileData = await userService.getProfile();
                setUser(profileData);
            } catch (error) {
                console.error("Failed to load header profile", error);
            }
        };

        window.addEventListener('scroll', handleScroll);
        fetchProfile();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navGroups = [
        {
            label: "Dashboard",
            path: "/dashboard",
            type: "link"
        },
        {
            label: "Career",
            type: "dropdown",
            items: [
                { path: "/resume", label: "Resume Builder" },
                { path: "/resume/compiled", label: "Compiled Resumes" },
                { path: "/ats", label: "Find Your Fit" },
                { path: "/jobs", label: "Job Finder" },
                { path: "/interview", label: "Mock Interview" },
                { path: "/portfolio/edit", label: "Portfolio" },
            ]
        },
        {
            label: "Productivity",
            type: "dropdown",
            items: [
                { path: "/tasks", label: "Tasks" },
                { path: "/scheduler", label: "Calendar" },
            ]
        },
        {
            label: "Learning",
            type: "dropdown",
            items: [
                { path: "/lab", label: "Virtual Lab" },
                { path: "/roadmap/list", label: "Learning Path" },
                { path: "/roadmap/projects", label: "My Projects" },
                { path: "/planora", label: "Study Platform" },
            ]
        },
        {
            label: "Account",
            type: "dropdown",
            items: [
                { path: "/subscription", label: "Subscription" },
                { path: "/pricing", label: "Pricing" },
                { path: "/billing/history", label: "Billing History" },
            ]
        },
        // AI Help removed
    ];

    // Helper to get display name
    const displayName = user ? (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username) : "Student";
    const userRole = user?.role || "Student";
    const userAvatar = getUserAvatar(user);

    return (
        <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:px-6 md:py-3 ${isScrolled ? 'bg-transparent pointer-events-none' : 'bg-transparent'}`}>
            {/* Logo - hides on scroll */}
            <div className={`flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isScrolled ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                <Link to="/dashboard" className="whitespace-nowrap text-xl font-serif font-bold tracking-tight text-gray-900 dark:text-white md:text-[1.7rem]">
                    Planorah<span className="text-gray-400">.</span>
                </Link>
            </div>

            {/* Navigation - Centered with consistent sizing */}
            <nav className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center rounded-xl border border-gray-200/50 bg-white/95 px-1 py-1 shadow-md backdrop-blur-md dark:border-charcoalMuted/50 dark:bg-charcoal/95 md:flex">
                {navGroups.map((group, index) => {
                    const isActive = group.type === 'link'
                        ? location.pathname === group.path
                        : group.items.some(item => location.pathname.startsWith(item.path));

                    if (group.type === 'link') {
                        return (
                            <Link
                                key={index}
                                to={group.path}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${isActive
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-charcoalMuted"
                                    }`}
                            >
                                {group.icon && (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                )}
                                {group.label}
                            </Link>
                        );
                    }

                    return (
                        <div key={index} className="relative group">
                            <button
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${isActive
                                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-charcoalMuted"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-charcoalMuted"
                                    }`}
                            >
                                {group.label}
                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-charcoal rounded-xl shadow-xl border border-gray-100 dark:border-charcoalMuted p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoalMuted hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Mobile Menu Button - visible only on mobile */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-charcoal border border-gray-200 dark:border-charcoalMuted transition-all ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Right Side Icons - hides on scroll */}
            <div className={`relative hidden items-center gap-2.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex ${isScrolled ? 'pointer-events-none absolute right-8 translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`}>
                {/* Settings Dropdown */}
                <div className="relative group">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-transform hover:scale-105 hover:text-gray-900 dark:border-white/10 dark:bg-charcoal dark:text-gray-400 dark:hover:text-white" title="Settings">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-3 w-60 bg-white dark:bg-charcoal rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "support@planorah.me"}</p>
                        </div>
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"><User className="w-4 h-4 text-gray-600 dark:text-gray-300" /></span>
                            <span>My Profile</span>
                        </Link>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"><Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" /></span>
                            <span>Notifications</span>
                        </button>
                        <Link
                            to="/support"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"><Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" /></span>
                            <span>Contact Support</span>
                        </Link>
                        <div className="my-2 border-t border-gray-100 dark:border-white/5"></div>
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">{theme === 'light' ? <Moon className="w-4 h-4 text-gray-600" /> : <Sun className="w-4 h-4 text-yellow-400" />}</span>
                            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                        </button>
                        <div className="my-2 border-t border-gray-100 dark:border-white/5"></div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('access_token');
                                localStorage.removeItem('refresh_token');
                                window.location.href = '/login';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center"><LogOut className="w-4 h-4 text-red-500" /></span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Profile Section (Dynamic Data) */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-white/10">
                    <div className="text-right hidden lg:block">
                        <h4 className="text-[13px] font-bold leading-tight text-gray-900 dark:text-white">{displayName}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{userRole}</span>
                    </div>
                    <Link to="/profile" className="relative group cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] transition-all hover:shadow-lg">
                            <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
                                <img
                                    src={userAvatar}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-black"></div>
                    </Link>
                </div>
            </div>

            {/* Mobile Profile Avatar - visible only on mobile */}
            <Link to="/profile" className={`md:hidden relative ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500">
                    <div className="w-full h-full rounded-full bg-white dark:bg-black p-[1px]">
                        <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                </div>
            </Link>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-charcoalDark z-50 overflow-y-auto shadow-2xl"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-charcoalMuted">
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                                    Planorah<span className="text-gray-400">.</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-charcoal flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="p-6 border-b border-gray-100 dark:border-charcoalMuted">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
                                            <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{displayName}</h4>
                                        <p className="text-sm text-gray-500">{userRole}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <div className="p-4">
                                {navGroups.map((group, index) => (
                                    <div key={index} className="mb-2">
                                        {group.type === 'link' ? (
                                            <Link
                                                to={group.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === group.path
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoalMuted'
                                                    }`}
                                            >
                                                {group.icon && (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                )}
                                                <span className="font-medium">{group.label}</span>
                                            </Link>
                                        ) : (
                                            <div>
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    {group.label}
                                                </div>
                                                {group.items.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith(item.path)
                                                            ? 'bg-gray-100 dark:bg-charcoal text-gray-900 dark:text-white'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoalMuted/50'
                                                            }`}
                                                    >
                                                        <span>{item.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Actions */}
                            <div className="p-4 border-t border-gray-100 dark:border-charcoalMuted mt-auto">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoalMuted transition-colors"
                                >
                                    <span className="text-xl flex items-center justify-center">{theme === 'light' ? <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-yellow-400" />}</span>
                                    <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('access_token');
                                        localStorage.removeItem('refresh_token');
                                        window.location.href = '/login';
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
                                >
                                    <span className="text-xl flex items-center justify-center"><LogOut className="w-5 h-5" /></span>
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
