import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Get started with the basics",
    features: [
      "1 Career Roadmap",
      "Basic Resume Generator",
      "Job Finder (limited)",
      "Quicky AI (5/day)",
      "Task Management (basic)",
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₹99",
    period: "/month",
    description: "For students building momentum",
    features: [
      "5 Career Roadmaps/month",
      "Full Resume Generator",
      "Job Finder (unlimited)",
      "Quicky AI (unlimited)",
      "Task & Project Management",
      "Portfolio Live (addon ₹79)",
    ],
    cta: "Get Started",
    href: "/pricing",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹249",
    period: "/month",
    description: "For serious students ready to execute",
    features: [
      "15 Career Roadmaps/month",
      "Everything in Starter",
      "ATS Scanner (unlimited)",
      "Resources Hub (50+ tools)",
      "Portfolio Live (included)",
      "5 x 1:1 Sessions/month (30 min)",
    ],
    cta: "Start Free Trial",
    href: "/pricing",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "₹499",
    period: "/month",
    description: "Full coaching & priority access",
    features: [
      "Unlimited Career Roadmaps",
      "Everything in Pro",
      "10 x 1:1 Sessions/month (45 min)",
      "Priority booking",
      "Async support (WhatsApp/Discord)",
      "Early access to new features",
    ],
    cta: "Go Elite",
    href: "/pricing",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-32 py-20 px-6 bg-beigeSecondary dark:bg-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pick what works. Cancel anytime. No BS.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl transition-all duration-300 ${plan.highlighted
                  ? "md:scale-[1.04] bg-gray-950 dark:bg-white text-white dark:text-gray-950"
                  : "bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-white/[0.08] hover:border-terracotta/30 dark:hover:border-white/[0.12]"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-semibold rounded-full">
                  Popular
                </div>
              )}

              <div
                className={`relative rounded-2xl border ${plan.border} overflow-hidden ${plan.popular
                    ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-2xl shadow-violet-500/25 pt-6"
                    : `bg-white dark:bg-gray-900 shadow-sm pt-0`
                  } p-8 flex flex-col h-full`}
              >
                {/* Plan name & price */}
                <div className="mb-8">
                  <h3 className={`text-lg font-bold mb-1 ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? "text-violet-200" : "text-gray-500 dark:text-gray-400"}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {plan.price}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  to={plan.href}
                  className={`w-full inline-flex items-center justify-center py-3 rounded-lg font-medium mb-8 transition-all duration-300 ${plan.highlighted
                      ? "bg-white dark:bg-charcoalDark text-gray-950 dark:text-white hover:bg-[#EBE6DA] dark:hover:bg-charcoal"
                      : "bg-[#EBE6DA] dark:bg-white/[0.06] text-gray-950 dark:text-white hover:bg-[#EBE6DA]/80 dark:hover:bg-white/[0.08]"
                    }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${plan.popular ? "bg-gray-200 dark:bg-gray-700" : "bg-violet-100 dark:bg-violet-900"
                        }`}>
                        <svg
                          className={`w-3 h-3 ${plan.popular ? "text-white" : "text-violet-600 dark:text-violet-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-sm ${plan.popular ? "text-violet-100" : "text-gray-600 dark:text-gray-300"}`}>
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
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${plan.popular
                        ? "bg-white text-violet-700 hover:bg-violet-50 shadow-sm"
                        : "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
                      }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </div>
            </div>
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
          <a href="mailto:support@planorah.me" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
            Contact us
          </a>{" "}
          for enterprise pricing.
        </motion.p>
      </div>
    </section>
  );
}
