import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const FloatingCard = ({ className, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function HeroSection() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  const tags = ["Learn skills", "Build projects", "Do research", "Track execution", "Generate outcomes"];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Soft background — light warm white */}
      <div className="absolute inset-0 bg-[#FAFAFA] dark:bg-gray-950" />

      {/* Very subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />

      {/* Radial fade at center so text pops */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,255,255,0.9)_0%,transparent_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(3,7,18,0.9)_0%,transparent_100%)]" />

      {/* Main content */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-700/50 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Turn Goals into Verified Work
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-gray-900 dark:text-white mb-6 leading-[1.05] tracking-tight"
          >
            Proof,{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
                Not Promises
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full origin-left"
              />
            </span>
            <span className="text-gray-200 dark:text-gray-700">.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 mb-8 max-w-3xl font-light leading-relaxed"
          >
            Planorah transforms your goals into verified, documented outcomes — building a portfolio of proof that speaks louder than any resume.
          </motion.p>

          {/* Tags */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-10">
            {tags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.07 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 16px 32px -8px rgba(124,58,237,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-semibold shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all"
              >
                Start Your Journey
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </Link>
            <a href="#demo">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold hover:border-gray-300 dark:hover:border-gray-600 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </motion.button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex -space-x-2">
              {["V", "S", "A", "M", "K"].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                  background: `hsl(${258 + i * 22}, 72%, ${58 + i * 4}%)`,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <span>Join <strong className="text-gray-900 dark:text-white">2,400+</strong> builders already on Planorah</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating UI preview cards */}
      <FloatingCard
        delay={1.2}
        className="absolute left-4 md:left-12 top-1/3 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-52"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Task Verified</p>
              <p className="text-xs text-gray-400">React Project</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">78% Complete</p>
        </motion.div>
      </FloatingCard>

      <FloatingCard
        delay={1.4}
        className="absolute right-4 md:right-12 top-1/3 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-52"
        >
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">This Week</div>
          <div className="space-y-2">
            {[
              { label: "Code commits", value: "12", color: "bg-violet-500" },
              { label: "Tasks done", value: "8", color: "bg-indigo-400" },
              { label: "Hours focused", value: "24", color: "bg-sky-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{stat.label}</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </FloatingCard>

      <FloatingCard
        delay={1.6}
        className="absolute left-4 md:left-20 bottom-24 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3 w-52"
        >
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Goal Achieved!</p>
            <p className="text-xs text-gray-400">ML Course completed</p>
          </div>
        </motion.div>
      </FloatingCard>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-400 dark:text-gray-600 font-medium tracking-wider uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
          />
        </div>
      </motion.div>
    </section>
  );
}
