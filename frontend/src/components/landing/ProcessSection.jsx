import { MessageCircle, Lightbulb, CheckCircle2, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Brain Dump",
    description: "Share what's on your mind. Goals, fears, dreams—unfiltered.",
    icon: MessageCircle,
  },
  {
    step: "02",
    title: "AI Structures It",
    description: "Our AI transforms chaos into a clear roadmap just for you.",
    icon: Lightbulb,
  },
  {
    step: "03",
    title: "Lock In & Execute",
    description: "Daily missions, focus sessions, streaks. Dopamine hits included.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Track & Grow",
    description: "See your progress, level up your skills, become the future you.",
    icon: TrendingUp,
  },
];

export default function ProcessSection() {
  return (
    <section id="how-it-works" className="scroll-mt-32 py-20 px-6 bg-beigeSecondary dark:bg-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Process</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            How Planorah works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Four simple steps from chaos to clarity to execution.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-3 w-6 h-[2px] bg-[#E5DFCC] dark:bg-white/[0.1]" />
                )}

                {/* Card */}
                <div className="h-full bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-white/[0.08] rounded-2xl p-8">
                  {/* Step Number */}
                  <div className="text-5xl font-outfit font-bold text-gray-200 dark:text-white/[0.08] mb-4">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className="w-8 h-8 text-gray-950 dark:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-outfit font-semibold text-gray-950 dark:text-white mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
