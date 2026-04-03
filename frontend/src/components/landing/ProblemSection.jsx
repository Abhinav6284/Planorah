import { motion } from "framer-motion";
import { Target, Cpu, Calendar, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Define Your Goal",
    description: "Pick an ambitious goal and set your timeline. We'll help you think bigger.",
    icon: Target,
  },
  {
    number: "02",
    title: "AI Builds Your Roadmap",
    description: "Our engine generates a structured roadmap with clear milestones instantly.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Execute Daily Tasks",
    description: "Receive bite-sized daily actions designed to fit your rhythm, not break it.",
    icon: Calendar,
  },
  {
    number: "04",
    title: "Track & Iterate",
    description: "See your progress clearly. Adjust as you learn. Build unstoppable momentum.",
    icon: TrendingUp,
  },
];

const gradients = [
  "from-blue-400/70 to-cyan-400/40",
  "from-purple-400/70 to-pink-400/40",
  "from-emerald-400/70 to-teal-400/40",
  "from-amber-400/70 to-orange-400/40",
];

export default function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-charcoal border-y border-gray-100 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-xs font-semibold text-[#D96C4A] uppercase tracking-widest">
            Process
          </span>
          <h2 className="text-5xl lg:text-6xl font-outfit font-bold text-gray-950 dark:text-white">
            How Planorah Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-outfit">
            Four simple steps from idea to achievement. No complexity, just clarity.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`p-[1px] rounded-2xl bg-gradient-to-br ${gradients[idx]} group`}
              >
                <div className="bg-white dark:bg-charcoalDark/80 rounded-2xl p-8 lg:p-10 h-full flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <span className="text-6xl font-outfit font-bold text-gray-100 dark:text-white/[0.08]">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-charcoal border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-950 dark:text-white group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-outfit font-bold text-gray-950 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400 font-outfit leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
