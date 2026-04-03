import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Product", href: "#features" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Resources", href: "#resources" },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-6">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`flex items-center justify-between gap-8 px-8 py-3.5 rounded-full transition-all duration-300 max-w-6xl w-full ${scrolled
              ? "bg-white/70 dark:bg-charcoalDark/70 backdrop-blur-xl border border-beigeMuted dark:border-charcoal shadow-sm"
              : "bg-beigePrimary/40 dark:bg-charcoalDark/40 backdrop-blur-md border border-transparent"
            }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold font-cormorant text-charcoal dark:text-beigePrimary whitespace-nowrap tracking-wide flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal flex items-center justify-center text-sm font-outfit shadow-sm group-hover:scale-105 transition-transform duration-300">
              P.
            </div>
            Planorah
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[14px] font-outfit font-medium text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-terracotta transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-textSecondary dark:text-gray-400 hover:bg-beigeSecondary dark:hover:bg-charcoal transition-colors group"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 group-hover:text-terracotta transition-colors" />
              ) : (
                <Moon className="w-5 h-5 group-hover:text-charcoal transition-colors" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-5 border-l pl-5 border-beigeMuted dark:border-charcoal">
              <Link
                to="/login"
                className="text-sm font-outfit font-medium text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="h-[40px] px-6 inline-flex items-center justify-center text-[14px] rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-medium hover:bg-charcoalMuted dark:hover:bg-beigeSecondary dark:hover:shadow-warmHover transition-all duration-300 relative overflow-hidden group shadow-soft"
              >
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out" />
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-textSecondary dark:text-gray-400 hover:text-charcoal dark:hover:text-beigePrimary transition-colors rounded-full hover:bg-beigeSecondary dark:hover:bg-charcoal"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 inset-x-0 bottom-0 z-40 bg-beigePrimary/95 dark:bg-charcoalDark/95 backdrop-blur-2xl pt-28 px-6 pb-8 border-b border-beigeMuted dark:border-charcoal"
          >
            <div className="flex flex-col gap-2 max-w-lg mx-auto">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-4 text-lg font-medium text-textSecondary dark:text-gray-400 font-outfit hover:text-charcoal dark:hover:text-beigePrimary hover:bg-white dark:hover:bg-charcoal rounded-2xl transition-all shadow-sm border border-transparent hover:border-beigeMuted dark:hover:border-charcoalMuted"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4 mt-8 pt-8 border-t border-beigeMuted dark:border-charcoalMuted"
              >
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-4 text-center text-charcoal dark:text-beigePrimary font-outfit font-medium hover:bg-white dark:hover:bg-charcoal rounded-2xl transition-all border border-transparent hover:border-beigeMuted dark:hover:border-charcoalMuted shadow-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-4 text-center rounded-2xl bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-medium transition-all hover:bg-charcoalMuted dark:hover:bg-beigeSecondary shadow-warmHover"
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
