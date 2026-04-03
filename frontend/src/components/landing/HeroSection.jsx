import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-20 px-6 bg-[#F5F1E8] dark:bg-charcoalDark">
      <div className="max-w-7xl mx-auto">
        {/* Hero Card */}
        <div className="mb-20 rounded-3xl border border-white/10 bg-charcoal p-12 shadow-darkSoft transition-colors duration-500 dark:border-beigeMuted dark:bg-white dark:shadow-soft lg:p-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Social Proof */}
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 dark:border-beigeMuted dark:bg-beigeSecondary">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-charcoal/10">
                  <Zap className="h-4 w-4 text-white dark:text-charcoal" />
                </div>
                <span className="text-sm font-medium text-white dark:text-charcoal">10,000+ Users</span>
                <span className="text-xs text-gray-400 dark:text-textSecondary">Read Our Success Stories</span>
              </div>

              {/* Headline */}
              <h1 className="text-6xl lg:text-7xl font-playfair font-bold text-white dark:text-charcoal leading-tight">
                Master Your Daily Progress
              </h1>

              {/* Subheading */}
              <p className="max-w-lg text-lg leading-relaxed text-gray-300 dark:text-textSecondary">
                AI-powered goal planning. Structured daily tasks. Real results. Transform ambitions into achievements with intelligent productivity.
              </p>

              {/* Testimonial */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 dark:border-beigeMuted dark:bg-beigePrimary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white dark:text-charcoal">Sarah Chen</p>
                    <p className="text-sm text-gray-400 dark:text-textSecondary">Product Designer at Google</p>
                    <p className="mt-2 text-sm text-gray-300 dark:text-textPrimary">"Planorah changed how I approach learning. 20x more productive."</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="rounded-full bg-white px-8 py-3 text-center font-medium text-gray-950 transition hover:bg-gray-100 dark:bg-charcoal dark:text-beigePrimary dark:hover:bg-charcoalMuted"
                >
                  Download — It's Free
                </Link>
                <a
                  href="#pricing"
                  className="rounded-full border border-white/20 px-8 py-3 text-center font-medium text-white transition hover:bg-white/10 dark:border-borderMuted dark:text-charcoal dark:hover:bg-beigeSecondary"
                >
                  Our Pricing →
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-white dark:text-charcoal">5.0</div>
                  <div className="text-gray-400 dark:text-textSecondary">★ Avg Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white dark:text-charcoal">10,000+</div>
                  <div className="text-gray-400 dark:text-textSecondary">Active Users</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative h-96 lg:h-full flex items-center justify-center">
              {/* Tech Stack Cards */}
              <div className="absolute top-0 left-0 space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm dark:border-beigeMuted dark:bg-beigePrimary">
                  <div className="mb-1 text-xs text-gray-400 dark:text-textSecondary">Framework</div>
                  <div className="font-medium text-white dark:text-charcoal">React</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm dark:border-beigeMuted dark:bg-beigePrimary">
                  <div className="mb-1 text-xs text-gray-400 dark:text-textSecondary">Database</div>
                  <div className="font-medium text-white dark:text-charcoal">PostgreSQL</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm dark:border-beigeMuted dark:bg-beigePrimary">
                  <div className="mb-1 text-xs text-gray-400 dark:text-textSecondary">AI Model</div>
                  <div className="font-medium text-white dark:text-charcoal">GPT-4</div>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="absolute right-0 bottom-0 max-w-xs rounded-2xl border border-white/10 bg-charcoal p-6 shadow-darkSoft dark:border-beigeMuted dark:bg-white dark:shadow-soft">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500" />
                  <div>
                    <div className="font-bold text-white dark:text-gray-950">Alex Johnson</div>
                    <div className="text-xs text-gray-400 dark:text-gray-600">STUDENT</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300 dark:bg-beigeSecondary dark:text-textPrimary">Senior</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300 dark:bg-beigeSecondary dark:text-textPrimary">Assistant</span>
                </div>
              </div>

              {/* Accent Card */}
              <div className="absolute top-1/2 right-0 max-w-xs rounded-2xl border border-white/10 bg-charcoal p-6 shadow-darkSoft dark:border-beigeMuted dark:bg-white dark:shadow-soft">
                <div className="mb-2 text-sm text-gray-400 dark:text-textSecondary">Key Outcomes</div>
                <div className="mb-1 text-4xl font-bold text-white dark:text-charcoal">42%</div>
                <div className="text-sm text-gray-300 dark:text-textPrimary">Increase in Productivity</div>
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
