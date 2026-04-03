import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function AnimatedCounter({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    let rafId;
    const tick = () => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 2400, suffix: "+", label: "Active Builders", icon: "👥" },
  { value: 18000, suffix: "+", label: "Tasks Verified", icon: "✅" },
  { value: 4200, suffix: "+", label: "Portfolios Created", icon: "🏆" },
  { value: 98, suffix: "%", label: "Satisfaction Rate", icon: "⭐" },
];

const testimonials = [
  {
    quote: "Planorah changed how I approach learning. I used to just watch tutorials — now every topic I study becomes a verified piece of my portfolio.",
    author: "Priya S.",
    role: "CS Student, IIT Delhi",
    avatar: "P",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "The AI roadmap feature is genuinely impressive. It built a 12-week ML plan tailored to my background and I can see exactly how far I've come.",
    author: "Marcus T.",
    role: "Self-taught Developer",
    avatar: "M",
    color: "from-emerald-500 to-teal-600",
  },
  {
    quote: "I used to struggle showing recruiters my work. Now my Planorah portfolio does all the talking. Got two interviews from it this month alone.",
    author: "Aisha K.",
    role: "Aspiring Data Scientist",
    avatar: "A",
    color: "from-amber-500 to-orange-600",
  },
];

export default function StatsSection() {
  return (
    <section id="testimonials" className="py-28 md:py-36 px-4 md:px-8 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* No decorative background */}

      <div className="max-w-7xl mx-auto relative">
        {/* Stats */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-[#D96C4A] text-xs font-semibold uppercase tracking-widest mb-4"
          >
            Trusted worldwide
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight"
          >
            Builders <span className="text-[#D96C4A]">love it</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light"
          >
            Join thousands of learners and creators who've transformed how they work, learn, and prove their skills.
          </motion.p>
        </div>

        {/* Animated stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 text-center overflow-hidden group hover:shadow-lg hover:shadow-gray-100/80 dark:hover:shadow-gray-900/80 transition-shadow"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity rounded-2xl" />
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold mb-1 text-gray-900 dark:text-white">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm relative overflow-hidden group"
            >
              {/* Quote mark */}
              <div className="absolute -top-2 -right-2 text-8xl font-bold text-gray-200 dark:text-gray-700 opacity-60 group-hover:opacity-100 transition-opacity">
                "
              </div>
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.author}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
