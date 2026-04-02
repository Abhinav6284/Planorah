import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Quiet focus for beginners.",
      features: [
        "Create up to 3 AI Roadmaps",
        "Basic Daily Tracking",
        "Standard Progress Analytics",
        "Community Access",
      ],
      cta: "Embrace Clarity",
      href: "/register",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "For the ambitious architect.",
      features: [
        "Unlimited AI Roadmaps",
        "Advanced Behavioral Streaks",
        "Dynamic Task Readjustment",
        "Full Analytics Dashboard",
        "Priority AI Processing",
      ],
      cta: "Begin Pro Trial",
      href: "/register",
      popular: true,
    },
    {
      name: "Pro+",
      price: "$29",
      period: "/month",
      description: "Uncompromising accountability.",
      features: [
        "Everything in Pro",
        "1-on-1 AI Mentorship Chat",
        "Export to Notion/Calendar",
        "Early Access to New Features",
      ],
      cta: "Secure Mastery",
      href: "/register",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 bg-beigePrimary dark:bg-charcoalDark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-24 text-center"
        >
          <h2 className="text-[44px] md:text-[56px] font-cormorant font-medium text-charcoal dark:text-beigePrimary mb-4">
            Transparent Investment
          </h2>
          <p className="text-[18px] text-textSecondary dark:text-gray-400 font-outfit max-w-2xl mx-auto">
            Choose the pace that fits your ambitions. Unshackle your potential without the hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, type: "spring", stiffness: 60 }}
              className={`relative rounded-[2rem] p-10 transition-all duration-500 h-full flex flex-col ${
                plan.popular
                  ? "bg-charcoal dark:bg-beigePrimary text-white dark:text-charcoal shadow-darkDepth dark:shadow-warmHover scale-105 z-10 border border-charcoal dark:border-beigePrimary hover:-translate-y-2"
                  : "bg-white dark:bg-charcoal border text-charcoal dark:text-beigePrimary border-beigeMuted dark:border-charcoalMuted shadow-sm hover:shadow-warmHover dark:hover:shadow-darkHover hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-terracotta text-white text-[12px] font-bold uppercase tracking-widest font-outfit shadow-md"
                >
                  Most Popular
                </motion.div>
              )}

              <div className="mb-8 pt-4">
                <h3 className="text-3xl font-cormorant font-bold mb-2 tracking-wide">
                  {plan.name}
                </h3>
                <p className={`text-[15px] font-outfit mb-8 h-10 ${
                  plan.popular 
                    ? "text-gray-300 dark:text-gray-600" 
                    : "text-textSecondary dark:text-gray-400"
                }`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-[56px] font-space font-bold leading-none tracking-tighter">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-[14px] font-outfit mb-3 ${
                      plan.popular 
                        ? "text-gray-400 dark:text-gray-500" 
                        : "text-textSecondary dark:text-gray-500"
                    }`}>
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <div className={`space-y-5 mb-10 flex-1 border-t pt-8 ${
                plan.popular 
                  ? "border-white/10 dark:border-black/10" 
                  : "border-beigeMuted dark:border-charcoalMuted"
              }`}>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular 
                        ? "bg-white/10 dark:bg-black/10" 
                        : "bg-beigeSecondary dark:bg-charcoalDark"
                    }`}>
                      <Check className={`w-3.5 h-3.5 ${
                        plan.popular 
                          ? "text-terracotta" 
                          : "text-charcoal dark:text-beigePrimary"
                      }`} strokeWidth={3} />
                    </div>
                    <span className={`text-[16px] font-outfit ${
                      plan.popular 
                        ? "text-gray-200 dark:text-charcoal" 
                        : "text-charcoal dark:text-beigePrimary"
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link to={plan.href} className="block mt-auto">
                <button
                  className={`w-full py-4 rounded-xl font-outfit font-medium text-[16px] transition-all duration-300 ${
                    plan.popular
                      ? "bg-white dark:bg-charcoal text-charcoal dark:text-beigePrimary hover:bg-beigeSecondary dark:hover:bg-charcoalMuted shadow-md"
                      : "bg-beigeSecondary dark:bg-charcoalDark text-charcoal dark:text-beigePrimary hover:bg-charcoal hover:text-white dark:hover:bg-charcoalMuted"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
