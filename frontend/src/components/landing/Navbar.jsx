import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Roadmaps", href: "#showcase" },
  ];

  return (
    <>
      <header className="fixed top-11 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <nav
          className={`flex items-center justify-between gap-6 px-4 md:px-6 py-2.5 rounded-full transition-all duration-500 max-w-3xl w-full ${
            scrolled
              ? "bg-gray-100/90 backdrop-blur-md shadow-lg shadow-gray-200/30"
              : "bg-gray-100/70 backdrop-blur-sm"
          }`}
        >
          {/* Brand */}
          <Link
            to="/"
            className="text-base md:text-lg font-bold font-serif tracking-tight text-gray-900 whitespace-nowrap"
          >
            Planorah
          </Link>

          {/* Desktop: Nav Links + Actions */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-black transition-colors whitespace-nowrap"
            >
              Join for free
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1.5 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-11 inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-900">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-gray-100 pb-4"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 text-gray-600 font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-black text-white rounded-full font-medium"
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
