import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LayoutDashboard, Mic2, BookOpen, GitCommitHorizontal } from "lucide-react";

const showcases = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    title: "Your Learning Command Center",
    description:
      "Everything in one place — daily schedule, calendar, portfolio, AI intelligence readiness and weekly progress. Wake up to a fully structured, distraction-free day.",
    image: "/images/dashboard.png",
    glowColor: "rgba(99,102,241,0.20)",
    glowColorDark: "rgba(99,102,241,0.12)",
    borderColor: "border-indigo-100/80",
    borderColorDark: "dark:border-indigo-500/20",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    accentColor: "bg-indigo-500",
    overlineColor: "text-indigo-500 dark:text-indigo-400",
    reverse: false,
  },
  {
    icon: Mic2,
    label: "Voice AI Mentor",
    title: "Contextual AI Voice Assistance",
    description:
      "Speak naturally with your personal AI mentor. Get real-time coaching, choose from multiple voice personas, and finish every session knowing exactly what to do next.",
    image: "/images/voice-mentor.png",
    glowColor: "rgba(139,92,246,0.20)",
    glowColorDark: "rgba(139,92,246,0.12)",
    borderColor: "border-purple-100/80",
    borderColorDark: "dark:border-purple-500/20",
    iconBg: "bg-purple-50 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    accentColor: "bg-purple-500",
    overlineColor: "text-purple-500 dark:text-purple-400",
    reverse: true,
  },
  {
    icon: BookOpen,
    label: "Learning Paths",
    title: "Dynamic Learning Views",
    description:
      "Browse and manage AI-generated learning paths tailored to your exact goal, skill level, and timeline. One click to generate a full 6-month career strategy.",
    image: "/images/learning-paths.png",
    glowColor: "rgba(16,185,129,0.20)",
    glowColorDark: "rgba(16,185,129,0.12)",
    borderColor: "border-emerald-100/80",
    borderColorDark: "dark:border-emerald-500/20",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accentColor: "bg-emerald-500",
    overlineColor: "text-emerald-500 dark:text-emerald-400",
    reverse: false,
  },
  {
    icon: GitCommitHorizontal,
    label: "Roadmap",
    title: "Milestone Tracking",
    description:
      "Celebrate every win. Structured phases guide you from Foundations to Capstone with clear, trackable progress and real momentum at every step.",
    image: "/images/roadmap.png",
    glowColor: "rgba(245,158,11,0.20)",
    glowColorDark: "rgba(245,158,11,0.12)",
    borderColor: "border-amber-100/80",
    borderColorDark: "dark:border-amber-500/20",
    iconBg: "bg-amber-50 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    accentColor: "bg-amber-500",
    overlineColor: "text-amber-500 dark:text-amber-400",
    reverse: true,
  },
];

function BrowserFrame({ image, glowColor, glowColorDark, borderColor, borderColorDark }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative">
      {/* Colored glow */}
      <div
        className="absolute -inset-3 rounded-[2.2rem] blur-3xl pointer-events-none opacity-70 dark:hidden"
        style={{ background: glowColor }}
      />
      <div
        className="absolute -inset-3 rounded-[2.2rem] blur-3xl pointer-events-none opacity-50 hidden dark:block"
        style={{ background: glowColorDark || glowColor }}
      />
      {/* Browser chrome */}
      <div className={`relative rounded-[1.5rem] border ${borderColor} ${borderColorDark} bg-white dark:bg-[#13151f] shadow-[0_28px_90px_-14px_rgba(15,23,42,0.18)] dark:shadow-[0_28px_90px_-14px_rgba(0,0,0,0.5)] overflow-hidden`}>
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/90 dark:bg-white/[0.03] border-b border-gray-100/80 dark:border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center px-3">
              <span className="text-[10px] text-gray-400 select-none tracking-wide">planorah.me</span>
            </div>
          </div>
        </div>
        {!errored ? (
          <>
            {!loaded && (
              <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/[0.04] dark:to-white/[0.02] animate-pulse" />
            )}
            <img
              src={image}
              alt="Planorah app screenshot"
              className={`w-full block transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0 absolute inset-x-0 bottom-0"}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
            />
          </>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.04] dark:to-white/[0.02] flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Preview image coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ShowcaseItem({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const isReverse = Boolean(item.reverse);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`flex flex-col ${isReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-24`}
    >
      {/* Text block */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: isReverse ? 44 : -44 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="lg:w-[38%] flex-shrink-0"
      >
        <div className="space-y-6">
          <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
            <item.icon className={`w-7 h-7 ${item.iconColor}`} strokeWidth={1.5} />
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-[0.22em] ${item.overlineColor}`}>
              {item.label}
            </span>
            <h3 className="text-3xl md:text-[2.15rem] font-bold font-serif text-gray-900 dark:text-white mt-2 leading-[1.18]">
              {item.title}
            </h3>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
          <div className={`w-10 h-1 rounded-full ${item.accentColor}`} />
        </div>
      </motion.div>

      {/* Screenshot block */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: isReverse ? -44 : 44 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="lg:flex-1 w-full"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.9 }}
        >
          <BrowserFrame
            image={item.image}
            glowColor={item.glowColor}
            glowColorDark={item.glowColorDark}
            borderColor={item.borderColor}
            borderColorDark={item.borderColorDark}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="relative scroll-mt-36 py-28 overflow-hidden bg-white dark:bg-[#0f1117]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-14 left-[12%] h-56 w-56 rounded-full bg-cyan-100/45 dark:bg-cyan-900/15 blur-3xl" />
        <div className="absolute top-[35%] left-[-10%] h-80 w-80 rounded-full bg-indigo-100/25 dark:bg-indigo-900/12 blur-3xl" />
        <div className="absolute top-[68%] right-[-8%] h-72 w-72 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[8%] h-72 w-72 rounded-full bg-sky-100/35 dark:bg-sky-900/12 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-28">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.24em] mb-4"
          >
            Product Showcase
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="text-3xl md:text-5xl font-bold font-serif tracking-tight text-gray-900 dark:text-white mb-6"
          >
            A workspace designed for clarity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium"
          >
            Every pixel is optimized to keep you in the flow state. Planorah combines the
            power of a roadmap with the simplicity of a daily checklist.
          </motion.p>
        </div>

        <div className="space-y-36">
          {showcases.map((item, index) => (
            <ShowcaseItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
