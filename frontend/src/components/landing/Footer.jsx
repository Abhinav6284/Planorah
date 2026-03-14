import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const toPath = (label) =>
    `/${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  
  const columns = [
    {
      title: "Product",
      links: ["Features", "Roadmaps", "AI Mentor", "Pricing", "Changelog"]
    },
    {
      title: "Resources",
      links: ["Blog", "Community", "Guides", "Help Center", "API"]
    },
    {
      title: "Company",
      links: ["About", "Careers", "Contact", "Partners", "Legal"]
    }
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-50/90 via-white/90 to-emerald-50/35 border-t border-slate-200/70 pt-16 pb-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 right-[10%] h-56 w-56 rounded-full bg-cyan-100/30 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[12%] h-64 w-64 rounded-full bg-amber-100/35 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/planorah-logo.png" alt="Planorah" className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl md:text-2xl font-serif tracking-tight text-gray-900 whitespace-nowrap">
                Planorah
              </span>
            </Link>
            <p className="text-gray-500 font-medium mb-6 max-w-xs">
              Your personal AI learning roadmap. Structure your knowledge and achieve your goals faster.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Planorah on X" className="hover:text-gray-900 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Planorah on GitHub" className="hover:text-gray-900 transition-colors"><Github className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="Planorah on LinkedIn" className="hover:text-gray-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-gray-900 mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link to={toPath(link)} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-medium">
          <p>© {currentYear} Planorah Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
