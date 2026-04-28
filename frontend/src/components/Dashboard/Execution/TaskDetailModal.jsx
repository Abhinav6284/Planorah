import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, Target, Lightbulb, AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { executionService } from '../../../api/executionService';

const TaskDetailModal = ({ task, isOpen, onClose, onStartFocus }) => {
    const [guidance, setGuidance] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchGuidance = useCallback(async () => {
        if (!task?.id) return;

        setLoading(true);
        try {
            const data = await executionService.getTaskGuidance(task.id);
            setGuidance(data);
        } catch (error) {
            console.error('Failed to fetch guidance:', error);
            // Set fallback guidance
            setGuidance({
                objective: task.description || task.title,
                time_breakdown: [
                    { duration: '5 min', activity: 'Review task requirements' },
                    { duration: `${task.estimated_minutes || 20} min`, activity: 'Execute focused work' },
                    { duration: '5 min', activity: 'Review and document' }
                ],
                steps: [
                    { step: 1, title: 'Understand the objective', description: 'Review what needs to be accomplished' },
                    { step: 2, title: 'Gather resources', description: 'Prepare necessary materials and tools' },
                    { step: 3, title: 'Execute', description: 'Complete the main work' },
                    { step: 4, title: 'Validate', description: 'Review your work before marking complete' }
                ],
                best_practices: ['Focus on one task at a time', 'Take short breaks if needed'],
                common_mistakes: ['Starting without clear objectives', 'Multitasking'],
                quick_tips: ['Set a timer', 'Eliminate distractions', 'Have water nearby']
            });
        } finally {
            setLoading(false);
        }
    }, [task]);

    useEffect(() => {
        if (isOpen && task?.id) {
            fetchGuidance();
        }
    }, [isOpen, task?.id, fetchGuidance]);

    const handleStartFocusFromModal = () => {
        onStartFocus(task);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative', zIndex: 101, width: '100%', maxWidth: 720, maxHeight: '90vh',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 16,
                            background: 'var(--el-bg)', border: '1px solid var(--el-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            padding: '24px 32px', borderBottom: '1px solid var(--el-border-subtle)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, 
                                        textTransform: 'uppercase', background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)' 
                                    }}>
                                        {task?.task_type === 'exam' ? 'Exam' : 'Learning'}
                                    </span>
                                    {task?.estimated_minutes && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--el-text-muted)' }}>
                                            <Clock style={{ width: 12, height: 12 }} />
                                            {task.estimated_minutes} min
                                        </div>
                                    )}
                                </div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    {task?.title}
                                </h2>
                                {task?.description && (
                                    <p style={{ marginTop: 8, fontSize: 14, color: 'var(--el-text-muted)', lineHeight: 1.5 }}>
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                style={{ 
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-text-muted)', transition: 'all 0.1s'
                                }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ overflowY: 'auto', padding: '32px', flex: 1 }}>
                            {loading ? (
                                <div style={{ padding: '64px 0', textAlign: 'center' }}>
                                    <Loader2 style={{ width: 32, height: 32, margin: '0 auto', color: 'var(--el-text)', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ marginTop: 16, fontSize: 13, fontWeight: 500, color: 'var(--el-text-muted)' }}>Preparing guide...</p>
                                </div>
                            ) : guidance ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                                    {/* Objective */}
                                    <div>
                                        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Objective</h3>
                                        <div style={{ padding: 20, borderRadius: 12, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                                            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--el-text-secondary)' }}>
                                                {guidance.objective}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time Breakdown */}
                                    {guidance.time_breakdown && guidance.time_breakdown.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 16 }}>Time Allocation</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {guidance.time_breakdown.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                                                            borderRadius: 12, border: '1px solid var(--el-border-subtle)', background: 'var(--el-bg)'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--el-text)', minWidth: 60 }}>
                                                            {item.duration}
                                                        </span>
                                                        <span style={{ fontSize: 13, color: 'var(--el-text-secondary)' }}>
                                                            {item.activity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step-by-Step Guide */}
                                    {guidance.steps && guidance.steps.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 20 }}>Process</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                {guidance.steps.map((step) => (
                                                    <div
                                                        key={step.step}
                                                        style={{ display: 'flex', gap: 16 }}
                                                    >
                                                        <div style={{ 
                                                            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'var(--el-text)', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2
                                                        }}>
                                                            {step.step}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', marginBottom: 4 }}>
                                                                {step.title}
                                                            </h4>
                                                            <p style={{ fontSize: 13, color: 'var(--el-text-muted)', lineHeight: 1.5 }}>
                                                                {step.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Related Resources */}
                                    {task?.related_links && task.related_links.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 16 }}>Resources</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {task.related_links.map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                                                            borderRadius: 12, border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)',
                                                            textDecoration: 'none', fontSize: 13, color: 'var(--el-text)', transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        <ExternalLink style={{ width: 14, height: 14 }} />
                                                        {link.title || link.url}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--el-text-muted)' }}>
                                    No detailed guide found for this task.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ 
                            padding: '20px 32px', borderTop: '1px solid var(--el-border-subtle)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <button
                                onClick={onClose}
                                style={{ 
                                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                    background: 'var(--el-bg)', border: '1px solid var(--el-border)', color: 'var(--el-text-secondary)', cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleStartFocusFromModal}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', 
                                    borderRadius: 10, background: 'var(--el-text)', color: '#fff', 
                                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer'
                                }}
                            >
                                <Play style={{ width: 14, height: 14, fill: 'currentColor' }} />
                                Start Session
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailModal;
