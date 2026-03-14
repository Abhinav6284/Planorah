import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "Core Feature",
    badgeColor: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    title: "Universal Validation",
    description: "For students, researchers, designers, professors — anyone building verified work gets a single powerful system.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "AI-First",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    title: "AI-Powered Roadmaps",
    description: "Generate personalised learning paths for any goal — from web dev to machine learning — with AI that knows your pace.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "Auto-Generate",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    title: "Compiled Outputs",
    description: "Auto-generate portfolios, resumes, and research logs from your validated work. One click from effort to evidence.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "Accountability",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    title: "Goal Enforcement",
    description: "Lock your goal, track progress with evidence, stay accountable. No fantasy — just consistent execution.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    badge: "Built-in IDE",
    badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    title: "Code Studio",
    description: "Write, test, and ship code directly within Planorah. Full Monaco editor with terminal — no context switching.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    badge: "Voice AI",
    badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
    title: "AI Mentor",
    description: "Chat or talk to your personal AI mentor. Voice-powered coaching that understands exactly where you are in your journey.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 md:py-36 px-4 md:px-8 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4"
          >
            Everything you need
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight"
          >
            One System,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              All Goals
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light"
          >
            Whether you code, research, design, or teach — one unified validation engine turns your work into undeniable proof.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800/60 p-6 hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden`}
            >
              {/* Subtle colour hover overlay */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`}
                style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.035) 0%, transparent 70%)' }}
              />

              {/* Icon */}
              <div className={`relative w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                <div className={`flex items-center justify-center ${feature.iconColor}`}>
                  {feature.icon}
                </div>
              </div>

              {/* Badge */}
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${feature.badgeColor} mb-3`}>
                {feature.badge}
              </span>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
