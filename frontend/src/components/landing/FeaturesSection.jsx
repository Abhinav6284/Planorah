import React from "react";
import { motion } from "framer-motion";
import { 
  Route, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  CalendarCheck, 
  Sparkles 
} from "lucide-react";

const features = [
  {
    icon: Route,
    title: "AI Roadmap Generator",
    description: "Create highly personalized learning paths instantly based on your current skill level and ultimate career goals.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visualize your learning journey. Track daily task completion, milestones, and build unwavering consistency.",
  },
  {
    icon: MessageSquare,
    title: "AI Mentor",
    description: "Stuck on a concept? Ask questions and get real-time guidance, explanations, and code reviews anytime.",
  },
  {
    icon: Target,
    title: "Goal Based Learning",
    description: "Set definitive career objectives. We break them down into actionable, bite-sized daily plans.",
  },
  {
    icon: CalendarCheck,
    title: "Daily Tasks",
    description: "Eliminate decision fatigue. Wake up every morning with a structured, automated learning routine.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description: "Our AI continuously adapts to your pace, suggesting alternative resources or next steps when you need them.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#FAFAFA] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-serif tracking-tight text-gray-900 mb-4"
          >
            Everything you need to learn faster
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 font-medium"
          >
            A perfectly structured environment designed to remove friction, keep you focused, and guarantee progress.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="group bg-white rounded-2xl p-8 border border-gray-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
