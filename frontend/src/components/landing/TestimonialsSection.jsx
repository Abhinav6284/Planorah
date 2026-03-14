import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Planorah completely changed how I learn. The structured daily tasks keep me accountable, and the AI mentor is always there when I get stuck on deeply technical concepts.",
    name: "Alex Rivera",
    role: "Computer Science Student",
    avatar: "bg-blue-100 text-blue-600",
    initials: "AR"
  },
  {
    quote: "I used to spend more time organizing what to learn than actually learning. Planorah's AI roadmap generator built a complete curriculum for me in 5 seconds.",
    name: "Sarah Chen",
    role: "Self-taught Developer",
    avatar: "bg-emerald-100 text-emerald-600",
    initials: "SC"
  },
  {
    quote: "The interface is gorgeous. It feels like using a premium product, yet it's focused entirely on my educational growth. Highly recommended for anyone serious about upskilling.",
    name: "Michael Torres",
    role: "Bootcamp Graduate",
    avatar: "bg-amber-100 text-amber-600",
    initials: "MT"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-50/60 via-white/80 to-emerald-50/45 border-y border-slate-200/60">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[8%] h-52 w-52 rounded-full bg-blue-100/35 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[10%] h-64 w-64 rounded-full bg-emerald-100/35 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-serif tracking-tight text-gray-900"
          >
            Loved by ambitious students
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/85 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-8 shadow-[0_10px_35px_-18px_rgba(15,23,42,0.2)] hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.24)] transition-all flex flex-col justify-between"
            >
              <div className="mb-8">
                <div className="flex gap-1 mb-4 text-black">
                  {[...Array(5)].map((_, idx) => (
                    <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">"{t.quote}"</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${t.avatar}`}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
