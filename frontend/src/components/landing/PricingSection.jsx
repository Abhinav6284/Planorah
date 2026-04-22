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
      "2 x 1:1 Sessions/month (30 min)",
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
