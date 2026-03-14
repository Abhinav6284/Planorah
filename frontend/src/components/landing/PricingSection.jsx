import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: null,
      desc: "Perfect for getting started",
      features: [
        "5 Active Goals",
        "Basic Roadmaps",
        "Community Support",
        "Public Portfolio",
        "3 Resume Exports",
      ],
      cta: "Get Started Free",
      href: "/register",
      popular: false,
      gradient: "from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-800/40",
      border: "border-gray-200 dark:border-gray-700",
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      desc: "For serious creators and learners",
      features: [
        "Unlimited Goals",
        "AI Roadmap Generator",
        "Priority AI Mentor",
        "Custom Portfolio Domain",
        "Unlimited Resume Exports",
        "ATS Resume Scanner",
        "Advanced Analytics",
      ],
      cta: "Start Pro Trial",
      href: "/register",
      popular: true,
      gradient: "from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-800/40",
      border: "border-gray-800",
    },
    {
      name: "Team",
      price: "$29",
      period: "/month",
      desc: "For ambitious groups and teams",
      features: [
        "Everything in Pro",
        "Up to 10 Members",
        "Team Dashboard",
        "Shared Roadmaps",
        "Dedicated Support",
        "Custom Integrations",
      ],
      cta: "Start Team Trial",
      href: "/register",
      popular: false,
      gradient: "from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-800/40",
      border: "border-gray-200 dark:border-gray-700",
    },
  ];

  return (
    <section id="pricing" className="py-28 md:py-36 px-4 md:px-8 bg-gray-50 dark:bg-gray-800/30 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      {/* No decorative orb */}

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium mb-4"
          >
            Simple pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight"
          >
            Invest in your{" "}
            <span className="text-gray-900 dark:text-white">
              future
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-light"
          >
            No hidden fees. No surprise charges. Cancel anytime.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: plan.popular ? -6 : -3, transition: { duration: 0.2 } }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                  <span className="px-4 py-1 bg-gray-900 text-white text-xs font-bold rounded-full shadow-sm tracking-wide uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`relative rounded-2xl border ${plan.border} overflow-hidden ${
                  plan.popular
                    ? "bg-gray-900 dark:bg-black text-white shadow-2xl pt-6"
                    : `bg-gradient-to-br ${plan.gradient} shadow-sm pt-0`
                } p-8 flex flex-col h-full`}
              >
                {/* Plan name & price */}
                <div className="mb-8">
                  <h3 className={`text-lg font-bold mb-1 ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm mb-1 ${plan.popular ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                        plan.popular ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                      }`}>
                        <svg
                          className={`w-3 h-3 ${plan.popular ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-sm ${plan.popular ? "text-gray-200" : "text-gray-600 dark:text-gray-300"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={plan.href}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular
                        ? "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100"
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-400 dark:text-gray-500 mt-10"
        >
          Need a custom plan?{" "}
            <a href="mailto:support@planorah.me" className="text-gray-900 dark:text-white hover:underline font-medium">
            Contact us
          </a>{" "}
          for enterprise pricing.
        </motion.p>
      </div>
    </section>
  );
}
