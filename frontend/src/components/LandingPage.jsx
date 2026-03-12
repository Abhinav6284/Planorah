import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import ProductDemo from "./landing/ProductDemo";
import StatsSection from "./landing/StatsSection";
import PricingSection from "./landing/PricingSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.2,
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [-180, 220]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.9, 1.25]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 70, scale: 0.97, rotateX: 5 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: 0.05 * index,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-x-clip">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[60] origin-left bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
        style={{ scaleX: scrollProgress }}
      />
      <motion.div
        aria-hidden="true"
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[55rem] h-[22rem] rounded-full bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-fuchsia-500/10 dark:from-violet-500/15 dark:via-indigo-500/15 dark:to-fuchsia-500/5 blur-3xl pointer-events-none z-0"
        style={{ y: glowY, scale: glowScale }}
      />
      <Navbar />
      <HeroSection />
      <motion.div
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        style={{ transformPerspective: 1200 }}
        className="relative z-10"
      >
        <FeaturesSection />
      </motion.div>
      <motion.div
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        style={{ transformPerspective: 1200 }}
        className="relative z-10"
      >
        <ProductDemo />
      </motion.div>
      <motion.div
        custom={3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        style={{ transformPerspective: 1200 }}
        className="relative z-10"
      >
        <StatsSection />
      </motion.div>
      <motion.div
        custom={4}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        style={{ transformPerspective: 1200 }}
        className="relative z-10"
      >
        <PricingSection />
      </motion.div>
      <motion.div
        custom={5}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        style={{ transformPerspective: 1200 }}
        className="relative z-10"
      >
        <CTASection />
      </motion.div>
      <Footer />
    </div>
  );
}
