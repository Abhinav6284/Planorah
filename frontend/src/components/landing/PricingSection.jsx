import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Everything you need to get started",
    features: [
      "Brain Dump (unlimited)",
      "Life Map (1 roadmap)",
      "Locked In Mode (basic timer)",
      "Reality Check (weekly)",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious grinders",
    features: [
      "Everything in Starter",
      "Life Map (unlimited roadmaps)",
      "Next Move (AI suggestions)",
      "Build Yourself (XP system)",
      "Future You (resume builder)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$19.99",
    period: "/month",
    description: "For the obsessed",
    features: [
      "Everything in Pro",
      "Inner Circle (teams)",
      "Prep Zone (exam prep)",
      "Mirror (behavior insights)",
      "Advanced analytics",
      "1-on-1 coaching",
      "API access",
    ],
    cta: "Get Elite",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Pricing</p>
          <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pick what works. Cancel anytime. No BS.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? "md:scale-105 bg-gray-950 dark:bg-white text-white dark:text-gray-950"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.12]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-semibold rounded-full">
                  Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className={`text-2xl font-outfit font-bold mb-2 ${plan.highlighted ? "" : "text-gray-950 dark:text-white"}`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/80 dark:text-gray-950/80" : "text-gray-600 dark:text-gray-400"}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-5xl font-outfit font-bold ${plan.highlighted ? "" : "text-gray-950 dark:text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? "text-white/80 dark:text-gray-950/80" : "text-gray-600 dark:text-gray-400"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-medium mb-8 transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-white dark:bg-gray-950 text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                      : "bg-gray-100 dark:bg-white/[0.06] text-gray-950 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${plan.highlighted ? "text-white/90 dark:text-gray-950/90" : "text-gray-600 dark:text-gray-400"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
