import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import ProblemSection from "./landing/ProblemSection";
import FeaturesSection from "./landing/FeaturesSection";
import ProductDemo from "./landing/ProductDemo";
import ShowcaseSection from "./landing/ShowcaseSection";
import PricingSection from "./landing/PricingSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-terracotta selection:text-white dark:selection:bg-terracotta dark:selection:text-white relative text-charcoal dark:text-beigePrimary overflow-x-hidden bg-beigePrimary dark:bg-charcoalDark transition-colors duration-500">
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ProblemSection />
          <FeaturesSection />
          <ProductDemo />
          <ShowcaseSection />
          <PricingSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
