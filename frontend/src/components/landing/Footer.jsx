import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Roadmap", to: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", to: "#" },
        { label: "Blog", to: "/blogs" },
        { label: "Contact", to: "/support" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-charcoal dark:bg-black text-beigePrimary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pb-16 pt-24 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8"
        >
          <div className="md:col-span-5">
            <Link to="/" className="text-[32px] font-bold font-cormorant text-white mb-6 block tracking-wide flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-beigePrimary text-charcoal flex items-center justify-center text-sm font-outfit font-bold">
                P.
              </div>
              Planorah
            </Link>
            <p className="text-[16px] font-outfit text-gray-400 mb-10 max-w-sm leading-relaxed">
              Translate complex ambitions into beautiful, structural daily focus. Elevate your potential.
            </p>
            
            <form className="mb-10 max-w-sm flex gap-2">
              <input 
                type="email" 
                placeholder="Stay updated" 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[15px] text-white font-outfit focus:outline-none focus:border-terracotta transition-colors placeholder:text-gray-500"
              />
              <button className="bg-white text-charcoal px-6 py-3 rounded-xl font-outfit font-semibold hover:bg-beigeSecondary transition-colors">
                Subscribe
              </button>
            </form>

            <div className="flex gap-4">
              {[
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Github, href: "https://github.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
                { icon: Mail, href: "mailto:hello@planorah.app" },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-terracotta transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
            {columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold font-outfit text-white mb-6 text-[18px]">
                  {col.title}
                </h4>
                <ul className="space-y-4">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-[15px] font-outfit text-gray-400 hover:text-terracotta transition-colors"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[15px] font-outfit text-gray-400 hover:text-terracotta transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[14px] font-outfit text-gray-500">
          <p>© {currentYear} Planorah Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Redefining Focus.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
