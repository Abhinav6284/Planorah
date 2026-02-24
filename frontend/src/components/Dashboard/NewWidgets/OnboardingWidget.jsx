import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { schedulerService } from "../../../api/schedulerService";

const TABS = ["Overview", "This Week", "Profile"];

const fallbackInsight = {
    source: "rule_based",
    identity_tag: "",
    summary: "Loading your personalised AI strategy...",
    today_action: "",
    action_points: ["Set one clear weekly goal.", "Block 3-5 deep work sessions.", "Track progress daily."],
    strengths: [], risks: [], pros: [], cons: [], week_plan: [],
    reflection_prompt: "What is the one win you want by the end of this week?",
    priority_focus: "Consistent execution",
    education_stage: "not_set",
    weekly_hours: 0,
    validation_mode: "mixed",
    readiness_score: 0,
    onboarding_highlights: [],
    onboarding_complete: false,
};

function SkeletonLine({ w = "full" }) {
    return <div className={`h-3.5 w-${w} bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse`} />;
}

export default function OnboardingWidget() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState(fallbackInsight);
    const [activeTab, setActiveTab] = useState(0);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        schedulerService.getOnboardingInsights()
            .then(data => setInsight({ ...fallbackInsight, ...data }))
            .catch(() => setInsight(fallbackInsight))
            .finally(() => setLoading(false));
    }, []);

    const readiness = Math.max(0, Math.min(100, insight.readiness_score || 0));
    const stageLabel = (insight.education_stage || "Not set").replace(/_/g, " ");
    const highlights = Array.isArray(insight.onboarding_highlights) ? insight.onboarding_highlights : [];
    const onboardingComplete = Boolean(insight.onboarding_complete);
    const weekPlan = Array.isArray(insight.week_plan) ? insight.week_plan : [];
    const actionPoints = Array.isArray(insight.action_points) ? insight.action_points : [];
    const strengths = Array.isArray(insight.strengths) ? insight.strengths : [];
    const risks = Array.isArray(insight.risks) ? insight.risks : [];
    const pros = Array.isArray(insight.pros) ? insight.pros : [];
    const cons = Array.isArray(insight.cons) ? insight.cons : [];

    const readinessColor =
        readiness >= 70 ? "from-emerald-400 to-teal-500"
            : readiness >= 40 ? "from-amber-400 to-orange-500"
                : "from-rose-400 to-pink-500";

    return (
        <div className="h-full rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] shadow-sm flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">AI Learning Intelligence</p>
                        {loading ? (
                            <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mt-1" />
                        ) : (
                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug truncate">
                                {insight.identity_tag || "Your Strategy"}
                            </h3>
                        )}
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize mt-0.5">{stageLabel} · {insight.weekly_hours || 0} hrs/week</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Readiness</p>
                        <p className={`text-2xl font-black bg-gradient-to-br ${readinessColor} bg-clip-text text-transparent`}>
                            {readiness}%
                        </p>
                    </div>
                </div>

                {/* Readiness bar */}
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
                    <div
                        className={`h-full bg-gradient-to-r ${readinessColor} transition-all duration-700`}
                        style={{ width: `${readiness}%` }}
                    />
                </div>

                {/* Highlights */}
                {!loading && highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {highlights.slice(0, 4).map((item, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {item}
                            </span>
                        ))}
                    </div>
                )}

                {/* Incomplete warning */}
                {!loading && !onboardingComplete && (
                    <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 dark:border-amber-700/30 dark:bg-amber-900/20 dark:text-amber-300">
                        ⚠ Onboarding incomplete — insights are partially estimated.
                    </div>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100 dark:border-white/10 px-5">
                {TABS.map((tab, i) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(i)}
                        className={`text-xs font-semibold pb-2 mr-5 border-b-2 transition-colors ${activeTab === i
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
                {loading ? (
                    <div className="space-y-3">
                        <SkeletonLine w="11/12" />
                        <SkeletonLine w="9/12" />
                        <SkeletonLine w="10/12" />
                        <SkeletonLine w="8/12" />
                    </div>
                ) : (
                    <>
                        {/* ── OVERVIEW TAB ── */}
                        {activeTab === 0 && (
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[13px]">
                                    {insight.summary}
                                </p>

                                {insight.today_action && (
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/10 border border-indigo-100 dark:border-indigo-800/30 p-3">
                                        <p className="text-[10px] uppercase tracking-widest text-indigo-500 dark:text-indigo-400 font-bold mb-1">Do this today</p>
                                        <p className="text-[13px] text-indigo-900 dark:text-indigo-100 font-medium leading-snug">
                                            {insight.today_action}
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1">Reflection</p>
                                    <p className="text-[13px] text-gray-700 dark:text-gray-300 italic leading-snug">
                                        "{insight.reflection_prompt}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                                    <span className={`w-1.5 h-1.5 rounded-full ${insight.source === "ai" ? "bg-emerald-400" : "bg-gray-400"}`} />
                                    {insight.source === "ai" ? "Powered by Gemini AI" : "Smart fallback · Complete onboarding for AI insights"}
                                </div>
                            </div>
                        )}

                        {/* ── THIS WEEK TAB ── */}
                        {activeTab === 1 && (
                            <div className="space-y-3">
                                {insight.priority_focus && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Week focus</span>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                                            {insight.priority_focus}
                                        </span>
                                    </div>
                                )}

                                {/* Week plan */}
                                {weekPlan.length > 0 && (
                                    <div className="space-y-2">
                                        {weekPlan.map((slot, i) => (
                                            <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2.5">
                                                <div className="flex-shrink-0 w-14 text-center">
                                                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">{slot.slot}</span>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{slot.hours}h</p>
                                                </div>
                                                <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug pt-0.5">{slot.focus}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action points */}
                                {actionPoints.length > 0 && (
                                    <>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mt-1">Action Points</p>
                                        <ul className="space-y-2">
                                            {actionPoints.map((point, i) => (
                                                <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700 dark:text-gray-300">
                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── PROFILE TAB ── */}
                        {activeTab === 2 && (
                            <div className="space-y-4">
                                {/* Strengths & Risks */}
                                <div className="grid grid-cols-2 gap-3">
                                    {strengths.length > 0 && (
                                        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 p-3">
                                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-2">Strengths</p>
                                            <ul className="space-y-1.5">
                                                {strengths.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
                                                        <span className="mt-1 text-emerald-400">✓</span>{s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {risks.length > 0 && (
                                        <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/20 p-3">
                                            <p className="text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold mb-2">Watch Out</p>
                                            <ul className="space-y-1.5">
                                                {risks.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-rose-800 dark:text-rose-200">
                                                        <span className="mt-1 text-rose-400">!</span>{r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Pros & Cons */}
                                <div className="grid grid-cols-2 gap-3">
                                    {pros.length > 0 && (
                                        <div className="rounded-2xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/20 p-3">
                                            <p className="text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold mb-2">Pros</p>
                                            <ul className="space-y-1.5">
                                                {pros.map((p, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-sky-800 dark:text-sky-200">
                                                        <span className="mt-1 text-sky-400">+</span>{p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {cons.length > 0 && (
                                        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 p-3">
                                            <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-2">Cons</p>
                                            <ul className="space-y-1.5">
                                                {cons.map((c, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-200">
                                                        <span className="mt-1 text-amber-400">−</span>{c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {strengths.length === 0 && risks.length === 0 && pros.length === 0 && (
                                    <p className="text-[12px] text-gray-400 dark:text-gray-500 text-center py-4">
                                        Complete onboarding to unlock your full profile analysis.
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/10">
                {!onboardingComplete && (
                    <button
                        onClick={() => navigate("/onboarding")}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Finish Onboarding
                    </button>
                )}
                <button
                    onClick={() => navigate("/assistant", { state: { initialMessage: `Give me a full execution strategy based on this: ${insight.summary}. Today I should: ${insight.today_action}` } })}
                    className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
                >
                    Ask AI Coach →
                </button>
            </div>
        </div>
    );
}
