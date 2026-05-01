import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, Calendar, Target, TrendingUp, Sparkles, ChevronLeft } from 'lucide-react';
import api from "../../api/axios";
const DISABLE_ONBOARDING_SUBMIT = false;

// ─── Option Card ────────────────────────────────────────────────────────────────
// ─── Premium Design System Tokens ───────────────────────────────────────────
// ─── Premium Design System Tokens ───────────────────────────────────────────
const PREMIUM_THEME = {
    bg: '#0d0d0d',
    bgGradient: 'radial-gradient(circle at 80% 20%, #1a1a1a 0%, #0d0d0d 100%)',
    cardBg: '#141414',
    cardSelected: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.15)',
    borderActive: 'rgba(255,255,255,0.4)',
    textMuted: 'rgba(255,255,255,0.25)',
    textSupport: 'rgba(255,255,255,0.45)',
    radius: 24,
    spacing: {
        cinematicPadding: 80,
        clusterGap: 24
    }
};

// ─── Option Tile (Premium Identity Card) ────────────────────────────────────
function OptionCard({ emoji, iconText, label, subtitle, meta, selected, onClick, index }) {
    return (
        <motion.button
            type="button"
            variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{
                borderColor: PREMIUM_THEME.borderHover,
                y: -4,
                background: 'rgba(255,255,255,0.02)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                width: '100%',
                maxWidth: 320,
                aspectRatio: '1 / 0.9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px',
                background: selected ? PREMIUM_THEME.cardSelected : PREMIUM_THEME.cardBg,
                border: `1px solid ${selected ? PREMIUM_THEME.borderActive : PREMIUM_THEME.border}`,
                borderRadius: PREMIUM_THEME.radius,
                cursor: 'pointer',
                transition: 'all 0.6s cubic-bezier(0.2, 0, 0, 1)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selected ? '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.02)' : '0 10px 30px -10px rgba(0,0,0,0.4)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    color: 'var(--el-text)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    {iconText || emoji}
                </div>
                
                {selected && (
                    <motion.div
                        layoutId="active-indicator"
                        style={{
                            width: 12, height: 12, borderRadius: 99,
                            background: '#fff',
                            boxShadow: '0 0 15px rgba(255,255,255,0.5)'
                        }}
                    />
                )}
            </div>
            
            <div>
                <div style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: 'var(--el-text)',
                    letterSpacing: '-0.02em',
                    marginBottom: 8
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: PREMIUM_THEME.textSupport,
                    lineHeight: 1.4,
                    marginBottom: 12
                }}>
                    {subtitle}
                </div>
                {meta && (
                    <div style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: PREMIUM_THEME.textMuted,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: 12
                    }}>
                        {meta}
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
    const isManualStep = currentStepId === "commitment_lock" || currentStepId === "personal";

    const renderCurrentStep = () => {
        if (screen) {
            let optionsToRender = screen.options;
            if (currentStepId === "school_stream" && fd.school_class === "12") {
                optionsToRender = optionsToRender.filter(opt => opt.value !== "undecided");
            }

            return (
                <motion.div 
                    variants={{
                        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
                    }}
                    initial="hidden"
                    animate="visible"
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: PREMIUM_THEME.spacing.clusterGap,
                        padding: '40px'
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 24,
                        padding: 48,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 24, opacity: 0.8 }}>🏆</div>
                        <h3 style={{ fontSize: 22, fontWeight: 500, color: 'var(--el-text)', marginBottom: 40, letterSpacing: '-0.02em' }}>Personalised Strategy</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'left' }}>
                            {[
                                { icon: Sparkles, label: "Strength", value: strength, color: 'rgba(255,255,255,0.6)' },
                                { icon: TrendingUp, label: "Growth Area", value: growth, color: 'rgba(255,255,255,0.6)' },
                                { icon: Target, label: "Focus", value: direction, color: 'rgba(255,255,255,0.6)' }
                            ].map(({ icon: Icon, label, value, color }) => (
                                <div key={label} style={{ display: 'flex', gap: 20 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Icon style={{ width: 18, height: 18, color: '#fff' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
                                        <p style={{ fontSize: 15, fontWeight: 400, color: 'var(--el-text)', lineHeight: 1.4 }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '24px',
                        background: fd.committed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: fd.committed ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}>
                        <input
                            type="checkbox"
                            checked={fd.committed}
                            onChange={e => setFd(prev => ({ ...prev, committed: e.target.checked }))}
                            style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--el-text)' }}
                        />
                        <div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--el-text)', margin: 0 }}>I'm ready for structured guidance</p>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>I commit to honest tracking and effort.</p>
                        </div>
                    </label>
                </div>
            );
        }

        if (currentStepId === "personal") {
            const PERSONAL_INPUTS = [
                { label: "Full Name", field: "name", type: "text", placeholder: "e.g. John Doe", icon: User },
                { label: "Phone Number", field: "phone_number", type: "tel", placeholder: "e.g. +91 9876543210", icon: Phone },
                { label: "Date of Birth", field: "date_of_birth", type: "date", placeholder: "", icon: Calendar },
            ];
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {PERSONAL_INPUTS.map(inp => (
                        <div key={inp.field}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{inp.label}</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }}>
                                    <inp.icon style={{ width: 14, height: 14 }} />
                                </div>
                                <input
                                    type={inp.type}
                                    value={fd[inp.field]}
                                    onChange={e => setFd(prev => ({ ...prev, [inp.field]: e.target.value }))}
                                    placeholder={inp.placeholder}
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'var(--el-text)', fontSize: 14, fontWeight: 400,
                                        outline: 'none', transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Gender</label>
                        <select
                            value={fd.gender}
                            onChange={e => setFd(prev => ({ ...prev, gender: e.target.value }))}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12,
                                background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                                color: 'var(--el-text)', fontSize: 15, fontWeight: 500,
                                outline: 'none', cursor: 'pointer',
                                boxShadow: 'var(--el-shadow-inset)',
                            }}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: PREMIUM_THEME.bg,
            color: 'var(--el-text)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            overflow: 'hidden',
            zIndex: 1000,
        }}>
            {/* LEFT ZONE: Context & Editorial */}
            <div style={{
                flex: '0 0 45%',
                padding: PREMIUM_THEME.spacing.cinematicPadding,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(160deg, #111111 0%, #0a0a0a 100%)',
                zIndex: 10,
                overflowY: 'auto',
            }}>
                <header style={{ marginBottom: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                        <button
                            onClick={handleBack}
                            disabled={stepIndex === 0}
                            style={{
                                width: 36, height: 36, borderRadius: 99,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                                color: 'var(--el-text)', cursor: stepIndex === 0 ? 'default' : 'pointer',
                                opacity: stepIndex === 0 ? 0 : 0.6, transition: 'all 0.3s',
                            }}
                        >
                            <ChevronLeft style={{ width: 14, height: 14 }} />
                        </button>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                style={{ height: '100%', background: 'var(--el-text)', opacity: 0.3 }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        color: PREMIUM_THEME.textMuted, 
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: 12
                    }}>
                        {String(stepIndex + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')} — {screen?.micro || "USER PROFILING"}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 4, borderRadius: 99, background: '#fff', opacity: 0.5 }} />
                        <span style={{ fontSize: 10, color: PREMIUM_THEME.textMuted, letterSpacing: '0.05em' }}>
                            Adaptive roadmap variables configuring
                        </span>
                    </div>
                </header>

                <div style={{ flex: 1 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                        >
                            <h1 style={{
                                fontSize: 48,
                                fontWeight: 400,
                                color: 'var(--el-text)',
                                letterSpacing: '-0.05em',
                                lineHeight: 1.05,
                                margin: '0 0 32px 0'
                            }}>
                                {screen?.q}
                            </h1>
                            <p style={{
                                fontSize: 16,
                                color: PREMIUM_THEME.textSupport,
                                lineHeight: 1.7,
                                marginBottom: 40,
                                maxWidth: 440
                            }}>
                                {screen?.sub}
                            </p>

                            {screen?.bullets && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {screen.bullets.map(b => (
                                        <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 12, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                                            <span style={{ fontSize: 11, color: PREMIUM_THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{b}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {isManualStep && (
                    <button
                        onClick={handleContinue}
                        disabled={!canProceed() || loading}
                        style={{
                            width: 'fit-content',
                            padding: '14px 40px',
                            borderRadius: 99,
                            background: 'var(--el-text)',
                            color: 'var(--el-bg)',
                            fontSize: 14,
                            fontWeight: 600,
                            border: 'none',
                            cursor: (canProceed() && !loading) ? 'pointer' : 'default',
                            opacity: (canProceed() && !loading) ? 1 : 0.2,
                            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        {loading ? 'Processing...' : isLastStep ? 'Complete Setup' : 'Proceed'}
                        {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
                    </button>
                )}
            </div>

            {/* RIGHT ZONE: Decision Cluster */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: PREMIUM_THEME.spacing.cinematicPadding,
                background: 'radial-gradient(circle at 60% 40%, #161616 0%, #0d0d0d 70%)',
                overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: 800 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                        >
                            {renderCurrentStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
