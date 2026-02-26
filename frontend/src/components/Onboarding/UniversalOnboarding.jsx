import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

// ─── Option Card ────────────────────────────────────────────────────────────────
function OptionCard({ emoji, label, sublabel, selected, onClick }) {
    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-150 focus:outline-none ${selected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                }`}
        >
            <div className="flex items-center gap-3">
                {emoji && <span className="text-2xl">{emoji}</span>}
                <div>
                    <div className="font-semibold text-base leading-tight">{label}</div>
                    {sublabel && (
                        <div className={`text-xs mt-0.5 ${selected ? "text-gray-300" : "text-gray-500"}`}>
                            {sublabel}
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
}

// ─── Step builder ───────────────────────────────────────────────────────────────
function buildSteps(fd) {
    const steps = ["life_stage", "momentum", "goal_clarity"];
    const ls = fd.life_stage;

    if (ls === "school") {
        steps.push("school_class");
        if (["11", "12"].includes(fd.school_class)) steps.push("school_stream");
        steps.push("competitive_direction");
        if (fd.competitive_direction === "yes_serious") {
            steps.push("jee_prep_level", "mock_test_response", "drop_year");
        } else if (["maybe", "not_sure", "no"].includes(fd.competitive_direction)) {
            steps.push("non_competitive_focus");
        }
    } else if (ls === "college") {
        steps.push("college_year", "college_focus");
        if (fd.college_focus === "placement") {
            steps.push("placement_skills", "placement_resume", "placement_interview");
        } else if (fd.college_focus === "higher_studies") {
            steps.push("higher_targeting", "higher_prep_stage");
        }
    } else if (ls === "postgrad" || ls === "working") {
        steps.push("career_shift_intent", "career_stuck_response");
    }

    if (ls) steps.push("daily_time", "dream_vs_effort", "pressure_response", "commitment_lock", "personal");
    return steps;
}

// ─── Summary builder ────────────────────────────────────────────────────────────
function buildSummary(fd) {
    let strength = "Building self-awareness";
    if (fd.momentum === "productive") strength = "Strong execution habits";
    else if (fd.momentum === "trying") strength = "Consistent intent & effort";
    else if (fd.competitive_direction === "yes_serious") strength = "Competitive drive";
    else if (fd.placement_skills === "already_building") strength = "Proactive skill building";
    else if (fd.career_shift_intent === "build_own") strength = "Entrepreneurial vision";

    let growth = "Structured planning";
    if (fd.goal_clarity === "confused") growth = "Career & goal clarity";
    else if (fd.goal_clarity === "no_idea") growth = "Direction finding";
    else if (fd.pressure_response === "overthink") growth = "Stress & decision management";
    else if (fd.dream_vs_effort === "far_apart") growth = "Bridging ambition with action";
    else if (fd.momentum === "delaying") growth = "Breaking procrastination";
    else if (fd.momentum === "distracted") growth = "Focus & consistency";
    else if (fd.placement_resume === "dont_have") growth = "Resume & visibility";

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
    const { name, phone_number, date_of_birth, committed, ...rest } = fd;

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
    };
}

// ─── Screen definitions ─────────────────────────────────────────────────────────
const SCREENS = {
    life_stage: {
        q: "Where are you right now?",
        field: "life_stage",
        options: [
            { value: "school",   label: "School",   emoji: "🏫" },
            { value: "college",  label: "College",  emoji: "🎓" },
            { value: "postgrad", label: "Postgrad", emoji: "📚" },
            { value: "working",  label: "Working",  emoji: "💼" },
        ],
    },
    momentum: {
        q: "Last 7 days you were mostly…",
        field: "momentum",
        options: [
            { value: "productive",  label: "Productive",  emoji: "🔥" },
            { value: "trying",      label: "Trying",      emoji: "🙂" },
            { value: "delaying",    label: "Delaying",    emoji: "😅" },
            { value: "distracted",  label: "Distracted",  emoji: "📱" },
        ],
    },
    goal_clarity: {
        q: "When someone asks your future plan…",
        field: "goal_clarity",
        options: [
            { value: "clear",     label: "Clear answer",  emoji: "😎" },
            { value: "few_ideas", label: "2–3 ideas",     emoji: "🤔" },
            { value: "confused",  label: "Confused",      emoji: "😬" },
            { value: "no_idea",   label: "No idea",       emoji: "🤷" },
        ],
    },
    school_class: {
        q: "You're in?",
        field: "school_class",
        options: [
            { value: "9",  label: "Class 9",  emoji: "9️⃣" },
            { value: "10", label: "Class 10", emoji: "🔟" },
            { value: "11", label: "Class 11", emoji: "1️⃣" },
            { value: "12", label: "Class 12", emoji: "2️⃣" },
        ],
    },
    school_stream: {
        q: "Your stream?",
        field: "school_stream",
        options: [
            { value: "science",   label: "Science",        emoji: "🔬" },
            { value: "commerce",  label: "Commerce",       emoji: "📊" },
            { value: "arts",      label: "Arts",           emoji: "🎨" },
            { value: "undecided", label: "Still deciding", emoji: "🤔" },
        ],
    },
    competitive_direction: {
        q: "Are you thinking about competitive exams?",
        field: "competitive_direction",
        options: [
            { value: "yes_serious", label: "Yes, serious", emoji: "🚀" },
            { value: "maybe",       label: "Maybe",        emoji: "🙂" },
            { value: "not_sure",    label: "Not sure",     emoji: "🤔" },
            { value: "no",          label: "No",           emoji: "❌" },
        ],
    },
    jee_prep_level: {
        q: "Your preparation level right now?",
        field: "jee_prep_level",
        options: [
            { value: "already_preparing", label: "Already preparing", emoji: "🔥" },
            { value: "just_started",      label: "Just started",      emoji: "📚" },
            { value: "planning_to_start", label: "Planning to start", emoji: "😬" },
            { value: "havent_started",    label: "Haven't started",   emoji: "🤷" },
        ],
    },
    mock_test_response: {
        q: "When mock tests get tough, you…",
        field: "mock_test_response",
        options: [
            { value: "try_harder",   label: "Try harder",      emoji: "💪" },
            { value: "check_soln",   label: "Check solutions", emoji: "📖" },
            { value: "feel_stressed",label: "Feel stressed",   emoji: "😓" },
            { value: "avoid",        label: "Avoid them",      emoji: "🚪" },
        ],
    },
    drop_year: {
        q: "Drop year is…",
        field: "drop_year",
        options: [
            { value: "acceptable",    label: "Acceptable",    emoji: "✅" },
            { value: "maybe",         label: "Maybe",         emoji: "🤔" },
            { value: "not_an_option", label: "Not an option", emoji: "❌" },
        ],
    },
    non_competitive_focus: {
        q: "What matters more right now?",
        field: "non_competitive_focus",
        options: [
            { value: "high_marks",      label: "High board marks",         emoji: "📊" },
            { value: "concept_clarity", label: "Concept clarity",          emoji: "🧠" },
            { value: "career_clarity",  label: "Career clarity",           emoji: "🎯" },
            { value: "just_passing",    label: "Just passing comfortably", emoji: "🙂" },
        ],
    },
    college_year: {
        q: "You're in your…",
        field: "college_year",
        options: [
            { value: "1", label: "1st Year", emoji: "1️⃣" },
            { value: "2", label: "2nd Year", emoji: "2️⃣" },
            { value: "3", label: "3rd Year", emoji: "3️⃣" },
            { value: "4", label: "4th Year", emoji: "4️⃣" },
        ],
    },
    college_focus: {
        q: "Your main focus right now?",
        field: "college_focus",
        options: [
            { value: "placement",      label: "Placement",      emoji: "💼" },
            { value: "higher_studies", label: "Higher Studies", emoji: "🎓" },
            { value: "govt_exams",     label: "Govt Exams",     emoji: "🏛" },
            { value: "startup",        label: "Startup",        emoji: "🚀" },
        ],
    },
    placement_skills: {
        q: "When it comes to skills…",
        field: "placement_skills",
        options: [
            { value: "already_building",   label: "Already building",    emoji: "💪" },
            { value: "learning_basics",    label: "Learning basics",     emoji: "📚" },
            { value: "watching_not_doing", label: "Watching, not doing", emoji: "😅" },
            { value: "havent_started",     label: "Haven't started",     emoji: "🤷" },
        ],
    },
    placement_resume: {
        q: "Resume right now?",
        field: "placement_resume",
        options: [
            { value: "strong",     label: "Strong",         emoji: "🔥" },
            { value: "average",    label: "Average",        emoji: "🙂" },
            { value: "weak",       label: "Weak",           emoji: "😬" },
            { value: "dont_have",  label: "Don't have one", emoji: "❌" },
        ],
    },
    placement_interview: {
        q: "Interview tomorrow?",
        field: "placement_interview",
        options: [
            { value: "confident",     label: "Confident",         emoji: "😎" },
            { value: "nervous_ready", label: "Nervous but ready", emoji: "🙂" },
            { value: "underprepared", label: "Underprepared",     emoji: "😓" },
            { value: "avoiding",      label: "Avoiding it",       emoji: "🚪" },
        ],
    },
    higher_targeting: {
        q: "You're targeting…",
        field: "higher_targeting",
        options: [
            { value: "india",    label: "India",    emoji: "🇮🇳" },
            { value: "abroad",   label: "Abroad",   emoji: "🌍" },
            { value: "not_sure", label: "Not sure", emoji: "🤔" },
        ],
    },
    higher_prep_stage: {
        q: "Preparation stage?",
        field: "higher_prep_stage",
        options: [
            { value: "actively_preparing", label: "Actively preparing", emoji: "📚" },
            { value: "researching",        label: "Researching",        emoji: "🙂" },
            { value: "thinking_about_it",  label: "Thinking about it",  emoji: "😅" },
            { value: "no_idea",            label: "No idea yet",        emoji: "🤷" },
        ],
    },
    career_shift_intent: {
        q: "You want to…",
        field: "career_shift_intent",
        options: [
            { value: "grow_same",     label: "Grow in same field", emoji: "⬆️" },
            { value: "switch_domain", label: "Switch domain",      emoji: "🔁" },
            { value: "academic",      label: "Go academic",        emoji: "🎓" },
            { value: "build_own",     label: "Build own thing",    emoji: "🚀" },
        ],
    },
    career_stuck_response: {
        q: "When stuck in career decisions…",
        field: "career_stuck_response",
        options: [
            { value: "research_deeply", label: "Research deeply", emoji: "🧠" },
            { value: "ask_others",      label: "Ask others",      emoji: "📞" },
            { value: "overthink",       label: "Overthink",       emoji: "😓" },
            { value: "ignore",          label: "Ignore",          emoji: "🚪" },
        ],
    },
    daily_time: {
        q: "Daily focused time?",
        field: "daily_time",
        options: [
            { value: "less_1hr", label: "< 1 hr",  emoji: "😅" },
            { value: "1_2hrs",   label: "1–2 hrs", emoji: "🙂" },
            { value: "2_4hrs",   label: "2–4 hrs", emoji: "💪" },
            { value: "4plus",    label: "4+ hrs",  emoji: "🔥" },
        ],
    },
    dream_vs_effort: {
        q: "Your dream vs effort match?",
        field: "dream_vs_effort",
        options: [
            { value: "almost_equal",  label: "Almost equal",        emoji: "🎯" },
            { value: "needs_work",    label: "Needs work",          emoji: "📉" },
            { value: "far_apart",     label: "Far apart",           emoji: "😬" },
            { value: "never_thought", label: "Never thought about", emoji: "🤷" },
        ],
    },
    pressure_response: {
        q: "Under pressure you…",
        field: "pressure_response",
        options: [
            { value: "perform_better", label: "Perform better", emoji: "⚡" },
            { value: "panic_but_act",  label: "Panic but act",  emoji: "😬" },
            { value: "overthink",      label: "Overthink",      emoji: "🌀" },
            { value: "shut_down",      label: "Shut down",      emoji: "💤" },
        ],
    },
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function UniversalOnboarding() {
    const navigate = useNavigate();
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fd, setFd] = useState({
        life_stage: "", momentum: "", goal_clarity: "",
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
        // personal
        name: "", phone_number: "", date_of_birth: "",
    });

    const steps = useMemo(() => buildSteps(fd), [
        fd.life_stage, fd.school_class, fd.competitive_direction, fd.college_focus,
    ]);

    const currentStepId = steps[stepIndex] || "life_stage";
    const totalSteps = steps.length;
    const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

    // Set a field and optionally reset downstream branching fields
    const set = (field, value) => {
        if (field === "life_stage") {
            setFd(prev => ({
                ...prev, life_stage: value,
                school_class: "", school_stream: "", competitive_direction: "",
                jee_prep_level: "", mock_test_response: "", drop_year: "",
                non_competitive_focus: "",
                college_year: "", college_focus: "",
                placement_skills: "", placement_resume: "", placement_interview: "",
                higher_targeting: "", higher_prep_stage: "",
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

    // Auto-advance after tap (for option screens)
    const pick = (field, value) => {
        set(field, value);
        // Compute new steps based on the updated value
        const newFd = { ...fd, [field]: value };
        const newSteps = buildSteps(newFd);
        const nextIdx = Math.min(stepIndex + 1, newSteps.length - 1);
        setTimeout(() => setStepIndex(nextIdx), 200);
    };

    const canProceed = () => {
        if (currentStepId === "commitment_lock") return fd.committed;
        if (currentStepId === "personal") return fd.name.trim() && fd.phone_number.trim() && fd.date_of_birth;
        return !!fd[currentStepId];
    };

    const handleBack = () => setStepIndex(p => Math.max(p - 1, 0));
    const handleNext = () => setStepIndex(p => Math.min(p + 1, totalSteps - 1));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.patch("users/update-profile/", mapToBackend(fd));
            navigate("/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
            window.dispatchEvent(new CustomEvent("app-error", { detail: { message: "Failed to complete onboarding. Please try again." } }));
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
    const screen = SCREENS[currentStepId];
    const isLastStep = stepIndex === totalSteps - 1;
    const isManualStep = currentStepId === "commitment_lock" || currentStepId === "personal";

    const renderCurrentStep = () => {
        // Standard 4-option tap screens
        if (screen) {
            return (
                <div className="space-y-3">
                    {screen.options.map(opt => (
                        <OptionCard
                            key={opt.value}
                            emoji={opt.emoji}
                            label={opt.label}
                            selected={fd[screen.field] === opt.value}
                            onClick={() => pick(screen.field, opt.value)}
                        />
                    ))}
                </div>
            );
        }

        // Commitment lock (summary + checkbox)
        if (currentStepId === "commitment_lock") {
            const { strength, growth, direction } = buildSummary(fd);
            return (
                <div className="space-y-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                        {[
                            { icon: "🔥", label: "Strength",    value: strength },
                            { icon: "⚠️", label: "Growth Area", value: growth },
                            { icon: "🎯", label: "Direction",   value: direction },
                        ].map(row => (
                            <div key={row.label} className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">{row.icon}</span>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{row.label}</p>
                                    <p className="text-gray-900 font-semibold leading-snug">{row.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <label className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-gray-900 transition">
                        <input
                            type="checkbox"
                            checked={fd.committed}
                            onChange={e => setFd(prev => ({ ...prev, committed: e.target.checked }))}
                            className="w-5 h-5 mt-0.5 accent-gray-900 cursor-pointer"
                        />
                        <p className="text-gray-700 text-sm leading-relaxed">
                            <span className="font-bold text-gray-900">I\'m ready for structured guidance.</span>
                            <br />
                            I\'ll commit to honest progress tracking and give my best.
                        </p>
                    </label>
                </div>
            );
        }

        // Personal info
        if (currentStepId === "personal") {
            return (
                <div className="space-y-4">
                    {[
                        { label: "Full Name",      field: "name",          type: "text",  placeholder: "Enter your full name" },
                        { label: "Phone Number",   field: "phone_number",  type: "tel",   placeholder: "+91 9876543210" },
                        { label: "Date of Birth",  field: "date_of_birth", type: "date",  placeholder: "" },
                    ].map(inp => (
                        <div key={inp.field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{inp.label}</label>
                            <input
                                type={inp.type}
                                value={fd[inp.field]}
                                onChange={e => setFd(prev => ({ ...prev, [inp.field]: e.target.value }))}
                                placeholder={inp.placeholder}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-900 outline-none text-[15px] transition"
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    const questionText = screen?.q
        || (currentStepId === "commitment_lock" ? "Your personalised summary" : "Almost there — a few last details");

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Progress bar */}
            <div className="bg-gray-100 h-1.5 w-full">
                <motion.div
                    className="bg-gray-900 h-1.5"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>

            {/* Top bar */}
            <div className="px-6 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
                <button
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className={`text-sm font-medium transition ${stepIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-900"}`}
                >
                    ← Back
                </button>
                <p className="text-xs text-gray-400 font-medium">{stepIndex + 1} / {totalSteps}</p>
                <div className="w-12" />
            </div>

            {/* Content area */}
            <div className="flex-1 px-6 pb-4 max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepId}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Question */}
                        <h2 className="text-[22px] font-bold text-gray-900 mb-6 leading-snug">
                            {questionText}
                        </h2>

                        {/* Step content */}
                        {renderCurrentStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Manual-step CTA button */}
            {isManualStep && (
                <div className="px-6 pb-10 max-w-lg mx-auto w-full">
                    {isLastStep ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all ${canProceed() && !loading
                                ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        >
                            {loading ? "Setting up your plan…" : "Start my journey →"}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all ${canProceed()
                                ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        >
                            Continue →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
