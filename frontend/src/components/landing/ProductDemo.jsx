import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["Dashboard", "Roadmap", "Code Studio", "Portfolio"];

const tabContent = {
  Dashboard: {
    title: "Your command center",
    description: "See everything at a glance — active goals, weekly progress, upcoming tasks, and AI-generated insights all in one unified dashboard.",
    preview: (
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tasks Done", value: "24", change: "+4", color: "from-violet-500 to-purple-600" },
            { label: "Streak", value: "12d", change: "+1", color: "from-emerald-500 to-teal-600" },
            { label: "XP Earned", value: "840", change: "+120", color: "from-amber-500 to-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900/60 rounded-xl p-3 border border-gray-100 dark:border-gray-700/60">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <span className="text-xs text-emerald-500 font-medium">{stat.change} today</span>
            </div>
          ))}
        </div>
        {/* Progress bars */}
        <div className="bg-white dark:bg-gray-900/60 rounded-xl p-4 border border-gray-100 dark:border-gray-700/60">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Goals</p>
          {[
            { name: "ML Fundamentals", pct: 72, color: "from-violet-500 to-purple-600" },
            { name: "Portfolio Website", pct: 45, color: "from-emerald-500 to-teal-600" },
            { name: "DSA Revision", pct: 88, color: "from-amber-500 to-orange-600" },
          ].map((item) => (
            <div key={item.name} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{item.name}</span>
                <span className="font-medium">{item.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  Roadmap: {
    title: "AI-generated learning paths",
    description: "Tell Planorah your goal and watch it generate a personalised, week-by-week roadmap with curated resources and milestones.",
    preview: (
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-900/60 rounded-xl p-4 border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Machine Learning Roadmap</span>
          </div>
          {[
            { week: "Week 1–2", topic: "Python & NumPy Basics", done: true },
            { week: "Week 3–4", topic: "Statistics & Linear Algebra", done: true },
            { week: "Week 5–6", topic: "Supervised Learning", done: false },
            { week: "Week 7–8", topic: "Neural Networks", done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0 border-gray-50 dark:border-gray-800">
              <div className={`w-5 h-5 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center ${item.done ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600"}`}>
                {item.done && (
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold ${item.done ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-800 dark:text-gray-200"}`}>{item.topic}</p>
                <p className="text-xs text-gray-400">{item.week}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  "Code Studio": {
    title: "Write and run code, right here",
    description: "A full Monaco editor with an integrated terminal — no more tab switching. Code, test, commit, and document, all in one place.",
    preview: (
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700/80 bg-gray-800">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-gray-400 font-mono">main.py</span>
        </div>
        <div className="p-4 font-mono text-sm text-left">
          <p><span className="text-blue-400">import</span> <span className="text-emerald-400">numpy</span> <span className="text-blue-400">as</span> <span className="text-emerald-400">np</span></p>
          <p className="mt-1"><span className="text-blue-400">import</span> <span className="text-emerald-400">matplotlib.pyplot</span> <span className="text-blue-400">as</span> <span className="text-emerald-400">plt</span></p>
          <br />
          <p><span className="text-gray-500"># Generate sample data</span></p>
          <p><span className="text-violet-400">X</span> <span className="text-gray-300">= np.linspace(</span><span className="text-amber-400">0</span><span className="text-gray-300">, </span><span className="text-amber-400">10</span><span className="text-gray-300">, </span><span className="text-amber-400">100</span><span className="text-gray-300">)</span></p>
          <p><span className="text-violet-400">y</span> <span className="text-gray-300">= np.sin(X) + np.random.randn(</span><span className="text-amber-400">100</span><span className="text-gray-300">) * </span><span className="text-amber-400">0.1</span></p>
          <br />
          <p><span className="text-gray-500"># Plot results</span></p>
          <p><span className="text-emerald-400">plt</span><span className="text-gray-300">.plot(</span><span className="text-violet-400">X</span><span className="text-gray-300">, </span><span className="text-violet-400">y</span><span className="text-gray-300">)</span></p>
          <p><span className="text-emerald-400">plt</span><span className="text-gray-300">.show()</span></p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <span className="text-green-400 text-xs">✓ Plot generated successfully</span>
          </div>
        </div>
      </div>
    ),
  },
  Portfolio: {
    title: "Your work, professionally presented",
    description: "Planorah auto-builds a stunning, shareable portfolio from your validated projects. Custom domain, real-time preview, one-click publish.",
    preview: (
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-900/60 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60">
          <div className="h-20 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="p-4 -mt-6">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-lg flex items-center justify-center text-xl mb-2">👨‍💻</div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Alex Johnson</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">ML Engineer · 12 verified projects</p>
            <div className="flex gap-2 flex-wrap">
              {["Python", "PyTorch", "React", "Docker"].map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium border border-violet-100 dark:border-violet-800/50">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <section id="demo" className="py-28 md:py-36 px-4 md:px-8 bg-gray-50 dark:bg-gray-800/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4"
          >
            Product Preview
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight"
          >
            See it in{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              action
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light"
          >
            Explore every tool built into Planorah — purpose-built to help you go from ideas to evidence.
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 mb-10 flex-wrap"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          {/* Left: Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "-text"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {tabContent[activeTab].title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base mb-6">
                {tabContent[activeTab].description}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/30"
              >
                Try {activeTab}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Right: Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "-preview"}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.35 }}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="flex-1 mx-2">
                  <div className="bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                    app.planorah.me/{activeTab.toLowerCase().replace(" ", "-")}
                  </div>
                </div>
              </div>
              {tabContent[activeTab].preview}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
