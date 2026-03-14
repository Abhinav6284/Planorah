import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import ProductDemo from "./landing/ProductDemo";
import ShowcaseSection from "./landing/ShowcaseSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white relative text-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductDemo />
        <ShowcaseSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
