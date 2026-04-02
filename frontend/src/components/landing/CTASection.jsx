import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-charcoal border-y border-beigeMuted dark:border-charcoalMuted overflow-hidden relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terracotta/5 dark:bg-terracotta/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage/5 dark:bg-sage/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="space-y-8"
        >
          {/* Headline */}
          <h2 className="text-[48px] sm:text-[64px] lg:text-[76px] font-medium font-cormorant text-charcoal dark:text-beigePrimary leading-tight tracking-tight">
            Ready to <span className="italic relative z-10">transform
              <div className="absolute bottom-2 left-0 w-full h-4 bg-terracotta/15 dark:bg-terracotta/20 -z-10 rounded-full blur-[2px] transform -rotate-1" />
            </span> your future?
          </h2>

          {/* Description */}
          <p className="text-[18px] sm:text-[20px] font-outfit text-textSecondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Join 10,000+ students who stopped guessing and started achieving. Build your roadmap in less than 2 minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 h-[56px] px-8 rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-bold hover:bg-charcoalMuted dark:hover:bg-beigeSecondary shadow-warmHover hover:shadow-soft hover:-translate-y-1 transition-all duration-300 group"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center justify-center h-[56px] px-8 rounded-full border border-beigeMuted dark:border-charcoalMuted text-charcoal dark:text-beigePrimary font-outfit font-bold hover:bg-beigeSecondary dark:hover:bg-charcoalMuted shadow-sm hover:shadow-md transition-all duration-300">
              View Pricing
            </button>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[14px] font-outfit font-medium text-textSecondary dark:text-gray-500 pt-8"
          >
            <span>✓ No credit card required</span>
            <div className="w-1.5 h-1.5 rounded-full bg-beigeMuted dark:bg-charcoalMuted hidden sm:block" />
            <span>✓ Free forever plan available</span>
            <div className="w-1.5 h-1.5 rounded-full bg-beigeMuted dark:bg-charcoalMuted hidden sm:block" />
            <span>✓ Cancel anytime</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
