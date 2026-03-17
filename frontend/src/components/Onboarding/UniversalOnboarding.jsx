import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

// ─── Quicky Mascot ─────────────────────────────────────────────────────────────
function QuickyMessage({ stepId, fd }) {
    const getMessage = () => {
        switch (stepId) {
            case "life_stage":
                return "Hi there! I'm Quicky ⚡ Let's build your perfect plan.";
            case "school_class":
            case "college_year":
            case "career_shift_intent":
                return "Great! Tell me a bit more about where you're at.";
            case "school_stream":
                return "Ah, streams! A big decision. 🔬📊🎨";
            case "competitive_direction":
                return "Thinking big? Let's figure out your competitive goals!";
            case "jee_prep_level":
                return "Aiming for the top! 💪 Where do you stand right now?";
            case "non_competitive_focus":
                return "Clarity is super important too! 🎯";
            case "placement_skills":
                return "Getting a job requires real skills. Let's see your arsenal! 💼";
            case "higher_targeting":
                return "Further studies! Expanding the brain! 🧠";
            case "daily_time":
                return "Action time! Be honest, how much time can you actually give? ⏱️";
            case "dream_vs_effort":
                if (fd.daily_time === "4plus") return "4+ hours is intense! 🔥 But is it enough for your dreams?";
                return "Reality check! 🎯 Are your efforts matching your dreams?";
            case "pressure_response":
                return "Almost there! Just one more about your mindset. 🧘";
            case "commitment_lock":
                return "Here is your plan. Are you ready to level up? 🚀";
            case "personal":
                return "Just a few details to personalize your experience! 📝";
            default:
                return "Keep going! You're doing great! ✨";
        }
    };

    const message = getMessage();
    if (!message) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={message}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-end gap-3 mb-8"
            >
                <div className="w-14 h-14 shrink-0 relative flex items-center justify-center bg-blue-100 rounded-full border-2 border-blue-200 shadow-[0_4px_0_0_rgba(191,219,254,1)]">
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="text-3xl"
                    >
                        🦉
                    </motion.div>
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_4px_0_0_rgba(229,231,235,1)] relative flex-1">
                    <p className="text-[15px] font-bold text-gray-800 leading-snug">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Option Card ────────────────────────────────────────────────────────────────
function OptionCard({ emoji, iconText, label, sublabel, selected, onClick }) {
    return (
        <motion.button
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border-2 border-b-4 text-left transition-colors duration-200 focus:outline-none flex items-center gap-4 ${selected
                ? "border-blue-500 bg-blue-50/50 text-blue-900 border-b-blue-600"
                : "border-gray-200 bg-white text-gray-800 hover:border-blue-300 border-b-gray-300 hover:bg-gray-50"
                }`}
        >
            {(emoji || iconText) && (
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl bg-white shadow-sm border ${selected ? "border-blue-200" : "border-gray-100"}`}>
                    {iconText ? (
                        <span className={`font-black text-xl ${selected ? "text-blue-600" : "text-gray-400"}`}>{iconText}</span>
                    ) : (
                        emoji
                    )}
                </div>
            )}
            <div>
                <div className="font-bold text-[17px] leading-tight text-gray-900">{label}</div>
                {sublabel && (
                    <div className={`text-sm mt-1 font-medium ${selected ? "text-blue-700/80" : "text-gray-500"}`}>
                        {sublabel}
                    </div>
                )}
            </div>
        </motion.button>
    );
}

// ─── Step builder ───────────────────────────────────────────────────────────────
function buildSteps(fd) {
    const steps = ["life_stage"];
    const ls = fd.life_stage;

    if (ls === "school") {
        steps.push("school_class");
        if (["11", "12"].includes(fd.school_class)) {
            steps.push("school_stream");
        }
        if (fd.school_class) { // Proceed deeper
            steps.push("competitive_direction");
            const cd = fd.competitive_direction;
            if (cd === "yes_serious") {
                steps.push("jee_prep_level", "mock_test_response", "drop_year");
            } else if (["maybe", "not_sure", "no"].includes(cd)) {
                steps.push("non_competitive_focus");
            }
        }
    } else if (ls === "college") {
        steps.push("college_year");
        if (fd.college_year) {
            steps.push("college_focus");
            const cf = fd.college_focus;
            if (cf === "placement") {
                steps.push("placement_skills", "placement_resume", "placement_interview");
            } else if (cf === "higher_studies") {
                steps.push("higher_targeting", "higher_prep_stage");
            }
        }
    } else if (ls === "postgrad" || ls === "working") {
        steps.push("career_shift_intent");
        if (fd.career_shift_intent) {
            steps.push("career_stuck_response");
        }
    }

    if (ls) steps.push("daily_time", "dream_vs_effort", "pressure_response", "commitment_lock", "personal");
    return steps;
}

// ─── Summary builder ────────────────────────────────────────────────────────────
function buildSummary(fd) {
    let strength = "Self-awareness & potential";
    if (fd.competitive_direction === "yes_serious") strength = "Competitive drive & ambition";
    else if (fd.placement_skills === "already_building") strength = "Proactive skill building";
    else if (fd.career_shift_intent === "build_own") strength = "Entrepreneurial vision";
    else if (fd.daily_time === "4plus" || fd.daily_time === "2_4hrs") strength = "Commitment to focused effort";

    let growth = "Structured planning";
    if (fd.placement_resume === "dont_have") growth = "Resume & professional visibility";
    else if (["overthink", "panic_but_act", "shut_down"].includes(fd.pressure_response)) growth = "Pressure & stress management";
    else if (["far_apart", "needs_work"].includes(fd.dream_vs_effort)) growth = "Bridging ambition & execution";
    else if (["feel_stressed", "avoid"].includes(fd.mock_test_response)) growth = "Mock test resilience";
    else if (["overthink", "ignore"].includes(fd.career_stuck_response)) growth = "Decision-making agility";

    let direction = "Personal growth journey";
    if (fd.life_stage === "school") {
        direction = fd.competitive_direction === "yes_serious"
            ? "Competitive exam success"
            : "Strong academic foundation";
    } else if (fd.life_stage === "college") {
        const map = { placement: "Career placement readiness", higher_studies: "Graduate studies preparation", govt_exams: "Government exam preparation", startup: "Entrepreneurship track" };
        direction = map[fd.college_focus] || "Career clarity";
    } else if (fd.life_stage === "postgrad" || fd.life_stage === "working") {
        const map = { grow_same: "Field mastery & growth", switch_domain: "Domain transition", academic: "Academic & research track", build_own: "Building something of your own" };
        direction = map[fd.career_shift_intent] || "Career evolution";
    }

    return { strength, growth, direction };
}

// ─── Backend mapper ─────────────────────────────────────────────────────────────
function mapToBackend(fd) {
    let education_stage = "professional";
    if (fd.life_stage === "school") education_stage = ["9", "10"].includes(fd.school_class) ? "class_9_10" : "class_11_12";
    else if (fd.life_stage === "college") education_stage = "undergraduate";
    else if (fd.life_stage === "postgrad") education_stage = "postgraduate";

    const hoursMap = { less_1hr: 5, "1_2hrs": 10, "2_4hrs": 20, "4plus": 30 };
    const weekly_hours = hoursMap[fd.daily_time] || 5;

    const dirMap = {
        placement: "get placed at a great company",
        higher_studies: "pursue higher studies",
        startup: "build a startup",
        govt_exams: "crack a government exam",
        yes_serious: "crack JEE/NEET",
        grow_same: "grow in their current field",
        switch_domain: "successfully switch domains",
        build_own: "build something of their own",
        academic: "pursue an academic career",
    };
    const dirKey = fd.college_focus || fd.competitive_direction || fd.career_shift_intent || "";
    const goal_statement = dirMap[dirKey] || "achieve their personal goal on Planora";

    // eslint-disable-next-line no-unused-vars
    const { name, phone_number, date_of_birth, gender, committed, ...rest } = fd;

    return {
        education_stage,
        weekly_hours,
        validation_mode: "automatic",
        onboarding_accepted_terms: committed === true,
        onboarding_data: rest,
        goal_statement,
        name,
        phone_number,
        date_of_birth,
        gender,
    };
}

// ─── Screen definitions ─────────────────────────────────────────────────────────
const SCREENS = {
    life_stage: {
        q: "Where are you right now?",
        field: "life_stage",
        options: [
            { value: "school", label: "School", emoji: "🏫" },
            { value: "college", label: "College", emoji: "🎓" },
            { value: "postgrad", label: "Postgrad", emoji: "📚" },
            { value: "working", label: "Working", emoji: "💼" },
        ],
    },
    school_class: {
        q: "You're in?",
        field: "school_class",
        options: [
            { value: "9", label: "Class 9", iconText: "9" },
            { value: "10", label: "Class 10", iconText: "10" },
            { value: "11", label: "Class 11", iconText: "11" },
            { value: "12", label: "Class 12", iconText: "12" },
        ],
    },
    school_stream: {
        q: "Your stream?",
        field: "school_stream",
        options: [
            { value: "science", label: "Science", emoji: "🔬" },
            { value: "commerce", label: "Commerce", emoji: "📊" },
            { value: "arts", label: "Arts", emoji: "🎨" },
            { value: "undecided", label: "Still deciding", emoji: "🤔" },
        ],
    },
    competitive_direction: {
        q: "Are competitive exams part of your plan?",
        field: "competitive_direction",
        options: [
            { value: "yes_serious", label: "Yes, seriously preparing", emoji: "🚀" },
            { value: "maybe", label: "Thinking about it", emoji: "🙂" },
            { value: "not_sure", label: "Still deciding", emoji: "🤔" },
            { value: "no", label: "Not planning to", emoji: "❌" },
        ],
    },
    jee_prep_level: {
        q: "Your preparation level right now?",
        field: "jee_prep_level",
        options: [
            { value: "already_preparing", label: "Already preparing", emoji: "🔥" },
            { value: "just_started", label: "Just started", emoji: "📚" },
            { value: "planning_to_start", label: "Planning to start", emoji: "😬" },
            { value: "havent_started", label: "Haven't started", emoji: "🤷" },
        ],
    },
    mock_test_response: {
        q: "When studies get difficult, you usually…",
        field: "mock_test_response",
        options: [
            { value: "try_harder", label: "Push harder", emoji: "💪" },
            { value: "check_soln", label: "Look for explanations", emoji: "📖" },
            { value: "feel_stressed", label: "Feel stressed", emoji: "😓" },
            { value: "avoid", label: "Avoid it for a while", emoji: "🚪" },
        ],
    },
    drop_year: {
        q: "Drop year is…",
        field: "drop_year",
        options: [
            { value: "acceptable", label: "Acceptable", emoji: "✅" },
            { value: "maybe", label: "Maybe", emoji: "🤔" },
            { value: "not_an_option", label: "Not an option", emoji: "❌" },
        ],
    },
    non_competitive_focus: {
        q: "What matters more right now?",
        field: "non_competitive_focus",
        options: [
            { value: "high_marks", label: "High board marks", emoji: "📊" },
            { value: "concept_clarity", label: "Concept clarity", emoji: "🧠" },
            { value: "career_clarity", label: "Career clarity", emoji: "🎯" },
            { value: "just_passing", label: "Just passing comfortably", emoji: "🙂" },
        ],
    },
    college_year: {
        q: "You're in your…",
        field: "college_year",
        options: [
            { value: "1", label: "1st Year", iconText: "1" },
            { value: "2", label: "2nd Year", iconText: "2" },
            { value: "3", label: "3rd Year", iconText: "3" },
            { value: "4", label: "4th Year", iconText: "4" },
        ],
    },
    college_focus: {
        q: "Your main focus right now?",
        field: "college_focus",
        options: [
            { value: "placement", label: "Placement", emoji: "💼" },
            { value: "higher_studies", label: "Higher Studies", emoji: "🎓" },
            { value: "govt_exams", label: "Govt Exams", emoji: "🏛" },
            { value: "startup", label: "Startup", emoji: "🚀" },
        ],
    },
    placement_skills: {
        q: "When it comes to skills…",
        field: "placement_skills",
        options: [
            { value: "already_building", label: "Already building", emoji: "💪" },
            { value: "learning_basics", label: "Learning basics", emoji: "📚" },
            { value: "watching_not_doing", label: "Watching, not doing", emoji: "😅" },
            { value: "havent_started", label: "Haven't started", emoji: "🤷" },
        ],
    },
    placement_resume: {
        q: "Resume right now?",
        field: "placement_resume",
        options: [
            { value: "strong", label: "Strong", emoji: "🔥" },
            { value: "average", label: "Average", emoji: "🙂" },
            { value: "weak", label: "Weak", emoji: "😬" },
            { value: "dont_have", label: "Don't have one", emoji: "❌" },
        ],
    },
    placement_interview: {
        q: "Interview tomorrow?",
        field: "placement_interview",
        options: [
            { value: "confident", label: "Confident", emoji: "😎" },
            { value: "nervous_ready", label: "Nervous but ready", emoji: "🙂" },
            { value: "underprepared", label: "Underprepared", emoji: "😓" },
            { value: "avoiding", label: "Avoiding it", emoji: "🚪" },
        ],
    },
    higher_targeting: {
        q: "You're targeting…",
        field: "higher_targeting",
        options: [
            { value: "india", label: "India", emoji: "🇮🇳" },
            { value: "abroad", label: "Abroad", emoji: "🌍" },
            { value: "not_sure", label: "Not sure", emoji: "🤔" },
        ],
    },
    higher_prep_stage: {
        q: "Preparation stage?",
        field: "higher_prep_stage",
        options: [
            { value: "actively_preparing", label: "Actively preparing", emoji: "📚" },
            { value: "researching", label: "Researching", emoji: "🙂" },
            { value: "thinking_about_it", label: "Thinking about it", emoji: "😅" },
            { value: "no_idea", label: "No idea yet", emoji: "🤷" },
        ],
    },
    career_shift_intent: {
        q: "You want to…",
        field: "career_shift_intent",
        options: [
            { value: "grow_same", label: "Grow in same field", emoji: "⬆️" },
            { value: "switch_domain", label: "Switch domain", emoji: "🔁" },
            { value: "academic", label: "Go academic", emoji: "🎓" },
            { value: "build_own", label: "Build own thing", emoji: "🚀" },
        ],
    },
    career_stuck_response: {
        q: "When stuck in career decisions…",
        field: "career_stuck_response",
        options: [
            { value: "research_deeply", label: "Research deeply", emoji: "🧠" },
            { value: "ask_others", label: "Ask others", emoji: "📞" },
            { value: "overthink", label: "Overthink", emoji: "😓" },
            { value: "ignore", label: "Ignore", emoji: "🚪" },
        ],
    },
    daily_time: {
        q: "Daily focused time?",
        field: "daily_time",
        options: [
            { value: "less_1hr", label: "< 1 hr", emoji: "😅" },
            { value: "1_2hrs", label: "1–2 hrs", emoji: "🙂" },
            { value: "2_4hrs", label: "2–4 hrs", emoji: "💪" },
            { value: "4plus", label: "4+ hrs", emoji: "🔥" },
        ],
    },
    dream_vs_effort: {
        q: "Your dream vs effort match?",
        field: "dream_vs_effort",
        options: [
            { value: "almost_equal", label: "Almost equal", emoji: "🎯" },
            { value: "needs_work", label: "Needs work", emoji: "📉" },
            { value: "far_apart", label: "Far apart", emoji: "😬" },
            { value: "never_thought", label: "Never thought about", emoji: "🤷" },
        ],
    },
    pressure_response: {
        q: "Under pressure you…",
        field: "pressure_response",
        options: [
            { value: "perform_better", label: "Perform better", emoji: "⚡" },
            { value: "panic_but_act", label: "Panic but act", emoji: "😬" },
            { value: "overthink", label: "Overthink", emoji: "🌀" },
            { value: "shut_down", label: "Shut down", emoji: "💤" },
        ],
    },
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function UniversalOnboarding() {
    const navigate = useNavigate();
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fd, setFd] = useState({
        life_stage: "",
        school_class: "", school_stream: "", competitive_direction: "",
        jee_prep_level: "", mock_test_response: "", drop_year: "",
        non_competitive_focus: "",
        college_year: "", college_focus: "",
        placement_skills: "", placement_resume: "", placement_interview: "",
        higher_targeting: "", higher_prep_stage: "",
        career_shift_intent: "", career_stuck_response: "",
        daily_time: "", dream_vs_effort: "", pressure_response: "",
        // commitment lock
        committed: false,
        gender: "",
        name: "", phone_number: "", date_of_birth: "",
    });

    const steps = useMemo(() => buildSteps(fd), [fd]);

    const currentStepId = steps[stepIndex] || "life_stage";
    const totalSteps = steps.length;
    // Calculate progress as a percentage
    const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

    // Set a field and clear downstream dependency paths based on newly selected value
    const set = (field, value) => {
        if (field === "life_stage") {
            setFd(prev => ({
                ...prev, life_stage: value,
                school_class: "", school_stream: "", competitive_direction: "",
                jee_prep_level: "", mock_test_response: "", drop_year: "", non_competitive_focus: "",
                college_year: "", college_focus: "",
                placement_skills: "", placement_resume: "", placement_interview: "", higher_targeting: "", higher_prep_stage: "",
                career_shift_intent: "", career_stuck_response: "",
            }));
        } else if (field === "school_class") {
            setFd(prev => ({ ...prev, school_class: value, school_stream: "", competitive_direction: "", jee_prep_level: "", mock_test_response: "", drop_year: "", non_competitive_focus: "" }));
        } else if (field === "competitive_direction") {
            setFd(prev => ({ ...prev, competitive_direction: value, jee_prep_level: "", mock_test_response: "", drop_year: "", non_competitive_focus: "" }));
        } else if (field === "college_focus") {
            setFd(prev => ({ ...prev, college_focus: value, placement_skills: "", placement_resume: "", placement_interview: "", higher_targeting: "", higher_prep_stage: "" }));
        } else {
            setFd(prev => ({ ...prev, [field]: value }));
        }
    };

    // Auto-advance after tap with a slight delay for option screens
    const pick = (field, value) => {
        set(field, value);
        const newFd = { ...fd, [field]: value };
        const newSteps = buildSteps(newFd);
        const nextIdx = Math.min(stepIndex + 1, newSteps.length - 1);
        setTimeout(() => setStepIndex(nextIdx), 300);
    };

    const canProceed = () => {
        if (currentStepId === "commitment_lock") return fd.committed;
        if (currentStepId === "personal") return fd.name.trim() && fd.phone_number.trim() && fd.date_of_birth && fd.gender;
        return !!fd[currentStepId];
    };

    const handleBack = () => setStepIndex(p => Math.max(p - 1, 0));
    const handleNext = () => setStepIndex(p => Math.min(p + 1, totalSteps - 1));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await api.patch("users/update-profile/", mapToBackend(fd));
            if (response?.data?.onboarding_complete) {
                sessionStorage.setItem("show_realtime_onboarding_intro", "true");
                sessionStorage.removeItem("show_welcome_coach");
            } else {
                sessionStorage.setItem("show_welcome_coach", fd.name?.split(" ")[0] || "true");
            }
            navigate("/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
            window.dispatchEvent(new CustomEvent("app-error", { detail: { message: "Failed to complete onboarding. Please try again." } }));
        } finally {
            setLoading(false);
        }
    };

    // ─── Render Step ─────────────────────────────────────────────────────────────
    const screen = SCREENS[currentStepId];
    const isLastStep = stepIndex === totalSteps - 1;
    const isManualStep = currentStepId === "commitment_lock" || currentStepId === "personal";

    const renderCurrentStep = () => {
        // Option Tap Screens
        if (screen) {
            let optionsToRender = screen.options;

            // Special rule: 12th graders shouldn't see "Still deciding" for streams
            if (currentStepId === "school_stream" && fd.school_class === "12") {
                optionsToRender = optionsToRender.filter(opt => opt.value !== "undecided");
            }

            return (
                <div className="space-y-4">
                    {optionsToRender.map(opt => (
                        <OptionCard
                            key={opt.value}
                            emoji={opt.emoji}
                            iconText={opt.iconText}
                            label={opt.label}
                            selected={fd[screen.field] === opt.value}
                            onClick={() => pick(screen.field, opt.value)}
                        />
                    ))}
                </div>
            );
        }

        // Summary Screen
        if (currentStepId === "commitment_lock") {
            const { strength, growth, direction } = buildSummary(fd);
            return (
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 shadow-[0_4px_0_0_rgba(229,231,235,1)] rounded-2xl p-6 space-y-5">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.6 }}
                            className="text-center text-4xl mb-4"
                        >
                            🏆
                        </motion.div>
                        {[
                            { icon: "🔥", label: "Strength", value: strength },
                            { icon: "⚠️", label: "Growth Area", value: growth },
                            { icon: "🎯", label: "Direction", value: direction },
                        ].map(row => (
                            <div key={row.label} className="flex items-start gap-4">
                                <span className="text-2xl mt-0.5">{row.icon}</span>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{row.label}</p>
                                    <p className="text-gray-900 font-bold text-[15px] leading-snug">{row.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <label className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition bg-white shadow-sm">
                        <input
                            type="checkbox"
                            checked={fd.committed}
                            onChange={e => setFd(prev => ({ ...prev, committed: e.target.checked }))}
                            className="w-6 h-6 mt-0.5 accent-blue-600 cursor-pointer rounded-md"
                        />
                        <p className="text-gray-700 text-[15px] font-medium leading-relaxed">
                            <span className="font-bold text-gray-900 block mb-1">I'm ready for structured guidance.</span>
                            I'll commit to honest progress tracking and give my very best.
                        </p>
                    </label>
                </div>
            );
        }

        // Personal Info
        if (currentStepId === "personal") {
            return (
                <div className="space-y-5">
                    {[
                        { label: "Full Name", field: "name", type: "text", placeholder: "e.g. John Doe" },
                        { label: "Phone Number", field: "phone_number", type: "tel", placeholder: "e.g. +91 9876543210" },
                        { label: "Date of Birth", field: "date_of_birth", type: "date", placeholder: "" },
                    ].map(inp => (
                        <div key={inp.field}>
                            <label className="block text-[15px] font-bold text-gray-800 mb-2">{inp.label}</label>
                            <input
                                type={inp.type}
                                value={fd[inp.field]}
                                onChange={e => setFd(prev => ({ ...prev, [inp.field]: e.target.value }))}
                                placeholder={inp.placeholder}
                                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-[16px] font-medium transition shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-[15px] font-bold text-gray-800 mb-2">Gender</label>
                        <select
                            value={fd.gender}
                            onChange={e => setFd(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-[16px] font-medium transition shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
            );
        }

        return null;
    };

    const questionText = screen?.q
        || (currentStepId === "commitment_lock" ? "Your Personalised Plan is Ready!" : "Almost there — a few last details");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Duolingo Style Progress Header */}
            <div className="px-5 py-6 flex items-center justify-between mx-auto w-full max-w-xl">
                <button
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition ${stepIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-200 active:scale-90"
                        }`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 px-4">
                    <div className="bg-gray-200 h-3.5 w-full rounded-full overflow-hidden">
                        <motion.div
                            className="bg-[#58cc02] h-full rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 60, damping: 14 }}
                        />
                    </div>
                </div>
                <div className="w-10 flex items-center justify-end">
                    <span className="text-sm font-bold text-gray-400">{stepIndex + 1}/{totalSteps}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-5 pb-8 mx-auto w-full max-w-xl flex flex-col">
                <QuickyMessage stepId={currentStepId} fd={fd} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    >
                        {/* Question Title */}
                        <h2 className="text-[26px] font-extrabold text-gray-900 mb-6 leading-tight">
                            {questionText}
                        </h2>

                        {/* Step Details */}
                        {renderCurrentStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom CTA for Manual Steps */}
            {isManualStep && (
                <div className="border-t-2 border-gray-200 bg-white p-5 sticky bottom-0 z-10 w-full">
                    <div className="max-w-xl mx-auto">
                        {isLastStep ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceed() || loading}
                                className={`w-full py-4 rounded-2xl font-bold text-[16px] uppercase tracking-wide transition-all ${canProceed() && !loading
                                    ? "bg-[#58cc02] text-white hover:bg-[#46a302] border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {loading ? "Setting up..." : "Start Journey"}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className={`w-full py-4 rounded-2xl font-bold text-[16px] uppercase tracking-wide transition-all ${canProceed()
                                    ? "bg-blue-500 text-white hover:bg-blue-600 border-b-4 border-blue-600 active:border-b-0 active:translate-y-1"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
