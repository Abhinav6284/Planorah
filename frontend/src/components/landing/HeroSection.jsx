import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-20 px-6 bg-[#F5F1E8] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Dark Hero Card */}
        <div className="bg-[#1A1A1A] dark:bg-gray-900 rounded-3xl p-12 lg:p-16 mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Social Proof */}
              <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-4 py-2 w-fit">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">10,000+ Users</span>
                <span className="text-xs text-gray-400">Read Our Success Stories</span>
              </div>

              {/* Headline */}
              <h1 className="text-6xl lg:text-7xl font-playfair font-bold text-white leading-tight">
                Master Your Daily Progress
              </h1>

              {/* Subheading */}
              <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                AI-powered goal planning. Structured daily tasks. Real results. Transform ambitions into achievements with intelligent productivity.
              </p>

              {/* Testimonial */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Sarah Chen</p>
                    <p className="text-sm text-gray-400">Product Designer at Google</p>
                    <p className="text-sm text-gray-300 mt-2">"Planorah changed how I approach learning. 20x more productive."</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="px-8 py-3 rounded-full bg-white text-gray-950 font-medium hover:bg-gray-100 transition text-center"
                >
                  Download — It's Free
                </Link>
                <a
                  href="#pricing"
                  className="px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition text-center"
                >
                  Our Pricing →
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-white">5.0</div>
                  <div className="text-gray-400">★ Avg Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10,000+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative h-96 lg:h-full flex items-center justify-center">
              {/* Tech Stack Cards */}
              <div className="absolute top-0 left-0 space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">Framework</div>
                  <div className="text-white font-medium">React</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">Database</div>
                  <div className="text-white font-medium">PostgreSQL</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">AI Model</div>
                  <div className="text-white font-medium">GPT-4</div>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="absolute right-0 bottom-0 bg-white rounded-2xl p-6 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500" />
                  <div>
                    <div className="font-bold text-gray-950">Alex Johnson</div>
                    <div className="text-xs text-gray-600">STUDENT</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Senior</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Assistant</span>
                </div>
              </div>

              {/* Accent Card */}
              <div className="absolute top-1/2 right-0 bg-white rounded-2xl p-6 max-w-xs shadow-2xl">
                <div className="text-gray-500 text-sm mb-2">Key Outcomes</div>
                <div className="text-4xl font-bold text-gray-950 mb-1">42%</div>
                <div className="text-gray-700 text-sm">Increase in Productivity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Logos */}
        <div className="text-center space-y-8">
          <div className="text-sm text-gray-600 dark:text-gray-400">Trusted by leading companies</div>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-16">
            <div className="text-gray-700 dark:text-gray-300 font-bold text-lg">Google</div>
            <div className="text-gray-700 dark:text-gray-300 font-bold text-lg">Microsoft</div>
            <div className="text-gray-700 dark:text-gray-300 font-bold text-lg">Apple</div>
            <div className="text-gray-700 dark:text-gray-300 font-bold text-lg">Amazon</div>
            <div className="text-gray-700 dark:text-gray-300 font-bold text-lg">Meta</div>
          </div>
        </div>
      </div>
    </section>
  );
}
