import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const navLinks = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/features" },
    { name: "Pricing", to: "/pricing" },
    { name: "Founder", to: "/founder" },
    { name: "Careers", to: "/careers" },
    { name: "Contact", to: "/contact" },
    { name: "Blog", to: "/blogs" },
];

export default function PublicSiteNav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-6">
                <motion.nav
                    initial={{ y: -32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 110, damping: 20 }}
                    className="flex items-center justify-between gap-5 px-5 py-3.5 rounded-full max-w-6xl w-full bg-white/80 dark:bg-charcoalDark/80 backdrop-blur-xl border border-beigeMuted dark:border-charcoal shadow-soft"
                >
                    <Link
                        to="/"
                        className="text-2xl font-bold font-cormorant text-charcoal dark:text-beigePrimary whitespace-nowrap tracking-wide flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <img src="/planorah_logo.png" alt="Planorah" className="w-full h-full object-contain" />
                        </div>
                        Planorah
                    </Link>

                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.to}
                                    className={`text-[13px] font-outfit font-medium transition-colors relative group ${isActive
                                            ? "text-charcoal dark:text-beigePrimary"
                                            : "text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary"
                                        }`}
                                >
                                    {link.name}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-[2px] bg-terracotta rounded-full transition-all duration-300 ${isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle color theme"
                            className="p-2 rounded-full text-textSecondary dark:text-gray-400 hover:bg-beigeSecondary dark:hover:bg-charcoal transition-colors group"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-5 h-5 group-hover:text-terracotta transition-colors" />
                            ) : (
                                <Moon className="w-5 h-5 group-hover:text-charcoal transition-colors" />
                            )}
                        </button>

                        <div className="hidden sm:flex items-center gap-3 border-l pl-3 border-beigeMuted dark:border-charcoal">
                            <Link
                                to="/login"
                                className="text-sm font-outfit font-medium text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="h-[38px] px-5 inline-flex items-center justify-center text-[13px] rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-medium hover:bg-charcoalMuted dark:hover:bg-beigeSecondary transition-all duration-300 shadow-soft"
                            >
                                Get Started
                            </Link>
                        </div>

                        <button
                            className="lg:hidden p-2 text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary transition-colors rounded-full hover:bg-beigeSecondary dark:hover:bg-charcoal"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.nav>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        className="fixed top-0 inset-x-0 bottom-0 z-40 bg-beigePrimary/95 dark:bg-charcoalDark/95 backdrop-blur-2xl pt-28 px-6 pb-8 border-b border-beigeMuted dark:border-charcoal"
                    >
                        <div className="flex flex-col gap-2 max-w-lg mx-auto">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-4 text-lg font-medium text-textSecondary dark:text-gray-400 font-outfit hover:text-charcoal dark:hover:text-beigePrimary hover:bg-white dark:hover:bg-charcoal rounded-2xl transition-all border border-transparent hover:border-beigeMuted dark:hover:border-charcoalMuted"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-col gap-4 mt-8 pt-8 border-t border-beigeMuted dark:border-charcoalMuted"
                            >
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-4 text-center text-charcoal dark:text-beigePrimary font-outfit font-medium hover:bg-white dark:hover:bg-charcoal rounded-2xl transition-all border border-transparent hover:border-beigeMuted dark:hover:border-charcoalMuted"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-4 text-center rounded-2xl bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-medium transition-all hover:bg-charcoalMuted dark:hover:bg-beigeSecondary"
                                >
                                    Get Started for Free
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
