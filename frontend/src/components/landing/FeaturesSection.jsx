import { Brain, Map, Zap, BarChart3, Target, Zap as ZapIcon, Briefcase, Users, BookOpen, RotateCw, Award, Eye } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Brain Dump",
    description: "What's inside your head rn? Dump raw thoughts, goals, and confusion. AI converts messy ideas into clear direction.",
    icon: Brain,
  },
  {
    id: 2,
    title: "Life Map",
    description: "Your life, but structured. Build roadmaps for career, study, skills. Visual paths with milestones like a game.",
    icon: Map,
  },
  {
    id: 3,
    title: "Locked In Mode",
    description: "No distractions. Just execution. Timer, focus, streaks with dopamine UI. Where users become addicted.",
    icon: Zap,
  },
  {
    id: 4,
    title: "Reality Check",
    description: "Are you actually doing something? Analytics show progress, missed days, weekly performance. Brutally honest.",
    icon: BarChart3,
  },
  {
    id: 5,
    title: "Next Move",
    description: "Don't think. Just do this. AI suggests your next step, removes decision fatigue. Daily mission style.",
    icon: Target,
  },
  {
    id: 6,
    title: "Build Yourself",
    description: "Upgrade your character. Skills tracker, XP system, levels from Beginner → Pro → Elite. Gamified AF.",
    icon: ZapIcon,
  },
  {
    id: 7,
    title: "Future You",
    description: "The version you're chasing. Resume builder, portfolio, job prep. Emotional + aspirational.",
    icon: Briefcase,
  },
  {
    id: 8,
    title: "Inner Circle",
    description: "You're not alone. Friends, accountability, shared streaks. Social = retention multiplier.",
    icon: Users,
  },
  {
    id: 9,
    title: "Prep Zone",
    description: "Exam mode activated. Study plans, revision tracking, mock tests. Built for students.",
    icon: BookOpen,
  },
  {
    id: 10,
    title: "Reset Room",
    description: "You messed up. It's fine. Break mode, mental reset, soft motivational UI. Underrated but powerful.",
    icon: RotateCw,
  },
  {
    id: 11,
    title: "Proof of Work",
    description: "Show what you've done. Projects, certificates, achievements timeline. Connects to hiring + portfolio.",
    icon: Award,
  },
  {
    id: 12,
    title: "Mirror",
    description: "Who are you becoming? Weekly reflection, AI behavior patterns. Deep, slightly scary, memorable.",
    icon: Eye,
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-beigePrimary dark:bg-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Superpowers</p>
          <h2 className="text-5xl lg:text-6xl font-outfit font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Everything you need to level up
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From brain dumps to life maps. Gamified progression to accountability. We built the features that actually matter.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group h-full"
              >
                <div className="h-full bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-white/[0.08] rounded-2xl p-6 hover:border-terracotta/30 dark:hover:border-white/[0.12] transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-[#EBE6DA] dark:bg-white/[0.06]">
                    <Icon className="w-6 h-6 text-gray-950 dark:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-outfit font-semibold text-gray-950 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* MVP Highlight */}
        <div className="mt-16 pt-12 border-t border-beigeMuted dark:border-white/[0.08]">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Core MVP (The Clean Stack)
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Brain Dump', 'Life Map', 'Locked In Mode', 'Next Move', 'Reality Check'].map((item) => (
              <div key={item} className="px-4 py-2 rounded-full bg-[#EBE6DA] dark:bg-white/[0.06] border border-beigeMuted dark:border-white/[0.08] text-sm text-gray-700 dark:text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
