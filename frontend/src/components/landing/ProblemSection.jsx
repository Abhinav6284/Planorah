import React from "react";
import { motion } from "framer-motion";
import { Brain, SearchX, Frown, CheckCircle, Compass, Zap } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    { icon: Brain, text: "Overwhelmed by endless learning resources" },
    { icon: SearchX, text: "No clear roadmap to reach big career goals" },
    { icon: Frown, text: "Inconsistent habits causing lost momentum" },
  ];

  const solutions = [
    { icon: Compass, text: "Curated, precise AI-generated pathways" },
    { icon: Zap, text: "Clear daily tasks mapped directly to success" },
    { icon: CheckCircle, text: "Organic tracking with built-in accountability" },
  ];

  return (
    <section className="relative bg-white dark:bg-charcoal py-32 border-y border-beigeMuted dark:border-charcoalMuted overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring" }}
            className="text-[40px] md:text-[48px] font-medium font-cormorant text-charcoal dark:text-beigePrimary mb-4"
          >
            Why Smart Students Struggle
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-textSecondary dark:text-gray-400 font-outfit text-lg"
          >
            Motivation isn't the problem. A lack of calm, structural clarity is.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Problem Column: Quiet and subtle */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 60 }}
            className="space-y-6"
          >
            <h3 className="text-[20px] font-outfit font-semibold text-textSecondary dark:text-gray-400 uppercase tracking-widest pl-4 mb-8">
              The Reality
            </h3>
            {problems.map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 rounded-2xl bg-beigePrimary dark:bg-charcoalDark border border-transparent dark:border-charcoalMuted shadow-sm hover:shadow-md dark:shadow-darkSoft transition-shadow">
                <div className="w-12 h-12 rounded-full bg-beigeSecondary dark:bg-charcoal flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-textSecondary dark:text-gray-400" />
                </div>
                <p className="text-[16px] text-charcoal dark:text-beigePrimary font-outfit font-medium tracking-wide">{item.text}</p>
              </div>
            ))}
          </motion.div>

          {/* Solution Column: High contrast opposite element to draw attention */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
            className="space-y-6 bg-charcoal dark:bg-beigePrimary p-8 md:p-10 rounded-[2rem] shadow-darkDepth dark:shadow-warmHover relative"
          >
            <h3 className="text-[20px] font-outfit font-semibold text-beigePrimary dark:text-charcoal uppercase tracking-widest pl-4 border-l-2 border-terracotta mb-8">
              The Planorah Way
            </h3>
            {solutions.map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/10 relative overflow-hidden group hover:bg-white/10 dark:hover:bg-black/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-terracotta" />
                </div>
                <p className="text-[16px] text-beigePrimary dark:text-charcoal font-outfit font-medium tracking-wide relative z-10">{item.text}</p>
              </div>
            ))}
            
            {/* Organic light burst behind items */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 rounded-full bg-terracotta/20 dark:bg-terracotta/10 blur-[80px] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
