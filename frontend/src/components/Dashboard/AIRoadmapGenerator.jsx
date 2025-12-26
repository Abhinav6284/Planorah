import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

export default function AIRoadmapGenerator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        goal: "",
        duration: "6 months",
        current_level: "beginner",
        interests: [],
    });
    const [loading, setLoading] = useState(false);
    const [roadmaps, setRoadmaps] = useState([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [message, setMessage] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        fetchRoadmaps();
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const fetchRoadmaps = async () => {
        try {
            // console.log('📥 Fetching roadmaps...');
            const res = await axiosInstance.get("/api/roadmap/list/");
            // console.log('✅ Roadmaps fetched:', res.data.length);
            setRoadmaps(res.data);
        } catch (err) {
            console.error("❌ Failed to fetch roadmaps:", err);
            if (err.response?.status === 401) {
                setMessage("❌ Session expired. Please login again.");
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInterestToggle = (interest) => {
        const interests = formData.interests.includes(interest)
            ? formData.interests.filter((i) => i !== interest)
            : [...formData.interests, interest];
        setFormData({ ...formData, interests });
    };

    const generateRoadmap = async () => {
        if (!formData.goal.trim()) {
            setMessage("⚠️ Please enter your goal!");
            return;
        }

        setLoading(true);
        setMessage("🔄 Generating your personalized roadmap...");

        try {
            // console.log("📤 Sending request to generate roadmap...");
            // console.log("📦 Request data:", formData);

            const res = await axiosInstance.post("/api/roadmap/generate/", formData);

            // console.log("✅ Roadmap generated:", res.data);
            setMessage("✅ Roadmap generated successfully!");
            setSelectedRoadmap(res.data);
            fetchRoadmaps();
            setStep(1);
            setFormData({ goal: "", duration: "6 months", current_level: "beginner", interests: [] });
        } catch (err) {
            console.error("❌ Error generating roadmap:", err);
            console.error("Error response:", err.response?.data);

            const errorMessage = err.response?.data?.error ||
                err.response?.data?.details ||
                err.message ||
                "Failed to generate roadmap";

            setMessage(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const viewRoadmapDetail = async (roadmapId) => {
        try {
            // console.log('📥 Fetching roadmap detail:', roadmapId);
            const res = await axiosInstance.get(`/api/roadmap/${roadmapId}/`);
            // console.log('✅ Roadmap detail fetched');
            setSelectedRoadmap(res.data);
        } catch (err) {
            console.error("❌ Failed to fetch roadmap details:", err);
            setMessage("❌ Failed to load roadmap details");
        }
    };

    const deleteRoadmap = async (roadmapId) => {
        if (!window.confirm("Delete this roadmap?")) return;

        try {
            // console.log('🗑️ Deleting roadmap:', roadmapId);
            await axiosInstance.delete(`/api/roadmap/${roadmapId}/delete/`);
            // console.log('✅ Roadmap deleted');
            fetchRoadmaps();
            if (selectedRoadmap?.id === roadmapId) setSelectedRoadmap(null);
            setMessage("✅ Roadmap deleted");
        } catch (err) {
            console.error("❌ Failed to delete roadmap:", err);
            setMessage("❌ Failed to delete roadmap");
        }
    };

    const toggleMilestoneCompletion = async (milestoneId, currentStatus) => {
        try {
            // console.log('🔄 Toggling milestone:', milestoneId);
            await axiosInstance.patch(
                `/api/roadmap/milestone/${milestoneId}/progress/`,
                { completed: !currentStatus }
            );
            // console.log('✅ Milestone updated');
            if (selectedRoadmap) {
                viewRoadmapDetail(selectedRoadmap.id);
            }
        } catch (err) {
            console.error("❌ Failed to update milestone:", err);
            setMessage("❌ Failed to update milestone");
        }
    };

    const interestOptions = [
        "Web Development",
        "Mobile Apps",
        "Data Science",
        "Machine Learning",
        "Game Development",
        "DevOps",
        "Cybersecurity",
        "UI/UX Design",
        "Cloud Computing",
        "Blockchain",
    ];

    return (
        <div className="relative min-h-screen bg-white p-6">
            {/* Mouse gradient effect */}
            <div
                className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%, black, transparent)`,
                }}
            />

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter mb-2">AI ROADMAP</h1>
                        <div className="h-1 w-32 bg-black" />
                    </div>

                    {!selectedRoadmap && (
                        <button
                            onClick={() => setStep(step === 1 ? 2 : 1)}
                            className="px-8 py-4 bg-black text-white font-black tracking-wider hover:bg-white hover:text-black border-2 border-black transition-all duration-200"
                        >
                            {step === 1 ? "+ NEW ROADMAP" : "← BACK"}
                        </button>
                    )}

                    {selectedRoadmap && (
                        <button
                            onClick={() => setSelectedRoadmap(null)}
                            className="px-8 py-4 bg-black text-white font-black tracking-wider hover:bg-white hover:text-black border-2 border-black transition-all duration-200"
                        >
                            ← BACK TO LIST
                        </button>
                    )}
                </div>

                {/* Message Display */}
                {message && (
                    <div
                        className={`mb-6 p-4 border-2 font-mono text-sm ${message.includes("✅")
                            ? "border-black bg-black text-white"
                            : message.includes("⚠️")
                                ? "border-black bg-yellow-100 text-black"
                                : message.includes("🔄")
                                    ? "border-black bg-blue-100 text-black"
                                    : "border-black bg-red-100 text-black"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* STEP 1: Roadmap List */}
                {step === 1 && !selectedRoadmap && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roadmaps.length === 0 ? (
                            <div className="col-span-full text-center py-20 border-2 border-black border-dashed">
                                <p className="text-2xl font-black mb-4 text-black/40">NO ROADMAPS YET</p>
                                <p className="text-black/60 mb-6">Create your first AI-generated learning path</p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-12 py-4 bg-black text-white font-black tracking-wider hover:scale-105 transition-transform duration-200"
                                >
                                    CREATE NOW
                                </button>
                            </div>
                        ) : (
                            roadmaps.map((roadmap) => (
                                <div
                                    key={roadmap.id}
                                    className="group relative border-2 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer bg-white"
                                    onClick={() => viewRoadmapDetail(roadmap.id)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-mono bg-black text-white px-2 py-1">
                                            {roadmap.difficulty_level.toUpperCase()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteRoadmap(roadmap.id);
                                            }}
                                            className="text-black hover:scale-110 transition-transform"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-black mb-2 tracking-tight">{roadmap.title}</h3>
                                    <p className="text-black/60 text-sm mb-4 line-clamp-2">{roadmap.overview}</p>

                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <span>{roadmap.milestone_count} Milestones</span>
                                        <span>{roadmap.completion_percentage}% Complete</span>
                                    </div>

                                    <div className="mt-4 h-2 bg-black/10">
                                        <div
                                            className="h-full bg-black transition-all duration-500"
                                            style={{ width: `${roadmap.completion_percentage}%` }}
                                        />
                                    </div>

                                    <div className="mt-4 text-xs text-black/40">
                                        {roadmap.estimated_duration} • Created {new Date(roadmap.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* STEP 2: Create New Roadmap Form */}
                {step === 2 && (
                    <div className="max-w-3xl mx-auto">
                        <div className="border-4 border-black p-12 bg-white">
                            <h2 className="text-4xl font-black mb-8 tracking-tighter">CREATE ROADMAP</h2>

                            {/* Goal Input */}
                            <div className="mb-8">
                                <label className="block text-xs font-black tracking-widest mb-3 uppercase">
                                    What do you want to learn?
                                </label>
                                <textarea
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Become a full-stack web developer, Learn machine learning for beginners, Master React and build production apps..."
                                    className="w-full px-4 py-4 border-2 border-black bg-white focus:bg-black focus:text-white outline-none transition-all duration-300 font-mono text-sm resize-none"
                                    rows="4"
                                />
                            </div>

                            {/* Duration Select */}
                            <div className="mb-8">
                                <label className="block text-xs font-black tracking-widest mb-3 uppercase">
                                    Duration
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white outline-none transition-all duration-300 font-bold cursor-pointer"
                                >
                                    <option value="1 month">1 Month</option>
                                    <option value="3 months">3 Months</option>
                                    <option value="6 months">6 Months</option>
                                    <option value="1 year">1 Year</option>
                                    <option value="2 years">2 Years</option>
                                </select>
                            </div>

                            {/* Current Level */}
                            <div className="mb-8">
                                <label className="block text-xs font-black tracking-widest mb-3 uppercase">
                                    Current Level
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {["beginner", "intermediate", "advanced"].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, current_level: level })}
                                            className={`py-3 font-black tracking-wider uppercase border-2 border-black transition-all duration-200 ${formData.current_level === level
                                                ? "bg-black text-white"
                                                : "bg-white text-black hover:bg-black hover:text-white"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Interests */}
                            <div className="mb-8">
                                <label className="block text-xs font-black tracking-widest mb-3 uppercase">
                                    Interests (Optional)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {interestOptions.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => handleInterestToggle(interest)}
                                            className={`py-2 px-3 text-sm font-bold border-2 border-black transition-all duration-200 ${formData.interests.includes(interest)
                                                ? "bg-black text-white"
                                                : "bg-white text-black hover:bg-black hover:text-white"
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={generateRoadmap}
                                disabled={loading}
                                className={`w-full py-6 font-black text-xl tracking-widest uppercase transition-all duration-200 ${loading
                                    ? "bg-black/50 text-white cursor-not-allowed"
                                    : "bg-black text-white hover:bg-white hover:text-black hover:border-4 hover:border-black"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        GENERATING...
                                    </span>
                                ) : (
                                    "⚡ GENERATE ROADMAP"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: View Roadmap Detail */}
                {selectedRoadmap && (
                    <div className="max-w-5xl mx-auto">
                        {/* Roadmap Header */}
                        <div className="border-4 border-black p-8 mb-8 bg-white">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h2 className="text-5xl font-black mb-4 tracking-tighter">{selectedRoadmap.title}</h2>
                                    <p className="text-lg text-black/70 mb-6">{selectedRoadmap.overview}</p>
                                </div>
                                <span className="text-xs font-mono bg-black text-white px-3 py-1 ml-4">
                                    {selectedRoadmap.difficulty_level.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="border-2 border-black p-4">
                                    <div className="text-xs font-black tracking-widest mb-1">DURATION</div>
                                    <div className="text-xl font-black">{selectedRoadmap.estimated_duration}</div>
                                </div>
                                <div className="border-2 border-black p-4">
                                    <div className="text-xs font-black tracking-widest mb-1">MILESTONES</div>
                                    <div className="text-xl font-black">{selectedRoadmap.milestones?.length || 0}</div>
                                </div>
                                <div className="border-2 border-black p-4">
                                    <div className="text-xs font-black tracking-widest mb-1">COMPLETED</div>
                                    <div className="text-xl font-black">
                                        {selectedRoadmap.milestones?.filter((m) => m.completed).length || 0}
                                    </div>
                                </div>
                                <div className="border-2 border-black p-4">
                                    <div className="text-xs font-black tracking-widest mb-1">PROGRESS</div>
                                    <div className="text-xl font-black">
                                        {Math.round(
                                            ((selectedRoadmap.milestones?.filter((m) => m.completed).length || 0) /
                                                (selectedRoadmap.milestones?.length || 1)) *
                                            100
                                        )}
                                        %
                                    </div>
                                </div>
                            </div>

                            {/* Prerequisites */}
                            {selectedRoadmap.prerequisites?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-black tracking-widest mb-3 uppercase">Prerequisites</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRoadmap.prerequisites.map((prereq, idx) => (
                                            <span key={idx} className="px-3 py-1 border border-black text-xs font-mono">
                                                {prereq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Career Outcomes */}
                            {selectedRoadmap.career_outcomes?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-black tracking-widest mb-3 uppercase">Career Outcomes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedRoadmap.career_outcomes.map((outcome, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="text-xl">💼</span>
                                                <span>{outcome}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {selectedRoadmap.tips?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black tracking-widest mb-3 uppercase">Expert Tips</h3>
                                    <ul className="space-y-2">
                                        {selectedRoadmap.tips.map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-xl">💡</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Milestones */}
                        <div className="space-y-6">
                            {selectedRoadmap.milestones?.map((milestone, idx) => (
                                <div
                                    key={milestone.id}
                                    className={`border-4 border-black p-8 transition-all duration-200 ${milestone.completed ? "bg-black text-white" : "bg-white"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="text-xs font-mono bg-white text-black px-2 py-1">
                                                    MILESTONE {idx + 1}
                                                </span>
                                                <span className="text-xs font-mono">{milestone.duration}</span>
                                            </div>
                                            <h3 className="text-3xl font-black mb-3 tracking-tight">{milestone.title}</h3>
                                            <p className={milestone.completed ? "text-white/80" : "text-black/70"}>
                                                {milestone.description}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => toggleMilestoneCompletion(milestone.id, milestone.completed)}
                                            className={`ml-4 w-12 h-12 border-2 flex items-center justify-center transition-all duration-200 ${milestone.completed
                                                ? "border-white bg-white text-black"
                                                : "border-black bg-white hover:bg-black hover:text-white"
                                                }`}
                                        >
                                            {milestone.completed ? "✓" : ""}
                                        </button>
                                    </div>

                                    {/* Skills */}
                                    {milestone.skills?.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-xs font-black tracking-widest mb-3 uppercase">Skills You'll Learn</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {milestone.skills.map((skill, sidx) => (
                                                    <span
                                                        key={sidx}
                                                        className={`px-3 py-1 border text-xs font-mono ${milestone.completed ? "border-white" : "border-black"
                                                            }`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Resources */}
                                    {milestone.resources?.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-xs font-black tracking-widest mb-3 uppercase">Learning Resources</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {milestone.resources.map((resource, ridx) => (
                                                    <a
                                                        key={ridx}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-3 border-2 hover:shadow-[4px_4px_0px_0px] transition-all duration-200 ${milestone.completed
                                                            ? "border-white hover:shadow-white"
                                                            : "border-black hover:shadow-black"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-sm mb-1">{resource.title}</div>
                                                                <div className="text-xs opacity-60 uppercase">{resource.type}</div>
                                                            </div>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {milestone.projects?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-black tracking-widest mb-3 uppercase">
                                                Hands-On Projects ({milestone.projects.length})
                                            </h4>
                                            <div className="space-y-4">
                                                {milestone.projects.map((project) => (
                                                    <div
                                                        key={project.id}
                                                        className={`p-4 border-2 ${milestone.completed
                                                            ? "border-white/50 bg-white/10"
                                                            : "border-black/20 bg-black/5"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h5 className="text-lg font-black mb-2">{project.title}</h5>
                                                                <p className="text-sm opacity-80 mb-3">{project.description}</p>
                                                            </div>
                                                            <span
                                                                className={`text-xs font-mono px-2 py-1 ml-4 ${project.difficulty === "easy"
                                                                    ? milestone.completed
                                                                        ? "bg-green-400 text-black"
                                                                        : "bg-green-100 text-green-800"
                                                                    : project.difficulty === "medium"
                                                                        ? milestone.completed
                                                                            ? "bg-yellow-400 text-black"
                                                                            : "bg-yellow-100 text-yellow-800"
                                                                        : milestone.completed
                                                                            ? "bg-red-400 text-black"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {project.difficulty.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs mb-3">
                                                            <span>⏱️ {project.estimated_hours}h</span>
                                                            <span>🔧 {project.tech_stack?.join(", ")}</span>
                                                        </div>

                                                        {project.learning_outcomes?.length > 0 && (
                                                            <div>
                                                                <div className="text-xs font-black mb-2 opacity-60">WHAT YOU'LL LEARN:</div>
                                                                <ul className="space-y-1">
                                                                    {project.learning_outcomes.map((outcome, oidx) => (
                                                                        <li key={oidx} className="text-xs flex items-start gap-2">
                                                                            <span>→</span>
                                                                            <span>{outcome}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}