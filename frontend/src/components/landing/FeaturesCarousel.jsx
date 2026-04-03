import { useState } from "react";
import { ChevronLeft, ChevronRight, Brain, Map, Zap, BarChart3, Target } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Brain Dump",
    subtitle: "Chaos to Clarity",
    description: "Dump everything on your mind. Raw thoughts, fears, dreams. Our AI transforms messy ideas into clear, actionable direction.",
    icon: Brain,
    image: "from-blue-500 to-cyan-500",
    stats: [
      { label: "Users Save", value: "45min/week" },
      { label: "Clarity Rate", value: "94%" },
    ]
  },
  {
    id: 2,
    title: "Life Map",
    subtitle: "Your Strategic Roadmap",
    description: "Build visual roadmaps for career, study, skills. See milestones like a game map. Plan like a pro.",
    icon: Map,
    image: "from-purple-500 to-pink-500",
    stats: [
      { label: "Avg Goals", value: "4.2/user" },
      { label: "Success Rate", value: "87%" },
    ]
  },
  {
    id: 3,
    title: "Locked In Mode",
    subtitle: "Focus Perfected",
    description: "No distractions. Pure execution. Timer + focus + dopamine UI. Watch your streaks grow.",
    icon: Zap,
    image: "from-emerald-500 to-teal-500",
    stats: [
      { label: "Avg Session", value: "52min" },
      { label: "Distraction Free", value: "98%" },
    ]
  },
  {
    id: 4,
    title: "Reality Check",
    subtitle: "Brutal Honesty",
    description: "See exactly what you're doing vs. what you planned. Missed days shown. Weekly performance tracking.",
    icon: BarChart3,
    image: "from-amber-500 to-orange-500",
    stats: [
      { label: "Users Report", value: "+31% Accountability" },
      { label: "Habit Fix Rate", value: "78%" },
    ]
  },
  {
    id: 5,
    title: "Next Move",
    subtitle: "Removes Decision Fatigue",
    description: "AI suggests your next step. No thinking needed. Just execute. Perfect for removing analysis paralysis.",
    icon: Target,
    image: "from-violet-500 to-indigo-500",
    stats: [
      { label: "Decisions/Day", value: "8.5" },
      { label: "Time Saved", value: "12min" },
    ]
  },
];

export default function FeaturesCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % features.length);
  const prev = () => setCurrent((current - 1 + features.length) % features.length);

  const feature = features[current];
  const Icon = feature.icon;

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Core Features</p>
          <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Features that actually matter
          </h2>
        </div>

        {/* Carousel */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Feature Info */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08]">
              <Icon className="w-4 h-4 text-gray-950 dark:text-white" />
              <span className="text-sm font-semibold text-gray-950 dark:text-white">{feature.subtitle}</span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white leading-tight mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {feature.stats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-xl p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-950 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="p-3 rounded-full bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-950 dark:text-white" />
              </button>

              <div className="flex gap-2">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === current ? "bg-gray-950 dark:bg-white" : "bg-gray-300 dark:bg-white/[0.2]"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-3 rounded-full bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-950 dark:text-white" />
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                {current + 1} / {features.length}
              </span>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative h-96 lg:h-full">
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.image} rounded-3xl opacity-20 blur-2xl`} />
            <div className={`relative h-full bg-gradient-to-br ${feature.image} rounded-3xl flex items-center justify-center`}>
              <Icon className="w-32 h-32 text-white opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
