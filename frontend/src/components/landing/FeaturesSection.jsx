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
    <section
      id="features"
      className="relative scroll-mt-36 py-32 md:py-44 overflow-hidden bg-white dark:bg-[#0f1117] border-y border-slate-200 dark:border-gray-700"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none bg-white dark:bg-[#0f1117]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group h-full"
              >
                <div className="h-full bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-gray-700 rounded-2xl p-6 hover:border-terracotta/30 transition-all duration-300 shadow-sm dark:shadow-none">
                  {/* Icon */}
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-[#EBE6DA] dark:bg-gray-800">
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

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-9 border border-slate-200 dark:border-gray-700 shadow-[0_8px_32px_-14px_rgba(15,23,42,0.12)] dark:shadow-none hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.2)] hover:border-slate-300 dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-sky-50 border border-slate-100 dark:bg-gray-700 dark:border-gray-600 flex items-center justify-center mb-7 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 text-gray-800 dark:text-gray-300" strokeWidth={1.5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
