import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white/75 via-sky-50/45 to-amber-50/50 relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[620px] h-[420px] bg-gradient-to-tr from-sky-100/70 via-cyan-50/70 to-amber-100/70 rounded-full blur-3xl opacity-80" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl px-8 py-14 md:px-14 md:py-20 shadow-[0_25px_70px_-28px_rgba(15,23,42,0.32)]"
        >
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-sky-100/55 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-amber-100/55 blur-2xl" />
          <h2 className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-gray-900 mb-6 leading-tight">
            Stop wandering. <br />
            Start learning with a roadmap.
          </h2>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of ambitious students organizing their learning journey effortlessly.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-xl font-medium text-lg hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-sm shadow-gray-200"
          >
            Create My Roadmap
            <ArrowRight className="w-5 h-5 font-bold" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
