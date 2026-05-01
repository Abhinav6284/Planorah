import React, { useState } from 'react';

const ExamModePanel = ({ plan, loading, onGenerate }) => {
    const [syllabus, setSyllabus] = useState('');
    const [pattern, setPattern] = useState('');

    return (
    return (
        <div style={{ 
            borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', 
            padding: 32, boxShadow: 'var(--el-shadow-card)', color: 'var(--el-text)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em' }}>Exam Mode</h3>
                    <p style={{ fontSize: 13, color: 'var(--el-text-muted)', marginTop: 4 }}>Structured planning for high-stakes evaluations.</p>
                </div>
                <span style={{ 
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', 
                    borderRadius: 20, background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)', border: '1px solid var(--el-border-subtle)'
                }}>Advanced</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <textarea
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    className="min-h-[110px] rounded-xl border border-gray-400 bg-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Paste syllabus text or key topics"
                />
                <input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="rounded-xl border border-gray-400 bg-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Exam pattern (sections, marks, duration)"
                />
                <button
                    onClick={() => onGenerate({ syllabus_text: syllabus, exam_pattern: pattern })}
                    disabled={loading || !syllabus.trim()}
                    style={{
                        width: 'fit-content', padding: '10px 24px', borderRadius: 10, 
                        background: 'var(--el-text)', color: 'var(--el-bg)', fontSize: 13, fontWeight: 700,
                        border: 'none', cursor: 'pointer', opacity: loading || !syllabus.trim() ? 0.5 : 1,
                        transition: 'all 0.1s'
                    }}
                >
                    {loading ? 'Analyzing...' : 'Generate Roadmap'}
                </button>
            </div>

            {plan && (
                <div style={{ marginTop: 32, display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <div>
                        <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 12 }}>Identified Topics</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                            {(plan.topics || []).map((topic, idx) => (
                                <div key={`${topic.topic}-${idx}`} className="rounded-xl border border-gray-300 bg-gray-100 p-2.5 dark:border-gray-600 dark:bg-gray-800">
                                    <p className="text-sm font-medium">{topic.topic}</p>
                                    <p className="text-xs text-slate-300 mt-1">Priority: {topic.priority} · Status: {topic.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 12 }}>Revision Schedule</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                            {(plan.revision_schedule || []).map((item, idx) => (
                                <div key={idx} style={{ 
                                    padding: 16, borderRadius: 12, border: '1px solid var(--el-border-subtle)',
                                    background: 'var(--el-bg)'
                                }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', marginBottom: 4 }}>{item.day}</p>
                                    <p style={{ fontSize: 13, color: 'var(--el-text-secondary)' }}>{item.focus}</p>
                                    <p style={{ fontSize: 12, color: 'var(--el-text-muted)', marginTop: 4 }}>Duration: {item.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamModePanel;
