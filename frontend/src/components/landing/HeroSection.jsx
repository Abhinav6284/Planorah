import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Trophy,
  Cpu,
  Flame,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const avatarData = [
  { initials: "P", bg: "bg-violet-400" },
  { initials: "A", bg: "bg-blue-400" },
  { initials: "M", bg: "bg-emerald-400" },
  { initials: "S", bg: "bg-amber-400" },
  { initials: "J", bg: "bg-rose-400" },
];

const mockupStates = [
  {
    id: "goal",
    label: "01 — Set Goal",
    header: "What's your learning goal?",
    sub: "Tell Planorah exactly what you want to achieve.",
    content: (
      <div className="space-y-3.5">
        <div className="h-11 w-full bg-gray-50 dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] rounded-xl flex items-center px-4 text-sm text-gray-900 dark:text-white font-medium">
          Master Full Stack Development
          <span className="ml-auto w-0.5 h-5 bg-gray-800 dark:bg-white animate-pulse rounded-full" />
        </div>
        <div className="flex gap-2">
          {["Beginner", "Intermediate", "Advanced"].map((lvl, i) => (
            <div
              key={lvl}
              className={`flex-1 py-2 rounded-xl text-center text-xs font-semibold border-2 transition-all ${i === 0
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                  : "bg-white dark:bg-transparent text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/[0.1]"
                }`}
            >
              {lvl}
            </div>
          ))}
        </div>
        <div className="h-11 w-full bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-gray-900 text-sm font-semibold gap-2">
          <Cpu className="w-4 h-4" /> Generate My Roadmap
        </div>
      </div>
    ),
  },
  {
    id: "roadmap",
    label: "02 — AI Roadmap",
    header: "Your personalized learning path",
    sub: "AI-structured milestones based on your level.",
    content: (
      <div className="space-y-2.5">
        {[
          { m: "M1", title: "HTML, CSS & JavaScript", color: "bg-blue-500" },
          { m: "M2", title: "React & Component Design", color: "bg-purple-500" },
          { m: "M3", title: "Node.js & REST APIs", color: "bg-emerald-500" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-50 dark:bg-white/[0.05] rounded-xl border border-gray-100 dark:border-white/[0.07] p-3 flex gap-3 items-center"
          >
            <div
              className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
            >
              {item.m}
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 ml-auto flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "tasks",
    label: "03 — Daily Tasks",
    header: "Today's tasks",
    sub: "Wake up knowing exactly what to do.",
    content: (
      <div className="space-y-2.5">
        {[
          { t: "Read: React Context API", done: true },
          { t: "Practice: Build Auth Flow", done: false, current: true },
          { t: "Quiz: State Management", done: false },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.current
                ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white"
                : item.done
                  ? "bg-gray-50 dark:bg-white/[0.04] border-gray-100 dark:border-white/[0.06]"
                  : "bg-white dark:bg-transparent border-gray-100 dark:border-white/[0.07]"
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done
                  ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                  : item.current
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "border-2 border-gray-200 dark:border-white/[0.2]"
                }`}
            >
              {item.done && <CheckCircle2 className="w-3 h-3" />}
              {item.current && (
                <span className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full block animate-pulse" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${item.done
                  ? "line-through text-gray-400"
                  : item.current
                    ? "text-white dark:text-gray-900"
                    : "text-gray-800 dark:text-gray-200"
                }`}
            >
              {item.t}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "progress",
    label: "04 — Track Progress",
    header: "Full Stack Masterclass",
    sub: "72% complete · 12-day streak",
    content: (
      <div className="flex items-center gap-6 py-1">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              stroke="currentColor" strokeWidth="9" fill="none"
              className="text-gray-200 dark:text-white/[0.1]"
            />
            <circle
              cx="50" cy="50" r="40"
              stroke="#10b981" strokeWidth="9" fill="none"
              strokeDasharray="251" strokeDashoffset="70" strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">72%</span>
          </div>
        </div>
        <div className="space-y-3.5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Streak</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-base font-bold text-gray-900 dark:text-white">12 days</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tasks Done</p>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              186 <span className="text-sm text-gray-400 font-normal">of 259</span>
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "mastery",
    label: "05 — Achieve Mastery",
    header: "Goal Accomplished!",
    sub: "Full Stack Development mastered in 5 months.",
    content: (
      <div className="flex flex-col items-center py-1 gap-4">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/40 rotate-3"
        >
          <Trophy className="w-7 h-7 text-white" />
        </motion.div>
        <div className="flex gap-2">
          {[
            { label: "Gold Learner", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30" },
            { label: "30-Day Streak", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30" },
          ].map((b, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold border ${b.color}`}>
              {b.label}
            </span>
          ))}
        </div>
        <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold flex items-center gap-2">
          View Certificate <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

export default function HeroSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % mockupStates.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const active = mockupStates[currentIdx];

  return (
    <section className="relative overflow-hidden bg-[#f7f6f2] pt-36 pb-24 md:pt-48 md:pb-36 dark:bg-[#090a0f]">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#f7f6f2] dark:bg-[#090a0f]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left: Text ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Announcement badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 mb-10 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Planorah 2.0 — AI Roadmaps are live
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.8rem] sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5.25rem] font-bold font-serif tracking-[-0.03em] leading-[0.95] text-gray-950 dark:text-white mb-7"
            >
              From confused
              <br />
              <span className="text-gray-700 dark:text-gray-300">to unstoppable.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[490px] mx-auto lg:mx-0 mb-10"
            >
              Planorah builds your personalized AI learning roadmap, breaks it
              into daily tasks, and keeps you consistent — until you actually
              reach your goal.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10 w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="group px-7 py-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.32)] dark:shadow-[0_8px_28px_-6px_rgba(255,255,255,0.15)]"
              >
                Build My Free Roadmap
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="#how-it-works"
                className="px-7 py-3.5 bg-white text-gray-700 rounded-xl font-semibold text-[15px] border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                See how it works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center lg:justify-start gap-4"
            >
              <div className="flex -space-x-2.5">
                {avatarData.map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${a.bg} border-2 border-white dark:border-gray-950 flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-medium ml-1">4.9</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <span className="font-bold text-gray-800 dark:text-gray-200">14,000+</span>{" "}
                  students already on their path
                </p>
              </div>
            </motion.div>

            {/* Trust signals */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.44 }}
              className="mt-5 text-xs text-gray-500 dark:text-gray-400 font-medium"
            >
              No credit card required · Free to start · Results in days
            </motion.p>
          </div>

          {/* ── Right: Animated App Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/40 dark:from-sky-900/20 via-violet-100/25 dark:via-violet-900/15 to-amber-100/40 dark:to-amber-900/10 blur-3xl rounded-3xl scale-110 pointer-events-none" />

            {/* Floating notification — top right */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -right-5 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-4 py-2.5 z-20 flex items-center gap-3 dark:bg-gray-800 dark:border-gray-700 dark:shadow-black/40"
            >
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-0.5">
                  Roadmap generated ✓
                </p>
                <p className="text-[10px] text-gray-400">Full Stack Dev · 6 months</p>
              </div>
            </motion.div>

            {/* Floating streak badge — bottom left */}
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-5 -left-5 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-4 py-2.5 z-20 flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:shadow-black/40"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">12-day streak 🔥</span>
            </motion.div>

            {/* Mockup card */}
            <div className="relative bg-white dark:bg-[#13151f] border border-gray-200/60 dark:border-white/[0.08] rounded-[1.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] overflow-hidden">

              {/* Browser chrome */}
              <div className="h-11 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50 dark:bg-white/[0.03]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/75" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/75" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/75" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="h-5 rounded-md bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center px-3">
                    <span className="text-[10px] text-gray-400 tracking-wide">app.planorah.me</span>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  {mockupStates.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${i === currentIdx
                          ? "w-5 bg-gray-900 dark:bg-white"
                          : i < currentIdx
                            ? "w-2 bg-gray-400 dark:bg-gray-700"
                            : "w-2 bg-gray-200 dark:bg-white/[0.15]"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="flex">
                {/* Slim sidebar */}
                <div className="w-12 border-r border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] flex flex-col items-center py-4 gap-3">
                  {[Target, Cpu, CheckCircle2, Flame, Trophy].map((Icon, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${i === currentIdx
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                          : i < currentIdx
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>

                {/* Content area */}
                <div className="flex-1 p-5 bg-white h-[340px] relative overflow-hidden dark:bg-gray-900">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-5 flex flex-col"
                    >
                      <div className="mb-5">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
                          {active.label}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                          {active.header}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {active.sub}
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        {active.content}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
