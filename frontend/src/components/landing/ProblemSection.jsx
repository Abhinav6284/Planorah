import React from "react";
import { motion } from "framer-motion";
import { Brain, ZapOff, Shuffle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const pains = [
  {
    icon: Brain,
    title: "Paralysis by choice",
    description:
      "YouTube, Udemy, courses, textbooks — you spend more time deciding what to learn than actually learning. The sheer volume is paralyzing.",
    accent: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/[0.07]",
  },
  {
    icon: ZapOff,
    title: "Inconsistency kills momentum",
    description:
      "You start strong for a week, then life happens. Without a daily system, streaks break, momentum collapses, and you're back to square one.",
    accent: "text-orange-400",
    border: "border-orange-500/20",
    bg: "bg-orange-500/[0.07]",
  },
  {
    icon: Shuffle,
    title: "No clear direction",
    description:
      "HTML one week, Python the next, back to React. Without a roadmap, every step feels uncertain — and you're never sure if you're building the right skills.",
    accent: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.07]",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ProblemSection() {
  return (
    /* In light mode: near-black dramatic section.
       In dark mode: even darker than the page to maintain contrast. */
    <section className="relative bg-[#0a0a0a] dark:bg-[#070709] py-32 md:py-44 overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:30px_30px]" />

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-white/[0.018] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-6"
          >
            Sound familiar?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-[-0.025em] leading-[1.05] text-white mb-7"
          >
            You're not lazy.
            <br />
            <span className="text-gray-300">You're just without a system.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-gray-300 font-medium leading-relaxed"
          >
            Every ambitious student hits these same three walls. And without the
            right structure, they stay stuck — no matter how motivated they are.
          </motion.p>
        </div>

        {/* Pain point cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center border mb-7 ${pain.bg} ${pain.border}`}>
                <pain.icon className={`w-5 h-5 ${pain.accent}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pain.title}</h3>
              <p className="text-gray-400 leading-relaxed font-medium text-[15px]">
                {pain.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Transition to solution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-gray-300 text-lg font-medium mb-8">
            That's exactly why we built Planorah.
          </p>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 rounded-xl font-semibold text-[15px] hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] shadow-[0_8px_28px_-6px_rgba(255,255,255,0.15)]"
          >
            Show me the solution
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
