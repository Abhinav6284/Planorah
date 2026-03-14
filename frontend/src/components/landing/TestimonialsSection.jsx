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
    avatar: "bg-purple-100 text-purple-600",
    initials: "MT"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#FAFAFA] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
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
              className="bg-white border border-gray-200/60 rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
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
