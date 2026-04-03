import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  const handlePricingClick = () => {
    const pricingElement = document.getElementById('pricing');
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-beigeSecondary dark:bg-charcoal border-y border-beigeMuted dark:border-white/[0.06] overflow-hidden relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-5xl lg:text-7xl font-playfair font-bold text-gray-950 dark:text-white leading-tight tracking-tight">
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
            <button
              onClick={handlePricingClick}
              className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-beigeMuted dark:border-white/[0.08] text-gray-950 dark:text-white font-outfit font-medium hover:bg-beigeSecondary dark:hover:bg-white/[0.06] transition-all duration-300"
            >
              View Pricing
            </button>
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
