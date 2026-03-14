import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers, Award } from "lucide-react";

const showcases = [
  {
    icon: Sparkles,
    title: "Dynamic Learning Views",
    description: "Switch between high-level roadmaps and granular daily tasks in one click.",
    imagePlaceholder: "bg-gradient-to-br from-gray-100 to-gray-50",
  },
  {
    icon: Layers,
    title: "Contextual AI Assistance",
    description: "Your personalized mentor lives right inside your course material.",
    imagePlaceholder: "bg-gradient-to-br from-gray-50 to-white",
  },
  {
    icon: Award,
    title: "Milestone Tracking",
    description: "Celebrate every win with automated milestone detection and progress analytics.",
    imagePlaceholder: "bg-gradient-to-bl from-gray-100 to-gray-50",
  }
];

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold font-serif tracking-tight text-gray-900 mb-6"
          >
            A workspace designed for clarity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-500 font-medium"
          >
            Every pixel is optimized to keep you in the flow state. Planorah combines the power of a roadmap with the simplicity of a daily checklist.
          </motion.p>
        </div>

        <div className="space-y-12">
          {showcases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-gray-200/60 rounded-[2rem] p-8 md:p-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col items-center text-center group hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <item.icon className="w-8 h-8 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 max-w-2xl text-lg mb-10">{item.description}</p>
              
              {/* Product Screenshot Placeholder */}
              <div className={`w-full max-w-5xl aspect-video rounded-xl md:rounded-[2rem] border border-gray-100/50 shadow-sm ${item.imagePlaceholder} flex items-center justify-center overflow-hidden relative`}>
                {/* Mock UI Elements */}
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                </div>
                <div className="w-3/4 h-2/3 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex gap-4">
                  <div className="w-1/4 h-full bg-gray-50 rounded-lg" />
                  <div className="w-3/4 h-full flex flex-col gap-4">
                    <div className="w-full h-8 bg-gray-50 rounded-lg" />
                    <div className="w-full flex-1 bg-gray-50 rounded-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
