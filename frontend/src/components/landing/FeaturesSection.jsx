import React from "react";
import { motion } from "framer-motion";
import {
  Route,
  TrendingUp,
  MessageSquare,
  Target,
  CalendarCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Route,
    title: "AI Roadmap Generator",
    description:
      "Describe your goal — get a complete, structured learning path in seconds. Personalized to your skill level, timeline, and career target.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Visualize your momentum. Track daily completions, milestone streaks, and overall progress so you always know exactly how far you've come.",
  },
  {
    icon: MessageSquare,
    title: "AI Mentor",
    description:
      "Stuck on a concept? Get real-time explanations, code reviews, and guidance from an AI mentor available 24/7 — no waiting for office hours.",
  },
  {
    icon: Target,
    title: "Goal-Based Learning",
    description:
      "Set your career objective — data scientist, full-stack engineer, designer — and we break it into a clear, actionable daily plan.",
  },
  {
    icon: CalendarCheck,
    title: "Daily Task Engine",
    description:
      "Eliminate decision fatigue. Wake up every morning with a pre-built, optimized schedule tailored to where you are in your roadmap.",
  },
  {
    icon: Sparkles,
    title: "Smart Adaptation",
    description:
      "Falling behind? Moving faster than expected? Planorah continuously adjusts your plan so you're always learning at the perfect pace.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-36 py-32 md:py-44 overflow-hidden bg-white dark:bg-[#0f1117] border-y border-slate-200 dark:border-gray-700"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none bg-white dark:bg-[#0f1117]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.22em] mb-5"
          >
            Features
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-bold font-serif tracking-[-0.025em] text-gray-900 dark:text-white mb-5"
          >
            Everything you need.
            <br />
            <span className="text-gray-400 dark:text-gray-600">Nothing you don't.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
          >
            A focused environment built to remove friction, keep you in flow,
            and guarantee you make progress every single day.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-9 border border-slate-200 dark:border-gray-700 shadow-[0_8px_32px_-14px_rgba(15,23,42,0.12)] dark:shadow-none hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.2)] hover:border-slate-300 dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-sky-50 border border-slate-100 dark:bg-gray-700 dark:border-gray-600 flex items-center justify-center mb-7 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 text-gray-800 dark:text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-[1.125rem] font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-[15px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
