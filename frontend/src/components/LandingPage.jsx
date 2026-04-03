import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import FeaturesCarousel from "./landing/FeaturesCarousel";
import DashboardShowcase from "./landing/DashboardShowcase";
import StatsWithCharts from "./landing/StatsWithCharts";
import ProcessSection from "./landing/ProcessSection";
import TestimonialsCarousel from "./landing/TestimonialsCarousel";
import BlogsSection from "./landing/BlogsSection";
import PricingSection from "./landing/PricingSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-charcoalDark text-gray-950 dark:text-white font-outfit transition-colors duration-500">
      <div className="relative z-10">
        <Navbar />
        <main className="pt-6 sm:pt-8">
          <HeroSection />
          <FeaturesCarousel />
          <DashboardShowcase />
          <StatsWithCharts />
          <ProcessSection />
          <TestimonialsCarousel />
          <BlogsSection />
          <PricingSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
