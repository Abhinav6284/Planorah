import { motion } from "framer-motion";
import { ListChecks, Route, BarChart2, Flame, Sparkles, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "AI Semantic Roadmap",
      desc: "Turn vague, ambitious goals into beautifully structured, actionable chronological steps instantly.",
      icon: Route,
    },
    {
      title: "Calm Daily Pace",
      desc: "Daily and weekly tasks tailored automatically to your specific rhythm. Progress without the burn out.",
      icon: ListChecks,
    },
    {
      title: "Clarity Analytics",
      desc: "Monitor your completion rates through soft, elegant charts that unlock deep behavioral insights.",
      icon: BarChart2,
    },
    {
      title: "Organic Streaks",
      desc: "Utilize built-in behavioral psychology to never miss a day, framed through positive reinforcement.",
      icon: Flame,
    },
    {
      title: "Dynamic Adaptation",
      desc: "Our engine subtly adjusts task difficulty and volume as you naturally learn and grow over time.",
      icon: Sparkles,
    },
    {
      title: "Quiet Accountability",
      desc: "Share milestones with a curated circle of peers. Celebrate wins in a sophisticated, focused environment.",
      icon: Users,
    },
  ];

  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-beigeSecondary dark:bg-charcoalDark border-y border-transparent dark:border-charcoalMuted">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-[44px] md:text-[56px] font-cormorant font-medium text-charcoal dark:text-beigePrimary">
            Elegance in Execution
          </h2>
          <p className="text-[18px] text-textSecondary dark:text-gray-400 font-outfit max-w-2xl mx-auto">
            Our tool suite strips away the clutter, providing a seamless, calming path from intent to mastery.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 60, delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-charcoal rounded-3xl p-8 border border-white dark:border-charcoal hover:border-beigeMuted dark:hover:border-charcoalMuted hover:-translate-y-2 shadow-sm dark:shadow-darkSoft hover:shadow-warmHover dark:hover:shadow-darkHover transition-all duration-500 overflow-hidden"
              >
                {/* Very soft hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/[0.02] dark:from-terracotta/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="w-14 h-14 rounded-2xl bg-beigePrimary dark:bg-charcoalDark mb-8 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-sm dark:shadow-black/50">
                  <Icon className="w-6 h-6 text-charcoal dark:text-beigePrimary" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-[20px] font-cormorant font-bold text-charcoal dark:text-beigePrimary mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-[15px] text-textSecondary dark:text-gray-400 font-outfit leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
