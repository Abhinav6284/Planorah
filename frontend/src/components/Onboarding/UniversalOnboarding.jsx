import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, Calendar, Target, TrendingUp, Sparkles, ChevronLeft, Users } from 'lucide-react';
import api from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";

const DISABLE_ONBOARDING_SUBMIT = false;

// ─── Option Card ────────────────────────────────────────────────────────────────
// ─── Premium Design System Tokens ───────────────────────────────────────────
const PREMIUM_THEME = {
    bg: 'var(--n-surface)',
    bgSecondary: 'var(--n-surface-low)',
    cardBg: 'var(--n-surface-highest)',
    cardSelected: 'var(--n-surface-highest)',
    border: 'var(--n-ghost-border)',
    borderHover: 'var(--n-outline-variant)',
    borderActive: 'var(--n-primary)',
    text: 'var(--n-text)',
    textSecondary: 'var(--n-text-secondary)',
    textMuted: 'var(--n-text-muted)',
    radius: 16,
    spacing: {
        cinematicPadding: 60,
        clusterGap: 20
    },
    fontDisplay: 'var(--font-newsreader)',
    fontBody: 'var(--font-manrope)',
    fontLabel: 'var(--font-space-grotesk)',
};

// ─── Option Tile (Premium Identity Card) ────────────────────────────────────
function OptionCard({ emoji, iconText, label, subtitle, meta, selected, onClick, index }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] } }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                position: 'relative',
                fontFamily: PREMIUM_THEME.fontBody,
            }}
        >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontWeight: 500, fontFamily: PREMIUM_THEME.fontLabel, width: 24 }}>
                        0{index + 1}
                    </span>
                    <h3 style={{
                        fontSize: 'clamp(20px, 3vw, 32px)',
                        fontWeight: 300,
                        color: selected ? '#ffffff' : (isHovered ? '#ffffff' : 'rgba(255,255,255,0.5)'),
                        margin: 0,
                        letterSpacing: '-0.02em',
                        transition: 'color 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                    }}>
                        {label}
                    </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {(emoji || iconText) && (
                        <motion.div
                            animate={{ opacity: isHovered || selected ? 1 : 0.2, scale: isHovered || selected ? 1 : 0.9 }}
                            transition={{ duration: 0.3 }}
                            style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: (isHovered || selected) ? 'none' : 'grayscale(100%)' }}
                        >
                            {iconText ? <span style={{ fontSize: 20, color: '#fff', fontWeight: 500 }}>{iconText}</span> : emoji}
                        </motion.div>
                    )}
                    <motion.div
                        animate={{ x: isHovered || selected ? 0 : -10, opacity: isHovered || selected ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowRight style={{ width: 24, height: 24 }} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {(isHovered || selected) && (subtitle || meta) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, paddingLeft: 56 }}>
                            {subtitle && (
                                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                                    {subtitle}
                                </span>
                            )}
                            {meta && (
                                <>
                                    <div style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: PREMIUM_THEME.fontLabel }}>
                                        {meta}
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
        field: "life_stage",
        q: "Where are you academically positioned today?",
        sub: "Planorah utilizes this context to calibrate timelines, filter opportunities, and map your execution intensity across strategic pathways.",
        micro: "USER PROFILING",
        options: [
            { label: "School", subtitle: "Early academic foundation", meta: "Long-horizon planning", value: "school", emoji: "🏫" },
            { label: "College", subtitle: "Building future direction", meta: "Career alignment stage", value: "college", emoji: "🎓" },
            { label: "Postgraduate", subtitle: "Specializing with intent", meta: "Advanced positioning", value: "pg", emoji: "🧩" },
            { label: "Working", subtitle: "Career advancement focus", meta: "Strategic transition mapping", value: "working", emoji: "💼" },
        ],
        bullets: [
            "Timeline calibration",
            "Opportunity filtering",
            "Goal intensity mapping"
        ]
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
    school_competitive: {
        field: "wants_competitive",
        q: "Are competitive exams part of your long-term plan?",
        sub: "This helps Planora shape preparation timelines, intensity, and alternate strategic pathways.",
        micro: "Long-term ambition mapping",
        options: [
            { label: "Yes, actively preparing", subtitle: "Competitive exams are a current focus", value: "yes", emoji: "🎯" },
            { label: "Considering seriously", subtitle: "Exploring suitable exam directions", value: "considering", emoji: "🔍" },
            { label: "Still evaluating", subtitle: "Decision is not finalized yet", value: "evaluating", emoji: "⏳" },
            { label: "Not in my plan", subtitle: "Focusing on non-exam opportunities", value: "no", emoji: "🛤️" }
        ]
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
    const { theme } = useTheme();
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
        committed: false,
        gender: "",
        name: "", phone_number: "", date_of_birth: "",
    });
    const [hoveredStrategyRow, setHoveredStrategyRow] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    const steps = useMemo(() => buildSteps(fd), [fd]);

    const currentStepId = steps[stepIndex] || "life_stage";
    const totalSteps = steps.length;
    const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

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

    const handleBack = () => {
        if (loading) return;
        setStepIndex(p => Math.max(p - 1, 0));
    };

    const handleContinue = async () => {
        if (loading || !canProceed()) return;

        const isFinalStep = stepIndex === totalSteps - 1 && currentStepId === "personal";
        if (!isFinalStep) {
            setStepIndex(p => Math.min(p + 1, totalSteps - 1));
            return;
        }

        if (DISABLE_ONBOARDING_SUBMIT) {
            sessionStorage.setItem("show_welcome_coach", fd.name?.split(" ")[0] || "true");
            navigate("/dashboard");
            return;
        }

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
        } finally {
            setLoading(false);
        }
    };

    const screen = SCREENS[currentStepId];
    const isLastStep = stepIndex === totalSteps - 1;
    const isManualStep = currentStepId === "personal";

    const renderCurrentStep = () => {
        if (screen) {
            let optionsToRender = screen.options;
            if (currentStepId === "school_stream" && fd.school_class === "12") {
                optionsToRender = optionsToRender.filter(opt => opt.value !== "undecided");
            }

            return (
                <motion.div 
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                    }}
                    initial="hidden"
                    animate="visible"
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        padding: '0 20px',
                        width: '100%',
                        maxWidth: 720,
                        margin: '0 auto'
                    }}
                >
                    {optionsToRender.map((opt, i) => (
                        <OptionCard
                            key={opt.value}
                            index={i}
                            emoji={opt.emoji}
                            iconText={opt.iconText}
                            label={opt.label}
                            subtitle={opt.subtitle}
                            meta={opt.meta}
                            selected={fd[screen.field] === opt.value}
                            onClick={() => pick(screen.field, opt.value)}
                        />
                    ))}
                </motion.div>
            );
        }

        if (currentStepId === "commitment_lock") {
            const { strength, growth, direction } = buildSummary(fd);
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%', maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.9 }}>🏆</div>
                        <h1 style={{
                            fontSize: 'clamp(28px, 5vw, 40px)',
                            fontWeight: 300,
                            color: '#ffffff',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            margin: '0 0 12px 0',
                            fontFamily: PREMIUM_THEME.fontBody
                        }}>
                            Strategy Calibrated
                        </h1>
                        <p style={{
                            fontSize: 'clamp(14px, 2.5vw, 16px)',
                            color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.4,
                            margin: 0,
                            fontFamily: PREMIUM_THEME.fontBody,
                            fontWeight: 400
                        }}>
                            Review your focus areas and commit to execution.
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {[
                            { icon: Sparkles, label: "Strength", value: strength, num: "01" },
                            { icon: TrendingUp, label: "Growth Area", value: growth, num: "02" },
                            { icon: Target, label: "Focus", value: direction, num: "03" }
                        ].map(({ icon: Icon, label, value, num }) => {
                            const isHovered = hoveredStrategyRow === label;
                            const isDimmed = hoveredStrategyRow !== null && !isHovered;

                            return (
                                <div 
                                    key={label}
                                    onMouseEnter={() => setHoveredStrategyRow(label)}
                                    onMouseLeave={() => setHoveredStrategyRow(null)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '16px 0',
                                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                                        opacity: isDimmed ? 0.3 : 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 500, fontFamily: PREMIUM_THEME.fontLabel, width: 24 }}>
                                                {num}
                                            </span>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: PREMIUM_THEME.fontLabel, marginBottom: 4, textAlign: 'left' }}>
                                                    {label}
                                                </div>
                                                <h3 style={{
                                                    fontSize: 'clamp(16px, 3.5vw, 22px)',
                                                    fontWeight: 300,
                                                    color: '#ffffff',
                                                    margin: 0,
                                                    letterSpacing: '-0.02em',
                                                    fontFamily: PREMIUM_THEME.fontBody,
                                                    textAlign: 'left'
                                                }}>
                                                    {value}
                                                </h3>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            width: 36, height: 36, borderRadius: '50%', 
                                            background: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <Icon style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <motion.div 
                            onMouseEnter={() => setHoveredStrategyRow("Commitment")}
                            onMouseLeave={() => setHoveredStrategyRow(null)}
                            whileHover="hover"
                            initial="rest"
                            onClick={() => {
                                setFd(prev => ({ ...prev, committed: true }));
                                setTimeout(handleContinue, 0);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 32,
                                padding: '24px 0',
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                borderBottom: '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                opacity: (hoveredStrategyRow !== null && hoveredStrategyRow !== "Commitment") ? 0.3 : 1,
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontFamily: PREMIUM_THEME.fontLabel, width: 24 }}>
                                    04
                                </span>
                                <div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: PREMIUM_THEME.fontLabel, marginBottom: 4, textAlign: 'left' }}>
                                        Commitment
                                    </div>
                                    <h3 style={{
                                        fontSize: 'clamp(18px, 3.5vw, 24px)',
                                        fontWeight: 300,
                                        color: '#ffffff',
                                        margin: 0,
                                        letterSpacing: '-0.02em',
                                        fontFamily: PREMIUM_THEME.fontBody,
                                        textAlign: 'left'
                                    }}>
                                        I am ready for guidance
                                    </h3>
                                </div>
                            </div>
                            <motion.div 
                                variants={{
                                    rest: { opacity: 0, x: -15 },
                                    hover: { opacity: 1, x: 0 }
                                }}
                                transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.6)' }}
                            >
                                <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: PREMIUM_THEME.fontLabel }}>Accept & Continue</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#ffffff', color: '#000000' }}>
                                    <ArrowRight style={{ width: 18, height: 18 }} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            );
        }

        if (currentStepId === "personal") {
            const PERSONAL_INPUTS = [
                { label: "Full Name", field: "name", type: "text", placeholder: "Enter your name", icon: User, num: "01" },
                { label: "Phone Number", field: "phone_number", type: "tel", placeholder: "Enter phone number", icon: Phone, num: "02" },
                { label: "Date of Birth", field: "date_of_birth", type: "date", placeholder: "", icon: Calendar, num: "03" },
            ];
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 540, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <h1 style={{
                            fontSize: 'clamp(28px, 5vw, 40px)',
                            fontWeight: 300,
                            color: '#ffffff',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            margin: '0 0 12px 0',
                            fontFamily: PREMIUM_THEME.fontBody
                        }}>
                            Final Details
                        </h1>
                        <p style={{
                            fontSize: 'clamp(14px, 2.5vw, 16px)',
                            color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.4,
                            margin: 0,
                            fontFamily: PREMIUM_THEME.fontBody,
                            fontWeight: 400
                        }}>
                            Please provide your basic information to complete setup.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {PERSONAL_INPUTS.map(inp => {
                            const isFocused = focusedField === inp.field;
                            const isDimmed = focusedField !== null && !isFocused;

                            return (
                                <div 
                                    key={inp.field}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 24,
                                        padding: '16px 0',
                                        borderBottom: `1px solid ${isFocused ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                        opacity: isDimmed ? 0.3 : 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 500, fontFamily: PREMIUM_THEME.fontLabel, width: 24, marginTop: 4 }}>
                                        {inp.num}
                                    </span>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <label style={{ 
                                            fontSize: 10, 
                                            fontWeight: 600, 
                                            color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.05em', 
                                            fontFamily: PREMIUM_THEME.fontLabel,
                                            textAlign: 'left',
                                            transition: 'color 0.3s ease'
                                        }}>
                                            {inp.label}
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type={inp.type}
                                                value={fd[inp.field]}
                                                onChange={e => setFd(prev => ({ ...prev, [inp.field]: e.target.value }))}
                                                placeholder={inp.placeholder}
                                                onFocus={() => setFocusedField(inp.field)}
                                                onBlur={() => setFocusedField(null)}
                                                style={{
                                                    width: '100%',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ffffff',
                                                    fontSize: 18,
                                                    fontWeight: 300,
                                                    outline: 'none',
                                                    padding: '4px 0',
                                                    fontFamily: PREMIUM_THEME.fontBody,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease', marginTop: 4 }}>
                                        <inp.icon style={{ width: 16, height: 16 }} />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Gender Field */}
                        {(() => {
                            const isFocused = focusedField === "gender";
                            const isDimmed = focusedField !== null && !isFocused;

                            return (
                                <div 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 24,
                                        padding: '16px 0',
                                        borderBottom: `1px solid ${isFocused ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                        opacity: isDimmed ? 0.3 : 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 500, fontFamily: PREMIUM_THEME.fontLabel, width: 24, marginTop: 4 }}>
                                        04
                                    </span>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <label style={{ 
                                            fontSize: 10, 
                                            fontWeight: 600, 
                                            color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.05em', 
                                            fontFamily: PREMIUM_THEME.fontLabel,
                                            textAlign: 'left',
                                            transition: 'color 0.3s ease'
                                        }}>
                                            Gender
                                        </label>
                                        <select
                                            value={fd.gender}
                                            onChange={e => setFd(prev => ({ ...prev, gender: e.target.value }))}
                                            onFocus={() => setFocusedField("gender")}
                                            onBlur={() => setFocusedField(null)}
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                color: fd.gender ? '#ffffff' : 'rgba(255,255,255,0.3)',
                                                fontSize: 18,
                                                fontWeight: 300,
                                                outline: 'none',
                                                padding: '4px 0',
                                                fontFamily: PREMIUM_THEME.fontBody,
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0 center',
                                                backgroundSize: '16px'
                                            }}
                                        >
                                            <option value="" disabled style={{ color: '#000' }}>Select gender</option>
                                            <option value="male" style={{ color: '#000' }}>Male</option>
                                            <option value="female" style={{ color: '#000' }}>Female</option>
                                            <option value="other" style={{ color: '#000' }}>Other</option>
                                        </select>
                                    </div>
                                    <div style={{ color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease', marginTop: 4 }}>
                                        <Users style={{ width: 16, height: 16 }} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <style>{`
                .onboarding-grid-bg {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--n-ghost-border); borderRadius: 10px; }
            `}</style>
            
            {/* Immersive Stage Background with Grid */}
            <div className="onboarding-grid-bg" style={{
                position: 'fixed',
                inset: 0,
                background: '#0a0a0a',
                color: 'var(--n-text)',
                fontFamily: PREMIUM_THEME.fontBody,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1000,
            }}>

                {/* Minimalist Header */}
                <header style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    padding: 'clamp(16px, 4vw, 32px) clamp(20px, 5vw, 40px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 20
                }}>
                    <button
                        onClick={handleBack}
                        disabled={stepIndex === 0}
                        style={{
                            width: 44, height: 44, borderRadius: 99,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent',
                            color: '#ffffff', cursor: stepIndex === 0 ? 'default' : 'pointer',
                            opacity: stepIndex === 0 ? 0 : 0.8,
                            transition: 'all 0.2s ease',
                            border: 'none',
                        }}
                        onMouseEnter={(e) => { if(stepIndex !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { if(stepIndex !== 0) e.currentTarget.style.background = 'transparent'; }}
                    >
                        <ChevronLeft style={{ width: 20, height: 20 }} />
                    </button>

                    {/* Progress Indicator */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} style={{
                                width: i === stepIndex ? 24 : 6,
                                height: 4,
                                borderRadius: 99,
                                background: i === stepIndex ? '#ffffff' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }} />
                        ))}
                    </div>

                    {/* Planorah Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
                        <div style={{ width: 16, height: 16, background: 'white', borderRadius: 3 }}></div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', display: 'none' }} className="sm-show">Planorah</span>
                    </div>
                </header>

                {/* Cinematic Center Stage */}
                <main className="custom-scrollbar" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(80px, 15vh, 140px) 24px 60px 24px',
                    position: 'relative',
                    zIndex: 10,
                    overflowY: 'auto'
                }}>
                    <div style={{ width: '100%', maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStepId}
                                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                {/* Only show the title section if it's not the manual steps */}
                                {!isManualStep && screen && (
                                    <div style={{ marginBottom: 48, maxWidth: 640 }}>
                                        <h1 style={{
                                            fontSize: 'clamp(40px, 8vw, 64px)',
                                            fontWeight: 300,
                                            color: '#ffffff',
                                            letterSpacing: '-0.03em',
                                            lineHeight: 1.1,
                                            margin: '0 0 24px 0',
                                            fontFamily: PREMIUM_THEME.fontBody
                                        }}>
                                            {screen.q}
                                        </h1>
                                        {screen.sub && (
                                            <p style={{
                                                fontSize: 'clamp(15px, 3vw, 18px)',
                                                color: 'rgba(255,255,255,0.5)',
                                                lineHeight: 1.5,
                                                margin: 0,
                                                fontFamily: PREMIUM_THEME.fontBody,
                                                fontWeight: 400
                                            }}>
                                                {screen.sub}
                                            </p>
                                        )}
                                        {screen.bullets && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', marginTop: 32, justifyContent: 'center' }}>
                                                {screen.bullets.map(b => (
                                                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 14, height: 14, borderRadius: 99, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1 4L3.5 6.5L9 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{b}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Render Options Grid or Custom Form */}
                                <div style={{ width: '100%' }}>
                                    {renderCurrentStep()}
                                </div>
                                
                                {/* Centered Continue Button for Manual Steps */}
                                {isManualStep && (
                                    <div style={{ marginTop: 40, width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={handleContinue}
                                            disabled={!canProceed() || loading}
                                            style={{
                                                width: '100%',
                                                padding: '20px 0',
                                                borderRadius: 16,
                                                background: '#ffffff',
                                                color: '#000000',
                                                fontSize: 16,
                                                fontWeight: 500,
                                                border: 'none',
                                                cursor: (canProceed() && !loading) ? 'pointer' : 'default',
                                                opacity: (canProceed() && !loading) ? 1 : 0.4,
                                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 12,
                                                fontFamily: PREMIUM_THEME.fontBody,
                                                boxShadow: (canProceed() && !loading) ? '0 8px 32px rgba(255, 255, 255, 0.15)' : 'none'
                                            }}
                                            onMouseEnter={(e) => { if(canProceed() && !loading) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#f5f5f5'; } }}
                                            onMouseLeave={(e) => { if(canProceed() && !loading) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; } }}
                                            onMouseDown={(e) => { if(canProceed() && !loading) { e.currentTarget.style.transform = 'scale(0.98)'; } }}
                                            onMouseUp={(e) => { if(canProceed() && !loading) { e.currentTarget.style.transform = 'scale(1.02)'; } }}
                                        >
                                            {loading ? 'Processing...' : isLastStep ? 'Complete Setup' : 'Continue'}
                                            {!loading && <ArrowRight style={{ width: 18, height: 18 }} />}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </>
    );
}
