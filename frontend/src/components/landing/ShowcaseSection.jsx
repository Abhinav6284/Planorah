import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LayoutDashboard, Mic2, BookOpen, GitCommitHorizontal } from "lucide-react";

const showcases = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    title: "Your Learning Command Center",
    description:
      "Everything in one place — daily schedule, calendar, and weekly progress. Wake up to a fully structured, distraction-free day.",
    image: "/images/dashboard.png",
    accentColor: "bg-terracotta",
    overlineColor: "text-terracotta",
    reverse: false,
  },
  {
    icon: Mic2,
    label: "Voice AI Mentor",
    title: "Contextual AI Voice Assistance",
    description:
      "Speak naturally with your personal AI mentor. Get real-time coaching and finish every session knowing exactly what to do next.",
    image: "/images/voice-mentor.png",
    accentColor: "bg-terracotta",
    overlineColor: "text-terracotta",
    reverse: true,
  },
  {
    icon: BookOpen,
    label: "Learning Paths",
    title: "Dynamic Learning Views",
    description:
      "Browse and manage AI-generated learning paths tailored to your exact goal. One click to generate a full 6-month career strategy.",
    image: "/images/learning-paths.png",
    accentColor: "bg-terracotta",
    overlineColor: "text-terracotta",
    reverse: false,
  },
  {
    icon: GitCommitHorizontal,
    label: "Roadmap",
    title: "Milestone Tracking",
    description:
      "Celebrate every win. Structured phases guide you from Foundations to Capstone with clear, trackable progress at every step.",
    image: "/images/roadmap.png",
    accentColor: "bg-terracotta",
    overlineColor: "text-terracotta",
    reverse: true,
  },
];

function BrowserFrame({ image }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative group">
      {/* Soft background glow removed for "plain" Claude look */}
      <div className={`relative rounded-[1.5rem] border border-beigeMuted dark:border-charcoalMuted bg-white dark:bg-charcoal shadow-soft dark:shadow-darkSoft overflow-hidden transition-all duration-500 group-hover:shadow-warmHover dark:group-hover:shadow-darkHover`}>
        <div className="flex items-center gap-2 px-4 py-3 bg-beigeSecondary/50 dark:bg-charcoalDark/50 border-b border-beigeMuted dark:border-charcoalMuted">
          <div className="w-2.5 h-2.5 rounded-full bg-beigeMuted dark:bg-charcoalMuted" />
          <div className="w-2.5 h-2.5 rounded-full bg-beigeMuted dark:bg-charcoalMuted" />
          <div className="w-2.5 h-2.5 rounded-full bg-beigeMuted dark:bg-charcoalMuted" />
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-white dark:bg-charcoalDark border border-beigeMuted dark:border-charcoalMuted flex items-center px-3">
              <span className="text-[9px] text-textSecondary dark:text-gray-500 select-none tracking-tight font-outfit">planorah.me</span>
            </div>
          </div>
        </div>
        <div className="relative aspect-video">
          {!errored ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 bg-beigeSecondary dark:bg-charcoalDark animate-pulse flex items-center justify-center">
                   <div className="w-8 h-8 border-2 border-terracotta/20 border-t-terracotta rounded-full animate-spin" />
                </div>
              )}
              <img
                src={image}
                alt="App Interface"
                className={`w-full block transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-beigeSecondary dark:bg-charcoalDark flex flex-col items-center justify-center gap-2 text-textSecondary dark:text-gray-500">
               <span className="text-[12px] font-outfit">Interface Preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShowcaseItem({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const isReverse = Boolean(item.reverse);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`flex flex-col ${isReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-24`}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="lg:w-[42%] flex-shrink-0"
      >
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-beigeSecondary dark:bg-charcoalMuted border border-beigeMuted dark:border-charcoalMuted">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] font-outfit ${item.overlineColor}`}>
              {item.label}
            </span>
          </div>
          <h3 className="text-3xl md:text-[42px] font-medium font-cormorant text-charcoal dark:text-beigePrimary leading-[1.05] tracking-tight">
            {item.title}
          </h3>
          <p className="text-[17px] text-textSecondary dark:text-gray-400 font-outfit leading-relaxed max-w-md">
            {item.description}
          </p>
          <div className={`w-12 h-1 rounded-full ${item.accentColor}`} />
        </div>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="lg:flex-1 w-full"
      >
        <BrowserFrame image={item.image} />
      </motion.div>
    </motion.div>
  );
}

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="relative scroll-mt-36 py-32 overflow-hidden bg-beigePrimary dark:bg-charcoal border-y border-beigeMuted dark:border-charcoalMuted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold text-terracotta uppercase tracking-[0.3em] mb-4 font-outfit"
          >
            Product Showcase
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="text-[40px] md:text-[56px] font-medium font-cormorant tracking-tight text-charcoal dark:text-beigePrimary mb-6"
          >
            A workspace designed for clarity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-[18px] text-textSecondary dark:text-gray-400 font-outfit max-w-2xl mx-auto"
          >
            Every pixel is optimized to keep you in the flow state. Planorah combines the
            power of a roadmap with the simplicity of a daily checklist.
          </motion.p>
        </div>

        <div className="space-y-40">
          {showcases.map((item, index) => (
            <ShowcaseItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
