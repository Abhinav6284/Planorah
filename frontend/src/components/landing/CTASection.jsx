import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section id="get-started" className="scroll-mt-32 py-32 px-4 sm:px-6 lg:px-8 bg-beigeSecondary dark:bg-charcoal border-y border-beigeMuted dark:border-white/[0.06] overflow-hidden relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-16 md:px-16 md:py-24 shadow-[0_28px_72px_-24px_rgba(15,23,42,0.26)] dark:shadow-[0_28px_72px_-24px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-playfair font-bold text-gray-950 dark:text-white leading-tight tracking-tight">
            Ready to transform your future?
          </h2>

          <p className="text-lg lg:text-xl font-outfit text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Join 10,000+ students who stopped guessing and started achieving. Build your roadmap in less than 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-outfit font-medium hover:bg-gray-800 dark:hover:bg-[#EBE6DA] shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-beigeMuted dark:border-white/[0.08] text-gray-950 dark:text-white font-outfit font-medium hover:bg-beigeSecondary dark:hover:bg-white/[0.06] transition-all duration-300"
            >
              View Pricing
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-outfit text-gray-600 dark:text-gray-400 pt-8"
          >
            <span>✓ No credit card required</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-charcoalMuted hidden sm:block" />
            <span>✓ Free forever plan available</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-charcoalMuted hidden sm:block" />
            <span>✓ Cancel anytime</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
