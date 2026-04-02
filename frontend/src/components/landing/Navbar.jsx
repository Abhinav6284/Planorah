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
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Roadmaps", href: "#showcase" },
    { name: "Blog", to: "/blogs" },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-4">
        <nav
          className={`flex items-center justify-between gap-6 px-4 md:px-6 py-2.5 rounded-full transition-all duration-500 max-w-6xl w-full ${
            scrolled
              ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg shadow-gray-200/30 dark:shadow-black/30 border border-gray-200/60 dark:border-white/[0.07]"
              : "bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm border border-gray-200/40 dark:border-white/[0.06]"
          }`}
        >
          {/* Brand */}
          <Link
            to="/"
            className="text-base md:text-lg font-bold font-serif tracking-tight text-gray-900 dark:text-white whitespace-nowrap"
          >
            Planorah
          </Link>

          {/* Desktop: Nav Links + Actions */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => (
              link.to ? (
                <Link
                  key={link.name}
                  to={link.to}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.name}
                </a>
              )
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/[0.08] transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-black dark:hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Join for free
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-0 inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-gray-950/97 backdrop-blur-xl pt-28 px-6"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-900 dark:text-white">
              {navLinks.map((link) => (
                link.to ? (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-gray-100 dark:border-white/[0.07] pb-4 text-gray-900 dark:text-gray-200"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-gray-100 dark:border-white/[0.07] pb-4 text-gray-900 dark:text-gray-200"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium"
                >
                  Join for free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
