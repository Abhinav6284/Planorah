import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Cpu, Calendar, TrendingUp, Trophy, CheckCircle2, ArrowRight, Flame } from "lucide-react";

/* ─── Mockup Components (Plain Claude-like Visuals) ─── */

const GoalMockup = () => (
  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-blue-400/70 via-purple-400/50 to-cyan-400/40">
    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900/90 backdrop-blur-sm shadow-soft dark:shadow-darkSoft p-10 flex flex-col justify-center relative overflow-hidden font-outfit transition-colors duration-500">
      <div className="space-y-8 relative z-10 w-[90%] mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-white dark:border-white/[0.08] shadow-sm text-[#D96C4A]">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-gray-950 dark:text-white text-[22px] font-outfit font-bold tracking-wide">Determine Focus</h4>
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Primary Objective</label>
          <div className="h-14 w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-2xl flex items-center px-5 text-[15px] text-gray-950 dark:text-white font-medium shadow-sm">
            Full Stack Data Engineering
            <span className="ml-auto w-1.5 h-6 bg-[#D96C4A] rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Timeline</label>
          <div className="flex gap-3">
            {["3 months", "6 months", "1 year"].map((t, i) => (
              <div key={t} className={`flex-1 py-3 rounded-xl text-center text-[13px] font-bold border transition-colors ${i === 1
                ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950 border-gray-950 dark:border-white shadow-md scale-105"
                : "bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]"
                }`}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <button className="w-full h-14 bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white rounded-xl flex items-center justify-center gap-3 text-[14px] font-bold shadow-sm border border-gray-200 dark:border-white/[0.08] mt-4">
          <Cpu className="w-4 h-4 text-[#D96C4A]" />
          <span>Generate Architecture</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const RoadmapMockup = () => (
  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-purple-400/70 via-pink-400/50 to-red-400/40">
    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900/90 backdrop-blur-sm shadow-soft dark:shadow-darkSoft p-10 flex flex-col justify-center relative overflow-hidden font-outfit transition-colors duration-500">
      <div className="space-y-6 relative z-10 w-[94%] mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-2xl flex items-center justify-center">
              <Cpu className="w-6 h-6 text-gray-950 dark:text-white" />
            </div>
            <h4 className="font-bold text-gray-950 dark:text-white text-[22px] font-outfit font-bold tracking-wide">Path Mapping</h4>
          </div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#D96C4A] bg-[#D96C4A]/10 px-4 py-1.5 rounded-full border border-[#D96C4A]/20 uppercase">AI Synced</span>
        </div>
        <div className="space-y-3 pt-4">
          {[
            { m: "M1", title: "Python Foundations", weeks: "Week 1-3", color: "bg-[#D96C4A] text-white" },
            { m: "M2", title: "SQL Models", weeks: "Week 4-8", color: "bg-gray-950 dark:bg-white text-white dark:text-gray-950" },
            { m: "M3", title: "Airflow Pipelines", weeks: "Week 9-14", color: "bg-gray-100 dark:bg-gray-800" },
            { m: "M4", title: "Distributed Data", weeks: "Week 15-20", color: "bg-gray-100 dark:bg-gray-800" },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/[0.08] p-3.5 flex gap-4 items-center transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-outfit font-bold text-[11px] flex-shrink-0 ${item.color}`}>{item.m}</div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[14px] font-bold text-gray-950 dark:text-white truncate">{item.title}</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{item.weeks}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-200 dark:text-white/[0.08]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TasksMockup = () => (
  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-emerald-400/70 via-teal-400/50 to-cyan-400/40">
    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900/90 backdrop-blur-sm shadow-soft dark:shadow-darkSoft p-10 flex flex-col justify-center relative overflow-hidden font-outfit transition-colors duration-500">
      <div className="space-y-6 relative z-10 w-[94%] mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/[0.08] text-gray-950 dark:text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[22px] font-outfit font-bold tracking-wide">Daily Regimen</h4>
          </div>
          <div className="flex items-center gap-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 px-4 py-2 rounded-full shadow-md">
            <Flame className="w-4 h-4 text-[#D96C4A]" />
            <span className="text-[11px] font-bold">15 Day Streak</span>
          </div>
        </div>
        <div className="space-y-3 pt-4">
          {[
            { t: "DAG Architecture", d: "45 min", done: true },
            { t: "Airflow Operator", d: "90 min", current: true },
            { t: "Optimization", d: "20 min", next: true },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${item.current
              ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950 border-gray-950 dark:border-white shadow-md scale-105 z-10"
              : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/[0.08] opacity-60"
              }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${item.done ? "border-[#D96C4A] bg-[#D96C4A] text-white" : "border-gray-200 dark:border-white/[0.08]"}`}>
                {item.done && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0 text-[14px] font-bold truncate">{item.t}</div>
              <p className="text-[11px] opacity-60 font-medium uppercase tracking-wider">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProgressMockup = () => (
  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-400/70 via-orange-400/50 to-red-400/40">
    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900/90 backdrop-blur-sm shadow-soft dark:shadow-darkSoft p-10 flex flex-col justify-center relative overflow-hidden font-outfit transition-colors duration-500">
      <div className="space-y-8 relative z-10 w-[94%] mx-auto">
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/[0.08] pb-6 text-gray-950 dark:text-white">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#D96C4A]" />
          </div>
          <h4 className="font-bold text-[22px] font-outfit font-bold tracking-wide">Tracking</h4>
        </div>
        <div className="flex items-center gap-10">
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-100 dark:text-gray-800 transition-colors" />
              <circle cx="60" cy="60" r="50" stroke="#D96C4A" strokeWidth="10" fill="none" strokeDasharray="314" strokeDashoffset="88" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[32px] font-bold font-outfit font-bold text-gray-950 dark:text-white transition-colors">72%</span>
              <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase">Mastered</span>
            </div>
          </div>
          <div className="space-y-5 flex-1 w-full">
            {[
              { label: "Milestones", value: "3/4" },
              { label: "Tasks Done", value: "186" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] text-gray-950 dark:text-white transition-colors">
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{s.label}</div>
                <div className="text-[18px] font-bold font-outfit font-bold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MasteryMockup = () => (
  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-violet-400/70 via-purple-400/50 to-indigo-400/40">
    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900/90 backdrop-blur-sm shadow-soft dark:shadow-darkSoft p-10 flex flex-col items-center justify-center relative overflow-hidden text-center font-outfit transition-colors duration-500">
      <div className="relative z-10 space-y-8 w-full max-w-sm">
        <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm text-[#D96C4A]">
          <Trophy className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h3 className="text-[32px] font-medium font-outfit font-bold text-gray-950 dark:text-white leading-tight transition-colors">Absolute Mastery</h3>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed transition-colors">The architecture is set. The potential unleashed. Claim your proof.</p>
        </div>
        <button className="w-full h-14 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl text-[14px] font-bold uppercase tracking-widest shadow-md transition-colors">
          Secure Certificate
        </button>
      </div>
    </div>
  </div>
);

const steps = [
  { title: "Determine focus", desc: "Planorah translates complex goals into clear, structured architecture.", icon: Target, content: <GoalMockup /> },
  { title: "AI orchestration", desc: "Our engine deconstructs your ambition into a perfectly paced chronological journey.", icon: Cpu, content: <RoadmapMockup /> },
  { title: "Quiet execution", desc: "Focused, bite-sized tasks materialize. You know exactly what to conquer next.", icon: Calendar, content: <TasksMockup /> },
  { title: "Velocity tracking", desc: "Visualize momentum. Watch metrics rise as you build consistency.", icon: TrendingUp, content: <ProgressMockup /> },
  { title: "Absolute mastery", desc: "Reframe completed paths into verifiable assets and take the career leap.", icon: Trophy, content: <MasteryMockup /> },
];

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cycleTime = 6000;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % steps.length);
    }, cycleTime);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      id="how-it-works"
      className="py-32 bg-white dark:bg-slate-950 transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-xs font-semibold text-[#D96C4A] uppercase tracking-widest">How It Works</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] md:text-[56px] font-medium font-outfit font-bold tracking-tight text-gray-950 dark:text-white mb-6"
          >
            Designing your progress
          </motion.h2>
        </div>

        {/* Stepper Grid Layout */}
        <div
          className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Stepper */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left p-5 lg:p-6 rounded-[1.5rem] border transition-all duration-500 group relative overflow-hidden ${
                  activeTab === idx
                    ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/[0.08] shadow-soft dark:shadow-darkSoft opacity-100"
                    : "bg-transparent border-transparent opacity-40 hover:opacity-100 translate-x-0"
                }`}
              >
                {activeTab === idx && !isPaused && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: cycleTime / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-white/10"
                  />
                )}

                <div className="flex items-start gap-5 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    activeTab === idx ? "bg-[#D96C4A] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white"
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-[20px] font-bold font-outfit leading-none mb-2 ${
                      activeTab === idx ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {step.title}
                    </h3>
                    <AnimatePresence mode="wait">
                      {activeTab === idx && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[14px] text-gray-500 dark:text-gray-500 font-outfit max-w-[280px]"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-7 relative h-[450px] lg:h-[600px] w-full flex items-center justify-center perspective-[1000px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.9, rotateX: 10, y: 30, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, rotateX: -10, y: -30, filter: "blur(4px)" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                className="w-full max-w-lg h-full relative z-10"
              >
                {steps[activeTab].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
