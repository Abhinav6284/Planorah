import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Subtle backdrop */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
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
