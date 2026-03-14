import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-28 md:py-36 px-4 md:px-8 relative overflow-hidden">
      {/* Deep dark background with subtle violet undertone */}
      <div className="absolute inset-0 bg-[#0D0820] dark:bg-[#070412]" />

      {/* Soft violet glow at top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-violet-600/20 to-transparent blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Start today — it's free
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
        >
          Stop planning.
          <br />
          Start proving.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Join 2,400+ builders who've replaced empty plans with verified, portfolio-ready work. Your future self will thank you.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="group px-10 py-4 bg-white text-gray-900 rounded-2xl text-base font-bold shadow-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              Get Started Free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </Link>
          <a href="#demo">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 border-2 border-white/30 text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              See a Demo
            </motion.button>
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          {[
            { icon: "🔒", text: "No credit card required" },
            { icon: "⚡", text: "Set up in 5 minutes" },
            { icon: "🎯", text: "Cancel anytime" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
