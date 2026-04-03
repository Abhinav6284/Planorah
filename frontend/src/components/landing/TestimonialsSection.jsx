import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer at Google",
    content: "Planorah transformed how I approach goals. Went from chaotic notes to structured roadmaps. 20x more productive.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "CS Student at Stanford",
    content: "The Locked In Mode is insane. I actually focus now. Streaks are my drug. First app that doesn't waste my time.",
    avatar: "MJ",
  },
  {
    name: "Emma Rodriguez",
    role: "Startup Founder",
    content: "Reality Check feature keeps me honest. I see exactly what I'm avoiding. Game changer for accountability.",
    avatar: "ER",
  },
  {
    name: "Arun Patel",
    role: "Medical Student",
    content: "Prep Zone + Brain Dump combo is perfect. Handles my exam chaos. My study time is actually optimized now.",
    avatar: "AP",
  },
  {
    name: "Lisa Wang",
    role: "Software Engineer",
    content: "Next Move feature removes decision fatigue. Just execute what it suggests. Best productivity hack ever.",
    avatar: "LW",
  },
  {
    name: "Jordan Keys",
    role: "High School Senior",
    content: "This app gets me. Future You section made college prep actually exciting. Not just another to-do list.",
    avatar: "JK",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-beigePrimary dark:bg-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Social Proof</p>
          <h2 className="text-5xl lg:text-6xl font-outfit font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Loved by 10,000+ users
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From students to founders. From chaos to clarity.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-white/[0.08] rounded-2xl p-6 hover:border-terracotta/30 dark:hover:border-white/[0.12] transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gray-950 dark:fill-white text-gray-950 dark:text-white" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center text-xs font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
