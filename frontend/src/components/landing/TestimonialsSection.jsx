import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Planorah transformed how I approach learning. I went from juggling 10 tabs of tutorials to effortlessly completing daily assignments.",
    name: "Alex Rivera",
    role: "Computer Science Student",
    initials: "AR",
  },
  {
    quote: "I've tried many platforms, but the AI roadmap is unparalleled. It grasped my complex goals and dissolved the overwhelming anxiety behind them.",
    name: "Sarah Chen",
    role: "Self-taught Developer",
    initials: "SC",
  },
  {
    quote: "The quiet accountability mechanism works beautifully. I wake up, see my path, and execute. Currently on a 47-day streak.",
    name: "Michael Torres",
    role: "Bootcamp Graduate",
    initials: "MT",
  },
];

export default function TestimonialsSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [200, -200]);

  const transforms = [y1, y2, y3];

  return (
    <section ref={containerRef} className="py-32 overflow-hidden px-4 sm:px-6 lg:px-8 bg-beigeSecondary dark:bg-charcoal border-y border-beigeMuted dark:border-charcoalMuted">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-24 text-center"
        >
          <h2 className="text-[44px] md:text-[56px] font-cormorant font-medium text-charcoal dark:text-beigePrimary mb-4">
            Curated Feedback
          </h2>
          <p className="text-[18px] text-textSecondary dark:text-gray-400 font-outfit max-w-2xl mx-auto">
            See how others are taking back control of their time and discovering absolute focus.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start h-[500px]">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              style={{ y: transforms[idx] }}
              className="p-10 bg-white dark:bg-charcoalDark rounded-3xl border border-beigeMuted dark:border-charcoalMuted shadow-soft dark:shadow-darkSoft relative group hover:shadow-warmHover dark:hover:shadow-darkHover transition-all duration-500"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-beigePrimary dark:text-charcoalMuted opacity-50 group-hover:text-terracotta/20 dark:group-hover:text-terracotta/20 transition-colors duration-500" />
              
              <p className="text-[17px] text-charcoal dark:text-gray-300 font-outfit italic leading-relaxed h-[140px] relative z-10 pt-4">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-5 mt-6 pt-6 border-t border-beigeMuted dark:border-charcoalMuted relative z-10">
                <div className="w-12 h-12 rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal flex items-center justify-center font-bold font-outfit text-[14px] shadow-sm">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-outfit font-semibold text-charcoal dark:text-beigePrimary text-[16px]">
                    {testimonial.name}
                  </p>
                  <p className="font-outfit text-[13px] text-textSecondary dark:text-gray-500 mt-0.5">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
