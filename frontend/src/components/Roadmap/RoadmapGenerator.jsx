import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roadmapService } from "../../api/roadmapService";
import { motion } from "framer-motion";

export default function RoadmapGenerator() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: "career",
        goal: "",
        duration: "6 months",
        current_level: "beginner",
        tech_stack: "",
        interests: "",
        output_format: "Milestone-based",
        learning_constraints: "",
        motivation_style: "Milestones",
        success_definition: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                ...formData,
                interests: formData.interests.split(",").map((i) => i.trim()),
            };
            const data = await roadmapService.generateRoadmap(payload);
            navigate(`/roadmap/${data.id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to generate roadmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 overflow-auto transition-colors duration-300 flex items-center justify-center">
            <div className="relative w-full max-w-3xl p-4">
                {/* Background Effects */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%, black, transparent)`,
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl dark:shadow-black/30 transition-colors duration-300"
                >
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-bold tracking-widest uppercase mb-3 text-gray-900 dark:text-gray-300">
                            Design Your Path
                        </span>
                        <h2 className="text-3xl font-serif font-medium text-gray-900 dark:text-white mb-2">
                            What do you want to master?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-light">
                            Fill in the details to create your perfect learning roadmap.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Goal Type */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: 'project', label: 'Project', icon: '🚀' },
                                { id: 'career', label: 'Career', icon: '💼' },
                                { id: 'research', label: 'Research', icon: '🔬' },
                                { id: 'skill_mastery', label: 'Skill', icon: '🧠' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${formData.category === cat.id
                                        ? 'border-black bg-black text-white shadow-md dark:border-white dark:bg-white dark:text-black'
                                        : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="text-xl mb-1">{cat.icon}</div>
                                    <div className="font-bold text-[10px] uppercase tracking-wider">{cat.label}</div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* 2. Goal Description (Always Visible) */}
                            <div className="group md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                    {formData.category === 'project' ? 'Project Idea' :
                                        formData.category === 'research' ? 'Research Topic' :
                                            formData.category === 'skill_mastery' ? 'Skill to Master' :
                                                'Target Role'}
                                </label>
                                <input
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.category === 'project' ? "e.g. Build a Real-time Chat App..." :
                                            formData.category === 'research' ? "e.g. AI in Healthcare..." :
                                                formData.category === 'skill_mastery' ? "e.g. Advanced Python..." :
                                                    "e.g. Become a Data Scientist..."
                                    }
                                    className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* 3. Timeline (Always Visible) */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Timeline</label>
                                <input
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g. 3 months"
                                    className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* 4. Current Level (Always Visible) */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current Level</label>
                                <div className="relative">
                                    <select
                                        name="current_level"
                                        value={formData.current_level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                </div>
                            </div>

                            {/* Dynamic Fields based on Category */}
                            {formData.category === 'project' && (
                                <>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tech Stack</label>
                                        <input
                                            name="tech_stack"
                                            value={formData.tech_stack}
                                            onChange={handleChange}
                                            placeholder="e.g. React, Node.js, PostgreSQL..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Success Definition</label>
                                        <textarea
                                            name="success_definition"
                                            value={formData.success_definition}
                                            onChange={handleChange}
                                            placeholder="e.g. Deploy to Vercel, Get 100 users..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 min-h-[80px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    </div>
                                </>
                            )}

                            {formData.category === 'career' && (
                                <>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Specific Interests</label>
                                        <input
                                            name="interests"
                                            value={formData.interests}
                                            onChange={handleChange}
                                            placeholder="e.g. Fintech, Startups, Remote work..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Motivation Style</label>
                                        <div className="relative">
                                            <select
                                                name="motivation_style"
                                                value={formData.motivation_style}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
                                            >
                                                <option value="Milestones">Milestones (Standard)</option>
                                                <option value="Gamified">Gamified (XP & Badges)</option>
                                                <option value="Deep Theory">Deep Theory (Academic)</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.category === 'research' && (
                                <>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Domain / Tech Stack</label>
                                        <input
                                            name="tech_stack"
                                            value={formData.tech_stack}
                                            onChange={handleChange}
                                            placeholder="e.g. NLP, Computer Vision, PyTorch..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Output Format</label>
                                        <div className="relative">
                                            <select
                                                name="output_format"
                                                value={formData.output_format}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
                                            >
                                                <option value="Milestone-based">Milestone-based</option>
                                                <option value="Weekly plan">Weekly Plan</option>
                                                <option value="Daily tasks">Daily Tasks</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.category === 'skill_mastery' && (
                                <>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Learning Constraints</label>
                                        <textarea
                                            name="learning_constraints"
                                            value={formData.learning_constraints}
                                            onChange={handleChange}
                                            placeholder="e.g. 1 hour/day, Free resources only..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none transition-all duration-200 min-h-[80px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium text-sm tracking-wide transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg dark:shadow-white/10 ${loading ? "opacity-80 cursor-wait" : "hover:shadow-xl"
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin text-lg">◌</span>
                                    Crafting your path...
                                </span>
                            ) : (
                                "Generate Roadmap"
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium text-center rounded-xl">
                            {error}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
