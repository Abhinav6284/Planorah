import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const avatarData = [
  { initials: "P", bg: "bg-violet-400" },
  { initials: "A", bg: "bg-blue-400" },
  { initials: "M", bg: "bg-emerald-400" },
  { initials: "S", bg: "bg-amber-400" },
  { initials: "J", bg: "bg-rose-400" },
];

export default function CTASection() {
  return (
    <section className="py-32 md:py-44 bg-white dark:bg-[#0f1117] relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[480px] bg-gradient-to-tr from-sky-100/70 via-cyan-50/60 to-amber-100/60 dark:from-sky-900/20 dark:via-cyan-900/15 dark:to-amber-900/15 rounded-full blur-3xl opacity-75" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-16 md:px-16 md:py-24 shadow-[0_28px_72px_-24px_rgba(15,23,42,0.26)] dark:shadow-[0_28px_72px_-24px_rgba(0,0,0,0.5)]"
        >
          {/* Corner glows */}
          <div className="pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full bg-sky-100/60 dark:bg-sky-900/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-amber-100/60 dark:bg-amber-900/20 blur-2xl" />

          {/* Overline badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.07] border border-gray-200 dark:border-white/[0.1] text-sm font-semibold text-gray-600 dark:text-gray-300 mb-10"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Free to start · No credit card
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-bold font-serif tracking-[-0.03em] text-gray-900 dark:text-white mb-6 leading-[1.05]"
          >
            Your roadmap is
            <br />
            30 seconds away.
          </motion.h2>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-11 max-w-xl mx-auto leading-relaxed"
          >
            Join 14,000+ students who stopped guessing and started building
            their future — one clear day at a time.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.26, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-9 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl font-semibold text-lg hover:bg-black dark:hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] shadow-[0_10px_32px_-8px_rgba(0,0,0,0.36)] dark:shadow-[0_10px_32px_-8px_rgba(255,255,255,0.15)]"
            >
              Build My Free Roadmap
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.36, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatarData.map((a, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${a.bg} border-2 border-white dark:border-[#0f1117] flex items-center justify-center text-white text-[11px] font-bold`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <span className="font-bold text-gray-800 dark:text-gray-200">14,000+</span>{" "}
                  students · 4.9 rating
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-white/[0.1]" />

            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              No setup · No credit card · Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
