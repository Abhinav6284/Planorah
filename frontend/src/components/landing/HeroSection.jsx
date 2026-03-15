import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const mockupStates = [
  {
    id: "goal",
    header: "What's your learning goal?",
    sub: "Tell Planorah exactly what you want to achieve.",
    content: (
      <div className="space-y-4">
        <div className="h-12 w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center px-4 text-sm text-gray-400">
          e.g. Master Full Stack Development
        </div>
        <div className="h-12 w-full bg-black rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-sm gap-2">
          <Target className="w-4 h-4" /> Generate Path
        </div>
      </div>
    )
  },
  {
    id: "roadmap",
    header: "Planorah is building your path...",
    sub: "Analyzing current skills and breaking down milestones.",
    content: (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, x: -10 }} 
             animate={{ opacity: 1, x: 0 }} 
             transition={{ delay: i * 0.15 }}
             className="bg-gray-50/80 rounded-xl border border-gray-100 p-3 flex gap-4 items-center"
           >
             <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
               M{i}
             </div>
             <div className="flex-1 space-y-2">
               <div className="h-2 bg-gray-200 rounded-full w-3/4" />
               <div className="h-2 bg-gray-100 rounded-full w-1/2" />
             </div>
           </motion.div>
        ))}
      </div>
    )
  },
  {
    id: "tasks",
    header: "Today's Tasks",
    sub: "Structured, byte-sized learning for today.",
    content: (
      <div className="space-y-3">
        {[
          { t: "Read: React Context API", st: "done" },
          { t: "Practice: Auth Wrapper", st: "current" },
          { t: "Quiz: State Management", st: "upcoming" }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 items-center">
            <div className={`mt-0.5 flex-shrink-0 ${item.st === 'done' ? 'text-gray-900' : item.st === 'current' ? 'text-blue-500' : 'text-gray-300'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${item.st === 'upcoming' ? 'text-gray-500' : 'text-gray-900'}`}>{item.t}</h4>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    id: "progress",
    header: "Frontend Masterclass",
    sub: "45% Completed • 12 Days Left",
    content: (
      <div className="flex justify-center py-6">
        <div className="relative w-32 h-32 rounded-full border-[8px] border-gray-50 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-emerald-500" strokeDasharray="351" strokeDashoffset="193" strokeLinecap="round" />
          </svg>
          <div className="text-center mt-1">
            <span className="text-3xl font-bold text-gray-900">45%</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "mastery",
    header: "Goal Accomplished!",
    sub: "You've mastered Full Stack Development.",
    content: (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <motion.div 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-sm"
        >
          <Trophy className="w-8 h-8" />
        </motion.div>
        <button className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium shadow-sm">
          View Certificate
        </button>
      </div>
    )
  }
];

export default function HeroSection() {
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMockupIndex((prev) => (prev + 1) % mockupStates.length);
    }, 4000); // switch every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const activeMockup = mockupStates[currentMockupIndex];

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-white/90 via-sky-50/55 to-emerald-50/25">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute top-10 right-[8%] h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-80 w-[36rem] rounded-full bg-amber-100/45 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-600 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Planorah 2.0 is live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-gray-900 leading-[1.1] mb-6"
          >
            Your Personal <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
              AI Learning Roadmap
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium"
          >
            Planorah helps students build highly structured, personalized learning paths and track daily progress effortlessly. Stop wondering what to learn next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-sm shadow-gray-200"
            >
              Start Your Roadmap
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-800 rounded-xl font-medium border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm shadow-gray-100"
            >
              <Play className="w-4 h-4 fill-current opacity-70" />
              Explore Features
            </a>
          </motion.div>
        </div>

        {/* Right Content / Dashboard Mockup Auto-Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 20, rotateY: 10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex-1 w-full max-w-lg lg:max-w-none relative perspective-1000"
        >
          {/* Subtle decoration behind mockup */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white rounded-3xl transform rotate-3 scale-105 border border-gray-100 shadow-[0_4px_40px_-10px_rgba(0,0,0,0.03)] pointer-events-none" />
          
          <div className="relative bg-white border border-gray-200/60 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden h-[380px] flex flex-col">
            {/* Mockup Header */}
            <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
              
              {/* Progress dots indicating state */}
              <div className="ml-auto flex gap-1.5 items-center bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm h-6">
                 {mockupStates.map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentMockupIndex ? 'bg-black' : 'bg-gray-200'}`} 
                   />
                 ))}
              </div>
            </div>
            
            {/* Mockup Body with Animated Presence */}
            <div className="flex-1 p-6 bg-white relative">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeMockup.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                   className="absolute inset-6 flex flex-col"
                 >
                    {/* Header line */}
                    <div className="mb-6">
                      <h3 className="text-base font-bold text-gray-900">{activeMockup.header}</h3>
                      <p className="text-xs text-gray-500 mt-1">{activeMockup.sub}</p>
                    </div>
                    {/* Unique Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      {activeMockup.content}
                    </div>
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
