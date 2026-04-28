import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Cpu, Calendar, TrendingUp, Trophy, CheckCircle2, BookOpen, Code2, Brain, Star, Flame, ArrowRight } from "lucide-react";

/* ─── Step Content Panels ─── */

const GoalContent = () => (
  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 dark:from-[#1a1d2e] dark:via-blue-900/10 dark:to-indigo-900/15 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 flex flex-col justify-center relative overflow-hidden">
    <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full border border-blue-100/50 dark:border-blue-500/10 pointer-events-none" />
    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border border-blue-100/30 dark:border-blue-500/[0.06] pointer-events-none" />
    <div className="space-y-6 relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-lg">Set Your Goal</h4>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">What do you want to learn?</label>
        <div className="h-12 w-full bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] rounded-xl flex items-center px-4 text-sm text-gray-900 dark:text-white font-medium shadow-sm">
          Full Stack Web Development
          <span className="ml-auto w-2 h-5 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current skill level</label>
        <div className="flex gap-2">
          {["Beginner", "Intermediate", "Advanced"].map((lvl, i) => (
            <div key={lvl} className={`flex-1 py-2.5 rounded-xl text-center text-sm font-medium border-2 transition-all ${i === 0
              ? "bg-black dark:bg-white text-white dark:text-gray-900 border-black dark:border-white shadow-md"
              : "bg-white dark:bg-transparent text-gray-500 dark:text-gray-500 border-gray-200 dark:border-white/[0.1] hover:border-gray-300 dark:hover:border-white/[0.2]"
              }`}>
              {lvl}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target timeline</label>
        <div className="flex gap-2">
          {["3 months", "6 months", "1 year"].map((t, i) => (
            <div key={t} className={`flex-1 py-2.5 rounded-xl text-center text-sm font-medium border-2 transition-all ${i === 1
              ? "bg-black dark:bg-white text-white dark:text-gray-900 border-black dark:border-white shadow-md"
              : "bg-white dark:bg-transparent text-gray-500 dark:text-gray-500 border-gray-200 dark:border-white/[0.1]"
              }`}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <button className="w-full h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-gray-900 text-sm font-semibold shadow-lg gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
        <Cpu className="w-4 h-4" /> Generate My Roadmap <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const RoadmapContent = () => (
  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white via-purple-50/20 to-violet-50/30 dark:from-[#1a1d2e] dark:via-purple-900/10 dark:to-violet-900/10 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 flex flex-col justify-center relative overflow-hidden">
    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-100/30 dark:bg-purple-900/20 blur-2xl pointer-events-none" />
    <div className="space-y-5 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">Your Learning Path</h4>
        </div>
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-500/30">AI Generated</span>
      </div>
      {[
        { m: "M1", title: "HTML, CSS & JavaScript Basics", weeks: "Week 1-3", status: "12 lessons", color: "bg-blue-500" },
        { m: "M2", title: "React & Component Architecture", weeks: "Week 4-8", status: "18 lessons", color: "bg-purple-500" },
        { m: "M3", title: "Node.js, Express & REST APIs", weeks: "Week 9-14", status: "15 lessons", color: "bg-emerald-500" },
        { m: "M4", title: "Databases, Auth & Deployment", weeks: "Week 15-20", status: "14 lessons", color: "bg-amber-500" },
      ].map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
          className="bg-white dark:bg-white/[0.05] rounded-xl border border-gray-100 dark:border-white/[0.07] p-4 flex gap-4 items-center shadow-sm hover:shadow-md dark:hover:bg-white/[0.08] transition-all">
          <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>{item.m}</div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{item.weeks}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-400">{item.status}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TasksContent = () => (
  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 dark:from-[#1e1a12] dark:via-amber-900/10 dark:to-orange-900/10 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 flex flex-col justify-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-100/20 dark:bg-amber-900/15 blur-2xl pointer-events-none" />
    <div className="space-y-5 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg">Today's Tasks</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monday, March 14</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/40 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-500/30">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">5 day streak</span>
        </div>
      </div>
      {[
        { t: "Read: React Context API", d: "15 min", type: "Reading", icon: BookOpen, done: true },
        { t: "Practice: Build Auth Wrapper", d: "45 min", type: "Coding", icon: Code2, done: false, current: true },
        { t: "Quiz: State Management", d: "10 min", type: "Quiz", icon: Brain, done: false },
      ].map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
          className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${item.current
            ? "bg-black dark:bg-white text-white dark:text-gray-900 border-black dark:border-white shadow-lg"
            : item.done
              ? "bg-gray-50/80 dark:bg-white/[0.04] border-gray-100 dark:border-white/[0.06]"
              : "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.07] shadow-sm"
            }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
            : item.current ? "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              : "border-2 border-gray-200 dark:border-white/[0.2]"
            }`}>
            {item.done ? <CheckCircle2 className="w-4 h-4" /> : item.current ? <span className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full animate-pulse" /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className={`text-sm font-semibold truncate ${item.done ? "text-gray-400 line-through"
              : item.current ? "text-white dark:text-gray-900"
                : "text-gray-900 dark:text-white"
              }`}>{item.t}</h5>
            <div className="flex items-center gap-2 mt-0.5">
              <item.icon className={`w-3 h-3 ${item.current ? "text-white/60 dark:text-gray-900/60" : "text-gray-400"}`} />
              <span className={`text-xs ${item.current ? "text-white/60 dark:text-gray-900/60" : "text-gray-400"}`}>{item.type} · {item.d}</span>
            </div>
          </div>
          {item.current && (
            <button className="px-3 py-1.5 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg text-xs font-bold shadow-sm">Start</button>
          )}
        </motion.div>
      ))}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-gray-500 dark:text-gray-400">Daily Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">1/3 done</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const ProgressContent = () => (
  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-[#111e1a] dark:via-emerald-900/10 dark:to-teal-900/10 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 flex flex-col justify-center relative overflow-hidden">
    <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-100/20 dark:bg-emerald-900/15 blur-3xl pointer-events-none" />
    <div className="space-y-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">Full Stack Masterclass</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Started 45 days ago</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-white/[0.1]" />
            <circle cx="60" cy="60" r="50" stroke="#10b981" strokeWidth="10" fill="none" strokeDasharray="314" strokeDashoffset="88" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">72%</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Complete</span>
          </div>
        </div>
        <div className="space-y-4 flex-1">
          {[
            { label: "Milestones", value: "3/4", sub: "completed" },
            { label: "Tasks Done", value: "186", sub: "of 259" },
            { label: "Avg. Daily", value: "4.1", sub: "tasks/day" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</span>
                <span className="text-xs text-gray-400">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">This Week</span>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">12 day streak</span>
          </div>
        </div>
        <div className="flex gap-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i < 4 ? "bg-emerald-500 text-white shadow-sm"
                : i === 4 ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-500/50"
                  : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-500"
                }`}>
                {i < 4 ? <CheckCircle2 className="w-4 h-4" /> : d}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MasteryContent = () => (
  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-yellow-50/60 via-white to-amber-50/30 dark:from-[#1e1a0a] dark:via-[#13151f] dark:to-amber-900/10 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 flex flex-col items-center justify-center relative overflow-hidden text-center">
    <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-500/30 opacity-60" />
    <div className="absolute top-14 right-12 w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-500/30 opacity-50" />
    <div className="absolute bottom-20 left-16 w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-500/30 opacity-40" />
    <div className="absolute top-24 left-1/3 w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-500/30 opacity-50" />
    <div className="relative z-10 space-y-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 rotate-3">
        <Trophy className="w-12 h-12 text-white drop-shadow-sm" />
      </motion.div>
      <div>
        <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-1">Goal Accomplished! 🎉</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[300px] mx-auto">You've mastered Full Stack Development in 5 months and 12 days.</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        {[
          { icon: Star, label: "Gold", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30" },
          { icon: Flame, label: "30-Day Streak", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30" },
          { icon: Brain, label: "Fast Learner", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30" },
        ].map((badge, i) => (
          <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${badge.color}`}>
            <badge.icon className="w-3.5 h-3.5" /> {badge.label}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button className="px-6 py-3 bg-black dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2">
          View Certificate <ArrowRight className="w-4 h-4" />
        </button>
        <button className="px-6 py-3 bg-white dark:bg-white/[0.06] text-gray-800 dark:text-gray-300 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.1] shadow-sm">
          Share Result
        </button>
      </div>
    </div>
  </div>
);

/* ─── Steps Array ─── */
const steps = [
  { id: 1, title: "Choose your goal", description: "Tell Planorah what you want to achieve. Master React, pass a certification, or become a Data Scientist.", icon: Target, content: <GoalContent /> },
  { id: 2, title: "AI builds roadmap", description: "Our AI breaks down your goal into a structured, chronological path accounting for your current skill level.", icon: Cpu, content: <RoadmapContent /> },
  { id: 3, title: "Daily tasks appear", description: "Your roadmap is translated into bite-sized daily tasks. Wake up knowing exactly what to tackle next.", icon: Calendar, content: <TasksContent /> },
  { id: 4, title: "Track progress", description: "Visualize your momentum. Watch completion rise as you check off milestones and build consistency.", icon: TrendingUp, content: <ProgressContent /> },
  { id: 5, title: "Achieve mastery", description: "Claim your success. Turn completed roadmaps into verifiable portfolio pieces.", icon: Trophy, content: <MasteryContent /> },
];

/* ─── Main Component ─── */
export default function ProductDemo() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getScrollParent = (node) => {
      let current = node.parentElement;
      while (current) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") && current.scrollHeight > current.clientHeight) {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    };

    const scrollParent = getScrollParent(container);
    let rafId = null;
    let resizeObserver = null;

    const updateStepFromScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight =
        scrollParent === window
          ? window.innerHeight
          : scrollParent.clientHeight;
      const scrollableDistance = container.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setActiveStep(0);
        return;
      }

      const parentTop = scrollParent === window ? 0 : scrollParent.getBoundingClientRect().top;
      const progress = Math.min(
        Math.max((parentTop - rect.top) / scrollableDistance, 0),
        1
      );
      const rawStep = Math.floor(progress * steps.length);
      const nextStep = Math.min(rawStep, steps.length - 1);

      setActiveStep((prev) => (prev === nextStep ? prev : nextStep));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateStepFromScroll();
      });
    };

    updateStepFromScroll();
    scrollParent.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);

    if (typeof window.ResizeObserver !== "undefined") {
      resizeObserver = new window.ResizeObserver(() => {
        scheduleUpdate();
      });
      resizeObserver.observe(container);
      if (scrollParent !== window) {
        resizeObserver.observe(scrollParent);
      }
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      scrollParent.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative bg-white dark:bg-[#0f1117]"
      style={{ height: "500vh" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-[8%] h-64 w-64 rounded-full bg-sky-100/45 dark:bg-sky-900/15 blur-3xl" />
        <div className="absolute top-1/3 right-[-5rem] h-80 w-80 rounded-full bg-violet-100/30 dark:bg-violet-900/15 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-emerald-100/35 dark:bg-emerald-900/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.14)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      <div className="sticky top-0 h-screen flex items-center overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side — Text */}
          <div className="flex flex-col justify-center h-full text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.h2
                key={`title-${activeStep}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold font-serif text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-6"
              >
                {steps[activeStep].title}
              </motion.h2>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${activeStep}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md mx-auto md:mx-0"
              >
                {steps[activeStep].description}
              </motion.p>
            </AnimatePresence>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-10">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeStep
                    ? "w-8 bg-gray-900 dark:bg-white"
                    : i < activeStep
                      ? "w-3 bg-gray-400 dark:bg-gray-600"
                      : "w-3 bg-gray-200 dark:bg-white/[0.15]"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Visual Mockups */}
          <div className="hidden md:block h-[380px] lg:h-[560px] w-full relative">
            <AnimatePresence mode="wait">
              {steps.map((step, index) => {
                if (index !== activeStep) return null;
                return (
                  <motion.div
                    key={step.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step.content}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
