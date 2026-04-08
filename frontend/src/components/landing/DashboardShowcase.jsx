import { Zap, Target, TrendingUp, Calendar } from "lucide-react";

export default function DashboardShowcase() {
  return (
    <section className="py-20 px-6 bg-beigeSecondary dark:bg-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Platform</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Your complete productivity dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Beautiful, intuitive, designed for focus and execution.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Dashboard Mockup */}
          <div className="bg-white dark:bg-charcoalDark rounded-3xl border border-beigeMuted dark:border-white/[0.08] p-8 overflow-hidden">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-charcoal dark:to-charcoalDark rounded-2xl p-6 text-white">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-sm text-gray-400">Today</p>
                  <h3 className="text-2xl font-bold">Your Mission</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Finish project presentation</p>
                      <p className="text-xs text-gray-400">2h 30m remaining</p>
                    </div>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Review code for feature</p>
                      <p className="text-xs text-gray-400">1h remaining</p>
                    </div>
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm opacity-50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Planning tomorrow</p>
                      <p className="text-xs text-gray-400">Tomorrow</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-xs text-gray-400 mb-2">Today's Progress</p>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full w-2/3" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            {/* Streak Card */}
            <div className="bg-white dark:bg-charcoalDark rounded-3xl border border-beigeMuted dark:border-white/[0.08] p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Streak</p>
                  <p className="text-5xl font-outfit font-bold text-gray-950 dark:text-white">28</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Days locked in 🔥</p>
                </div>
                <div className="text-5xl">🔥</div>
              </div>
              <div className="w-full bg-[#E5DFCC] dark:bg-white/[0.08] rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full w-5/6" />
              </div>
            </div>

            {/* Productivity Card */}
            <div className="bg-white dark:bg-charcoalDark rounded-3xl border border-beigeMuted dark:border-white/[0.08] p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Productivity Score</p>
                  <p className="text-5xl font-outfit font-bold text-gray-950 dark:text-white">8.7</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">↑ 12% from last week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold text-gray-950 dark:text-white">87%</span>
                </div>
                <div className="w-full bg-[#E5DFCC] dark:bg-white/[0.08] rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full w-87" style={{ width: "87%" }} />
                </div>
              </div>
            </div>

            {/* Goals Card */}
            <div className="bg-white dark:bg-charcoalDark rounded-3xl border border-beigeMuted dark:border-white/[0.08] p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Goals</p>
                  <p className="text-5xl font-outfit font-bold text-gray-950 dark:text-white">5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">1 completed this week</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
