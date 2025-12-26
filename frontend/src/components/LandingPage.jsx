import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PlanoraLogo from "../assets/Planora.svg";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const features = [
    {
      title: "Smart Tracking",
      description: "AI-powered progress tracking with detailed analytics and personalized insights.",
      icon: "📊",
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live editing and instant synchronization.",
      icon: "✨",
    },
    {
      title: "Project Portfolio",
      description: "Showcase your work with beautiful templates and custom domains.",
      icon: "🎨",
    },
    {
      title: "Productivity Boost",
      description: "Smart reminders, time tracking, and focus modes to maximize efficiency.",
      icon: "⚡",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={PlanoraLogo} alt="Planorah" className="h-8 w-auto dark:invert" />
            <span className="text-xl font-serif font-bold tracking-tight text-gray-900 dark:text-white">Planorah.</span>
          </Link>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">Stories</a>
          </div>

          <Link to="/login">
            <button className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 dark:shadow-white/10">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium mb-8">
              ✨ The Student Success OS
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-medium text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
              Build. Learn. <br />
              <span className="italic text-gray-400 dark:text-gray-500">Grow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              The ultimate platform for students and creators to track progress, collaborate with peers, and achieve their dreams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-lg font-medium hover:scale-105 transition-transform shadow-xl shadow-black/10 dark:shadow-white/5">
                  Start Your Journey
                </button>
              </Link>
              <a href="#features">
                <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Learn More
                </button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-10 md:left-20 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30" />
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-10 md:right-20 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white mb-6">Designed for Focus</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light">Everything you need to succeed, nothing you don't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white mb-6">Simple Pricing</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light">Invest in your future.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "Free", desc: "Perfect for getting started", features: ["5 Projects", "Basic Analytics", "Community Support"] },
              { name: "Pro", price: "$9", desc: "For serious creators", features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "Custom Domain"], popular: true },
              { name: "Team", price: "$29", desc: "For ambitious groups", features: ["Everything in Pro", "Unlimited Team Members", "Dedicated Support"] }
            ].map((plan, index) => (
              <div key={index} className={`p-8 rounded-3xl border ${plan.popular ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black ring-4 ring-black/5 dark:ring-white/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} relative flex flex-col transition-colors duration-300`}>
                {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">MOST POPULAR</span>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`mb-8 ${plan.popular ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{plan.desc}</p>
                <div className="text-4xl font-serif font-medium mb-8">{plan.price}</div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-2xl font-medium transition-transform active:scale-95 ${plan.popular ? 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}>
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 py-20 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={PlanoraLogo} alt="Planorah" className="h-8 w-auto opacity-50 grayscale dark:invert" />
            <span className="text-gray-400 font-serif">Planorah © 2025</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}