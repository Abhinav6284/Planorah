import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../api/axios";

export default function JobFinder() {
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                const response = await axios.get(`${API_BASE_URL}/api/users/profile/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.profile) {
                    setRole(response.data.profile.target_role || "");
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    const jobBoards = [
        { name: "LinkedIn", icon: "in", color: "#0A66C2", getUrl: (r, l) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(r)}&location=${encodeURIComponent(l || "")}` },
        { name: "Indeed", icon: "●", color: "#2164F3", getUrl: (r, l) => `https://in.indeed.com/jobs?q=${encodeURIComponent(r)}&l=${encodeURIComponent(l)}` },
        { name: "Glassdoor", icon: "◉", color: "#0CAA41", getUrl: (r, l) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(r)}` },
        { name: "Naukri", icon: "N", color: "#4A90D9", getUrl: (r, l) => `https://www.naukri.com/${encodeURIComponent(r).replace(/ /g, '-')}-jobs` },
        { name: "Google Jobs", icon: "G", color: "#EA4335", getUrl: (r, l) => `https://www.google.com/search?q=${encodeURIComponent(r)}+jobs&ibp=htl;jobs` },
        { name: "Wellfound", icon: "W", color: "#000000", getUrl: (r, l) => `https://wellfound.com/jobs?q=${encodeURIComponent(r)}` },
        { name: "Remotive", icon: "R", color: "#14B8A6", getUrl: (r, l) => `https://remotive.com/remote-jobs?query=${encodeURIComponent(r)}` },
        { name: "We Work Remotely", icon: "⌂", color: "#F59E0B", getUrl: (r, l) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(r)}` },
        { name: "Internshala", icon: "🎓", color: "#00A5EC", getUrl: (r, l) => `https://internshala.com/internships/${encodeURIComponent(r).replace(/ /g, '-')}-internship` },
    ];

    return (
        <div className="min-h-full bg-white dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Find Your Next Role
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        One search, multiple platforms
                    </p>
                </div>

                {/* Search Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 mb-12"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">What role?</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-700 border-0 rounded-2xl text-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                                placeholder="Frontend Developer"
                            />
                        </div>
                        <div className="md:w-64">
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Where?</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-700 border-0 rounded-2xl text-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                                placeholder="Remote"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Platforms */}
                <div className="space-y-3">
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        {role ? `Search "${role}" on:` : "Enter a role to search on:"}
                    </p>

                    {jobBoards.map((board, index) => (
                        <motion.a
                            key={board.name}
                            href={role ? board.getUrl(role, location) : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={(e) => !role && e.preventDefault()}
                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 group ${role
                                ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md cursor-pointer bg-white dark:bg-gray-800'
                                : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Logo */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                    style={{ backgroundColor: board.color }}
                                >
                                    {board.icon}
                                </div>

                                {/* Name */}
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                    {board.name}
                                </span>
                            </div>

                            {/* Arrow */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${role
                                ? 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-500 group-hover:text-white text-gray-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-300'
                                }`}>
                                →
                            </div>
                        </motion.a>
                    ))}
                </div>

                {/* Footer tip */}
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-10">
                    💡 Tip: The more specific your role, the better the results
                </p>
            </div>
        </div>
    );
}
