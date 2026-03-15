import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import ProductDemo from "./landing/ProductDemo";
import PricingSection from "./landing/PricingSection";
import ShowcaseSection from "./landing/ShowcaseSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white relative text-gray-900 overflow-x-clip bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_28%,#f8fcfa_62%,#fffaf2_100%)]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 left-[6%] h-[24rem] w-[24rem] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-[38%] -right-24 h-[22rem] w-[22rem] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute -bottom-28 left-[28%] h-[20rem] w-[20rem] rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(15,23,42,0.11)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <ProductDemo />
          <PricingSection />
          <ShowcaseSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
