import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer at Google",
    content: "Planorah transformed how I approach goals. Went from chaotic notes to structured roadmaps. 20x more productive.",
    avatar: "SC",
    image: "from-blue-400 to-cyan-400",
  },
  {
    name: "Marcus Johnson",
    role: "CS Student at Stanford",
    content: "The Locked In Mode is insane. I actually focus now. Streaks are my drug. First app that doesn't waste my time.",
    avatar: "MJ",
    image: "from-purple-400 to-pink-400",
  },
  {
    name: "Emma Rodriguez",
    role: "Startup Founder",
    content: "Reality Check feature keeps me honest. I see exactly what I'm avoiding. Game changer for accountability.",
    avatar: "ER",
    image: "from-emerald-400 to-teal-400",
  },
  {
    name: "Arun Patel",
    role: "Medical Student",
    content: "Prep Zone + Brain Dump combo is perfect. Handles my exam chaos. My study time is actually optimized now.",
    avatar: "AP",
    image: "from-amber-400 to-orange-400",
  },
  {
    name: "Lisa Wang",
    role: "Software Engineer",
    content: "Next Move feature removes decision fatigue. Just execute what it suggests. Best productivity hack ever.",
    avatar: "LW",
    image: "from-violet-400 to-indigo-400",
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Social Proof</p>
          <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Loved by 10,000+ users
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative max-w-3xl mx-auto">
          {/* Testimonial Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8 md:p-12 min-h-96 flex flex-col justify-between">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gray-950 dark:fill-white text-gray-950 dark:text-white" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              "{testimonials[current].content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonials[current].image} flex items-center justify-center text-white font-semibold text-lg`}>
                {testimonials[current].avatar}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-950 dark:text-white">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonials[current].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-950 dark:text-white" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    idx === current ? "bg-gray-950 dark:bg-white" : "bg-gray-300 dark:bg-white/[0.2]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition"
            >
              <ChevronRight className="w-6 h-6 text-gray-950 dark:text-white" />
            </button>
          </div>

          {/* Counter */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {current + 1} / {testimonials.length}
          </p>
        </div>
      </div>
    </section>
  );
}
