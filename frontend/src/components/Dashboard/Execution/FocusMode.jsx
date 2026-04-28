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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ 
                            width: 8, height: 8, borderRadius: '50%', background: '#ef4444', 
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' 
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>Focus Session Active</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {task?.title || 'Execution'}
                    </h2>
                </div>
                <button 
                    onClick={onClose} 
                    style={{ 
                        padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'var(--el-bg)', border: '1px solid var(--el-border)', 
                        color: 'var(--el-text-secondary)', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    End Session
                </button>
            </div>

            {/* Timer Area */}
            <div style={{ padding: 40, borderRadius: 20, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: 80, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 24 }}>
                    {minutes}<span style={{ opacity: 0.3 }}>:</span>{seconds}
                </div>
                
                <div style={{ height: 6, width: '100%', maxWidth: 400, margin: '0 auto', background: 'var(--el-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--el-text)', transition: 'width 1s linear' }} />
                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12 }}>
                    {durationOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setDuration(option)}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.1s',
                                background: duration === option ? 'var(--el-text)' : 'var(--el-bg)',
                                color: duration === option ? '#fff' : 'var(--el-text-secondary)',
                                border: duration === option ? 'none' : '1px solid var(--el-border)'
                            }}
                        >
                            {option}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {/* Guidance */}
                <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)' }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 16 }}>Guidance</h4>
                    
                    {guidanceLoading ? (
                        <p style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>Fetching strategic advice...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--el-text)', lineHeight: 1.5 }}>
                                {guidance?.objective || task?.reason}
                            </p>
                            
                            {guidance?.time_breakdown?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {guidance.time_breakdown.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--el-text)', minWidth: 40 }}>{item.duration}</span>
                                            <span style={{ fontSize: 13, color: 'var(--el-text-secondary)' }}>{item.activity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Checklist */}
                <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)' }}>Checklist</h4>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--el-text)' }}>{stepCompletion}/{steps.length}</span>
                    </div>

                    {guidanceLoading ? (
                        <p style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>Preparing steps...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {steps.map((step, index) => {
                                const stepKey = String(step?.step ?? index + 1);
                                const done = Boolean(completedSteps[stepKey]);
                                return (
                                    <button
                                        key={stepKey}
                                        onClick={() => setCompletedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                                            cursor: 'pointer', transition: 'all 0.1s', border: '1px solid var(--el-border-subtle)',
                                            background: done ? 'var(--el-bg-secondary)' : 'var(--el-bg)',
                                            opacity: done ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <div style={{ 
                                                width: 18, height: 18, borderRadius: 4, border: '2px solid var(--el-text)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                background: done ? 'var(--el-text)' : 'transparent', marginTop: 2, flexShrink: 0
                                            }}>
                                                {done && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', textDecoration: done ? 'line-through' : 'none' }}>{step.title}</p>
                                                {step.description && !done && <p style={{ fontSize: 12, color: 'var(--el-text-muted)', marginTop: 2 }}>{step.description}</p>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {guidanceTips.length > 0 && (
                        <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'var(--el-bg-secondary)', borderLeft: '4px solid var(--el-text)' }}>
                            <p style={{ fontSize: 12, color: 'var(--el-text)', fontWeight: 700 }}>Pro Tip</p>
                            <p style={{ fontSize: 13, color: 'var(--el-text-secondary)', marginTop: 4 }}>{guidanceTips[0]}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (embedded) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                    width: '100%', maxWidth: 900, margin: '0 auto', 
                    padding: 32, borderRadius: 24, background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                    boxShadow: 'var(--el-shadow-card)'
                }}
            >
                {panel}
            </motion.div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: 16 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto',
                    padding: 40, borderRadius: 24, background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.3)'
                }}
            >
                {panel}
            </motion.div>
        </div>
    );
};

export default FocusMode;
