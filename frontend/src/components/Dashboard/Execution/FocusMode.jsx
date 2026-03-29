import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { executionService } from '../../../api/executionService';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundToNearestFive = (value) => Math.max(5, Math.round(value / 5) * 5);

const parseMinutes = (value) => {
    const match = String(value || '').match(/(\d{1,3})/);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getProjectMinutes = (task) => {
    const direct = Number(task?.estimated_minutes);
    if (Number.isFinite(direct) && direct > 0) {
        return clamp(Math.round(direct), 5, 180);
    }

    const fromLabel = parseMinutes(task?.estimated_time);
    if (fromLabel) {
        return clamp(fromLabel, 5, 180);
    }

    return 25;
};

const resolveGuidanceTaskId = (task) => {
    const metadata = task?.metadata || {};
    return (
        task?.guidance_task_id ||
        metadata?.guidance_task_id ||
        metadata?.source_task_id ||
        metadata?.task_id ||
        task?.source_task_id ||
        task?.id ||
        null
    );
};

const buildFallbackGuidance = (task, sessionMinutes) => {
    const safeMinutes = clamp(sessionMinutes || 25, 5, 180);
    const setupMinutes = Math.max(5, Math.round(safeMinutes * 0.15));
    const wrapMinutes = Math.max(5, Math.round(safeMinutes * 0.15));
    const executeMinutes = Math.max(10, safeMinutes - setupMinutes - wrapMinutes);
    const missionText = task?.reason || task?.description || `Complete "${task?.title || 'this mission'}".`;

    return {
        objective: missionText,
        time_breakdown: [
            { duration: `${setupMinutes} min`, activity: 'Clarify objective and open required resources' },
            { duration: `${executeMinutes} min`, activity: 'Work on the main deliverable without context switching' },
            { duration: `${wrapMinutes} min`, activity: 'Validate output and capture your next step' },
        ],
        steps: [
            { step: 1, title: 'Define done', description: missionText },
            { step: 2, title: 'Focus execution', description: 'Ship one concrete output in this session.' },
            { step: 3, title: 'Validate', description: 'Check the output against expected quality before ending.' },
            { step: 4, title: 'Log next action', description: 'Write your immediate follow-up to continue momentum.' },
        ],
        quick_tips: [
            'Keep only the tools required for this mission open.',
            'Use the checklist to avoid ending the session without a concrete output.',
            'Capture blockers quickly and continue with the highest-impact subtask.',
        ],
    };
};

const buildDurationOptions = (projectMinutes) => {
    const base = clamp(roundToNearestFive(projectMinutes), 5, 180);
    const stretchRaw = base <= 30 ? base * 2 : base + 15;
    const stretch = clamp(roundToNearestFive(stretchRaw), base + 5, 180);
    return Array.from(new Set([base, stretch]));
};

const FocusMode = ({ open, task, onClose, onComplete, embedded = false }) => {
    const projectMinutes = getProjectMinutes(task);
    const guidanceTaskId = resolveGuidanceTaskId(task);
    const durationOptions = useMemo(() => buildDurationOptions(projectMinutes), [projectMinutes]);
    const fallbackGuidance = useMemo(() => buildFallbackGuidance(task, projectMinutes), [task, projectMinutes]);

    const [duration, setDuration] = useState(projectMinutes);
    const [secondsLeft, setSecondsLeft] = useState(projectMinutes * 60);
    const [guidance, setGuidance] = useState(null);
    const [guidanceLoading, setGuidanceLoading] = useState(false);
    const [completedSteps, setCompletedSteps] = useState({});

    const totalSeconds = useMemo(() => duration * 60, [duration]);
    const steps = useMemo(() => (Array.isArray(guidance?.steps) ? guidance.steps : []), [guidance?.steps]);
    const stepCompletion = useMemo(() => {
        return steps.reduce((count, step, index) => {
            const stepKey = String(step?.step ?? index + 1);
            return completedSteps[stepKey] ? count + 1 : count;
        }, 0);
    }, [steps, completedSteps]);

    useEffect(() => {
        if (!open) return;
        setSecondsLeft(duration * 60);
    }, [open, duration]);

    useEffect(() => {
        if (!open) return;
        setDuration(projectMinutes);
        setCompletedSteps({});
    }, [open, projectMinutes, task?.id]);

    useEffect(() => {
        if (!open) return;
        if (!guidanceTaskId) {
            setGuidance(fallbackGuidance);
            setGuidanceLoading(false);
            return;
        }

        let isActive = true;
        setGuidanceLoading(true);

        executionService.getTaskGuidance(guidanceTaskId)
            .then((data) => {
                if (!isActive) return;
                setGuidance(data || fallbackGuidance);
            })
            .catch(() => {
                if (!isActive) return;
                setGuidance(fallbackGuidance);
            })
            .finally(() => {
                if (!isActive) return;
                setGuidanceLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [open, guidanceTaskId, fallbackGuidance]);

    useEffect(() => {
        if (!open || secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [open, secondsLeft]);

    useEffect(() => {
        if (open && secondsLeft === 0) {
            onComplete(duration);
        }
    }, [open, secondsLeft, duration, onComplete]);

    if (!open) return null;

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100));
    const guidanceTips = guidance?.quick_tips?.length ? guidance.quick_tips : guidance?.best_practices || [];

    const panel = (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Execution State</p>
                    <h3 className="text-xl font-semibold text-white">Focus Mode Active</h3>
                </div>
                <button onClick={onClose} className="text-sm text-slate-300 hover:text-white">End Session</button>
            </div>

            <p className="text-sm text-slate-300">Current Mission</p>
            <p className="mt-1 text-lg font-medium text-white">{task?.title || 'Deep work session'}</p>
            <p className="mt-1 text-xs text-slate-400">Project estimate: {projectMinutes} min</p>

            <div className="mt-5 flex gap-2">
                {durationOptions.map((option, index) => (
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        key={option}
                        onClick={() => setDuration(option)}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${duration === option
                            ? 'border-white/40 bg-white text-black'
                            : 'border-white/20 text-slate-200 hover:bg-white/10'
                            }`}
                    >
                        {option} min{index === 0 ? ' (project)' : ''}
                    </motion.button>
                ))}
            </div>

            <div className="mt-6">
                <div className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{minutes}:{seconds}</div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-gradient-to-r from-white to-slate-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-blue-300">●</span>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Mission Guidance</h4>
                    </div>

                    {guidanceLoading ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                            Loading guidance...
                        </div>
                    ) : (
                        <>
                            <p className="text-sm leading-relaxed text-slate-200">
                                {guidance?.objective || task?.reason || 'Complete this mission with one concrete, validated output.'}
                            </p>
                            {Array.isArray(guidance?.time_breakdown) && guidance.time_breakdown.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <span>⏱</span> Session Plan
                                    </p>
                                    {guidance.time_breakdown.slice(0, 3).map((item, index) => (
                                        <div key={`${item.duration}-${index}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
                                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                                {item.duration}
                                            </span>
                                            <span className="text-xs text-slate-300">{item.activity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                            <span className="text-sm text-emerald-300">✓</span>
                            Task Checklist
                        </h4>
                        <span className="text-xs text-slate-400">{stepCompletion}/{steps.length}</span>
                    </div>

                    {guidanceLoading ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                            Preparing checklist...
                        </div>
                    ) : steps.length > 0 ? (
                        <div className="space-y-2">
                            {steps.slice(0, 4).map((step, index) => {
                                const stepKey = String(step?.step ?? index + 1);
                                const done = Boolean(completedSteps[stepKey]);
                                return (
                                    <button
                                        key={stepKey}
                                        type="button"
                                        onClick={() => setCompletedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${done
                                            ? 'border-emerald-400/40 bg-emerald-400/10'
                                            : 'border-white/10 bg-black/20 hover:bg-black/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className={`pt-0.5 text-xs ${done ? 'text-emerald-300' : 'text-slate-500'}`}>
                                                {done ? '✔' : '○'}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-white">{step.title || `Step ${index + 1}`}</span>
                                                {step.description && (
                                                    <span className="mt-0.5 block text-xs text-slate-400">{step.description}</span>
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No step guide available for this mission yet.</p>
                    )}

                    {guidanceTips.length > 0 && (
                        <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200">Quick Tip</p>
                            <p className="mt-1 text-xs text-amber-100">{guidanceTips[0]}</p>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">Distraction controls are active. Follow the checklist and finish one validated output.</p>
        </>
    );

    if (embedded) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mx-auto max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0f0f10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
                {panel}
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0f0f10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
                {panel}
            </motion.div>
        </div>
    );
};

export default FocusMode;
