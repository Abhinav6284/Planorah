import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Planorah completely changed how I learn. The structured daily tasks keep me accountable, and the AI mentor is always there when I get stuck on deeply technical concepts.",
    name: "Alex Rivera",
    role: "Computer Science Student",
    avatar: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    initials: "AR",
  },
  {
    quote: "I used to spend more time organizing what to learn than actually learning. Planorah's AI roadmap generator built a complete curriculum for me in 5 seconds.",
    name: "Sarah Chen",
    role: "Self-taught Developer",
    avatar: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    initials: "SC",
  },
  {
    quote: "The interface is gorgeous. It feels like using a premium product, yet it's focused entirely on my educational growth. Highly recommended for anyone serious about upskilling.",
    name: "Michael Torres",
    role: "Bootcamp Graduate",
    avatar: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    initials: "MT",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden bg-white dark:bg-[#0f1117] border-y border-slate-200/60 dark:border-white/[0.05]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[8%] h-52 w-52 rounded-full bg-blue-100/35 dark:bg-blue-900/15 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[10%] h-64 w-64 rounded-full bg-emerald-100/35 dark:bg-emerald-900/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.22em] mb-5"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-bold font-serif tracking-[-0.025em] text-gray-900 dark:text-white"
          >
            Loved by ambitious students
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] rounded-2xl p-8 shadow-[0_10px_35px_-18px_rgba(15,23,42,0.2)] dark:shadow-none hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.24)] dark:hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="mb-8">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, idx) => (
                    <svg key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-[1.05rem] leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${t.avatar}`}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
