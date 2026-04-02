import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center relative overflow-hidden bg-beigePrimary dark:bg-charcoalDark">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-terracotta/5 to-transparent blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sage/10 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, duration: 0.8 }}
            className="space-y-8"
          >
            {/* Pill badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-charcoal border border-beigeMuted dark:border-charcoalMuted shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span className="text-sm font-medium font-outfit text-charcoal dark:text-beigePrimary">Redefining Student Productivity</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-[56px] lg:text-[72px] font-cormorant font-medium text-charcoal dark:text-beigePrimary leading-[1.05] tracking-tight">
              Master your <br/>
              <span className="italic relative z-10">
                daily progress.
                <div className="absolute bottom-2 left-0 w-full h-4 bg-terracotta/20 dark:bg-terracotta/40 -z-10 rounded-full blur-[2px] transform -rotate-2" />
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[18px] text-textSecondary dark:text-gray-400 font-outfit max-w-xl leading-[1.6]">
              A quiet, sophisticated space to map out your ambitions. Planorah translates complex goals into clear, structured daily actions. No noise. Just progress.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 h-[56px] px-8 rounded-full bg-charcoal dark:bg-beigePrimary text-beigePrimary dark:text-charcoal font-outfit font-medium hover:bg-charcoalMuted dark:hover:bg-beigeSecondary shadow-soft hover:shadow-warmHover hover:-translate-y-1 transition-all duration-300 group"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="#demo"
                className="inline-flex items-center justify-center gap-2 h-[56px] px-8 rounded-full bg-white dark:bg-charcoal border border-beigeMuted dark:border-charcoalMuted text-charcoal dark:text-beigePrimary font-outfit font-medium hover:border-terracotta dark:hover:border-terracotta hover:text-terracotta dark:hover:text-terracotta shadow-sm hover:shadow-darkSoft transition-all duration-300"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </Link>
            </div>
            
            <div className="pt-6 flex items-center gap-4 text-sm font-outfit text-textSecondary dark:text-gray-500 opacity-80">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-beigePrimary dark:border-charcoalDark flex items-center justify-center font-bold text-xs ${['bg-gray-200 text-gray-700', 'bg-terracotta/20 text-terracotta', 'bg-sage/20 text-sage', 'bg-charcoal dark:bg-beigePrimary text-white dark:text-charcoal'][i-1]}`}>
                    {['S','J','M','+'][i-1]}
                  </div>
                ))}
              </div>
              <p>Join 10,000+ ambitious learners.</p>
            </div>
          </motion.div>

          {/* Right Visual - Sophisticated Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center lg:justify-end"
          >
            {/* Main Abstract UI Canvas */}
            <div className="relative w-full max-w-md aspect-square rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-charcoal/40 backdrop-blur-3xl shadow-warmHover dark:shadow-darkHover p-8 flex flex-col items-center justify-center overflow-hidden">
               {/* Inner styling wrapper matching Beige Minimalist rules */}
               <div className="w-full space-y-6 relative z-10">
                 {/* Mock header */}
                 <div className="flex justify-between items-center pb-4 border-b border-beigeMuted dark:border-charcoalMuted">
                   <div className="h-4 w-24 rounded-full bg-beigeMuted dark:bg-charcoalMuted" />
                   <div className="h-8 w-8 rounded-full bg-charcoal/5 dark:bg-white/5" />
                 </div>
                 
                 {/* Mock active task */}
                 <motion.div 
                   animate={{ y: [0, -8, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="p-5 rounded-2xl bg-white dark:bg-charcoal shadow-soft dark:shadow-darkSoft border border-beigeMuted dark:border-charcoalMuted flex gap-4"
                 >
                   <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                     <div className="w-3 h-3 bg-terracotta rounded-full" />
                   </div>
                   <div className="space-y-3 w-full pt-1">
                     <div className="h-3 w-3/4 rounded-full bg-charcoal/20 dark:bg-white/20" />
                     <div className="h-2 w-1/2 rounded-full bg-charcoal/10 dark:bg-white/10" />
                   </div>
                 </motion.div>

                 {/* Mock secondary tasks */}
                 <div className="space-y-3">
                   {[1, 2].map(i => (
                     <div key={i} className="p-4 rounded-xl bg-beigeSecondary/50 dark:bg-charcoalMuted/50 border border-transparent dark:border-transparent flex gap-3 items-center">
                       <div className="w-5 h-5 rounded-full border border-beigeMuted dark:border-charcoal bg-white dark:bg-charcoal" />
                       <div className="h-2 w-full bg-charcoal/5 dark:bg-white/5 rounded-full" />
                       <div className="h-2 w-16 bg-charcoal/5 dark:bg-white/5 rounded-full" />
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Decorative background element behind the mock UI */}
               <div className="absolute top-20 right-10 w-32 h-32 bg-white dark:bg-white/5 rounded-full blur-2xl opacity-60 pointer-events-none" />
            </div>
            
            {/* Floating ornamental element */}
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 p-5 bg-charcoal dark:bg-beigePrimary text-white dark:text-charcoal rounded-2xl shadow-darkDepth dark:shadow-warmHover max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-beigePrimary dark:text-charcoal bg-white/10 dark:bg-black/10 p-1 rounded-md" />
                <span className="font-outfit text-sm font-medium">Daily Streak</span>
              </div>
              <div className="text-3xl font-cormorant">14 Days</div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
