import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import ProductDemo from "./landing/ProductDemo";
import StatsSection from "./landing/StatsSection";
import PricingSection from "./landing/PricingSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProductDemo />
      <StatsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
