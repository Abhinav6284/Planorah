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

const SCROLL_SPRING_CONFIG = {
  stiffness: 140,
  damping: 30,
  mass: 0.2,
};

const SECTION_PERSPECTIVE = "1200px";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, SCROLL_SPRING_CONFIG);
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

  const AnimatedSection = ({ index, children }) => (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      style={{ perspective: SECTION_PERSPECTIVE }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-x-clip">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
        style={{ scaleX: scrollProgress }}
      />
      {/* Subtle ambient glow — barely visible, adds depth */}
      <motion.div
        aria-hidden="true"
        className="fixed top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[28rem] rounded-full bg-gradient-to-r from-violet-400/8 via-indigo-400/8 to-violet-400/8 dark:from-violet-500/10 dark:via-indigo-500/10 dark:to-violet-500/10 blur-3xl pointer-events-none z-0"
        style={{ y: glowY, scale: glowScale }}
      />
      <Navbar />
      <HeroSection />
      <AnimatedSection index={1}>
        <FeaturesSection />
      </AnimatedSection>
      <AnimatedSection index={2}>
        <ProductDemo />
      </AnimatedSection>
      <AnimatedSection index={3}>
        <StatsSection />
      </AnimatedSection>
      <AnimatedSection index={4}>
        <PricingSection />
      </AnimatedSection>
      <AnimatedSection index={5}>
        <CTASection />
      </AnimatedSection>
      <Footer />
    </div>
  );
}
