import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Map, Zap, BarChart3, Lightbulb, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PublicSiteNav from './public/PublicSiteNav';
import PublicSiteFooter from './public/PublicSiteFooter';

const FeaturesPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: Brain,
      title: 'Brain Dump',
      subtitle: 'From Chaos to Clarity',
      description: `Stop letting your thoughts spiral. Brain Dump turns your raw ideas, fears, and dreams into a structured action plan using AI. Instead of spending 45 minutes organizing your thoughts, Planorah handles it in seconds. Users report 94% clarity improvement within the first week, transforming academic overwhelm into focused direction.`,
      details: [
        'Convert chaotic thoughts into organized action items',
        'AI identifies hidden priorities automatically',
        'Save 45+ minutes per week on planning',
      ],
    },
    {
      icon: Map,
      title: 'Life Map',
      subtitle: 'Your Strategic Roadmap',
      description: `Vision without a plan is just a dream. Life Map lets you create visual career, study, and skill-building roadmaps with milestone tracking. Planorah users maintain an average of 4.2 active goals per account, with an 87% success rate on completing milestones. Watch your long-term vision become a tangible, step-by-step reality.`,
      details: [
        'Design semester-long or year-long academic roadmaps',
        'Track milestones with visual progress indicators',
        'AI adjusts timelines based on your actual pace',
      ],
    },
    {
      icon: Zap,
      title: 'Locked In Mode',
      subtitle: 'Focus Perfected',
      description: `Distractions are the enemy of productivity. Locked In Mode is your distraction-free execution zone—a timer + focus sessions + streak counter all in one. Students average 52-minute deep work sessions, with 98% reporting zero distractions. Build an unstoppable streak and gamify your way to unstoppable focus.`,
      details: [
        'Distraction-free timer for focused work sessions',
        'Streak counter for accountability and motivation',
        'Real-time progress tracking during study sessions',
      ],
    },
    {
      icon: BarChart3,
      title: 'Reality Check',
      subtitle: 'Brutal Honesty About Progress',
      description: `What gets measured gets done. Reality Check is your accountability mirror—tracking missed days, comparing your actual performance against your plans, and showing exactly where you stand. Users report +31% improvement in accountability metrics. No more excuses, no more delusions. Just data that drives action.`,
      details: [
        'Weekly performance analytics vs. planned goals',
        'Identify your biggest time-wasters automatically',
        'Visual dashboards showing completion rates',
      ],
    },
    {
      icon: Lightbulb,
      title: 'Next Move',
      subtitle: 'Removes Decision Fatigue',
      description: `Analysis paralysis kills productivity. Next Move is your AI decision engine—it analyzes your goals, deadlines, and current progress, then tells you exactly what to do next. Students save 12+ minutes per day on micro-decisions. No more "what should I do now?" Just follow the AI's recommendation and execute.`,
      details: [
        'AI-powered "what to do next" suggestions',
        'Prioritized task recommendations based on urgency',
        'Adaptive suggestions as your situation changes',
      ],
    },
    {
      icon: FileText,
      title: 'Resume & Portfolio Builder',
      subtitle: 'Career-Ready Output',
      description: `Your achievements mean nothing if employers can't see them. Resume & Portfolio Builder transforms your Planorah progress into a polished resume and live portfolio site. Share your live portfolio with employers, impress in interviews, and land opportunities faster. Built-in ATS scanner ensures your resume passes automated screening.`,
      details: [
        'Auto-generate resumes from your Planorah work',
        'Live portfolio site at yourdomain.planorah.me',
        'ATS scanning to pass employer filters',
      ],
    },
  ];

  const stats = [
    { label: '10,000+ Students', value: 'Using Planorah' },
    { label: '42%', value: 'Avg Productivity Boost' },
    { label: '5.0★', value: 'Average Rating' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-charcoalDark text-white' : 'bg-beigePrimary text-textPrimary'}`}>
      <PublicSiteNav />

      <main className="pt-32">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`px-6 py-20 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">
            Everything You Need to <span className="text-terracotta">Stay Ahead</span>
          </h1>
          <p className="text-lg md:text-xl text-textSecondary max-w-2xl mx-auto mb-8">
            Planorah combines AI-powered planning with real-time execution tracking. Every feature is designed to eliminate overwhelm and unlock your potential. Here's how we make it happen.
          </p>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="px-6 py-20 max-w-6xl mx-auto"
      >
        <div className="space-y-20">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            const isReverse = idx % 2 === 1;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`grid md:grid-cols-2 gap-12 items-center ${isReverse ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Text Content */}
                <div className={isReverse ? 'md:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-terracotta/10 rounded-lg">
                      <IconComponent className="w-6 h-6 text-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-3xl font-bold">{feature.title}</h3>
                      <p className="text-terracotta font-outfit text-sm font-medium">{feature.subtitle}</p>
                    </div>
                  </div>

                  <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-textSecondary'}`}>
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-terracotta font-bold mt-1">✓</span>
                        <span className={isDark ? 'text-gray-300' : 'text-textSecondary'}>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Icon Highlight */}
                <div className={`flex justify-center ${isReverse ? 'md:order-1' : ''}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className={`p-12 rounded-2xl ${isDark ? 'bg-charcoalMuted' : 'bg-beigeSecondary'} border-2 border-terracotta/20`}
                  >
                    <IconComponent className="w-24 h-24 text-terracotta" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`px-6 py-16 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-terracotta mb-2">{stat.label}</p>
                <p className={isDark ? 'text-gray-400' : 'text-textSecondary'}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6 py-20 max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold mb-4">How Planorah Works</h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
            Four simple steps from chaos to unstoppable execution
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Brain Dump', desc: 'Offload your thoughts' },
            { step: '2', title: 'AI Structures', desc: 'Get organized instantly' },
            { step: '3', title: 'Lock In & Execute', desc: 'Follow the plan' },
            { step: '4', title: 'Track & Grow', desc: 'Measure and improve' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl border-2 ${isDark ? 'bg-charcoal border-terracotta/20' : 'bg-beigeSecondary border-terracotta/30'}`}
            >
              <div className="text-3xl font-bold text-terracotta mb-3">{item.step}</div>
              <h3 className="font-playfair text-lg font-bold mb-2">{item.title}</h3>
              <p className={isDark ? 'text-gray-400' : 'text-textSecondary'}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`px-6 py-20 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-bold mb-6">
            Ready to <span className="text-terracotta">Unlock Your Potential?</span>
          </h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
            Join 10,000+ students already using Planorah to transform their academic and professional lives.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="bg-terracotta hover:bg-terracottaHover text-white px-8 py-4 rounded-lg font-outfit font-semibold transition-all shadow-lg"
          >
            Start Free — No Credit Card Required
          </motion.button>
        </div>
      </motion.section>
      </main>

      <PublicSiteFooter />
    </div>
  );
};

export default FeaturesPage;
