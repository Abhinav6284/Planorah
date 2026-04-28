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
                    style={{
                        minHeight: 120, borderRadius: 12, border: '1px solid var(--el-border)', 
                        background: 'var(--el-bg-secondary)', color: 'var(--el-text)', padding: 16, 
                        fontSize: 14, resize: 'none', outline: 'none'
                    }}
                    placeholder="Input syllabus or key topics..."
                />
                <input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    style={{
                        borderRadius: 12, border: '1px solid var(--el-border)', 
                        background: 'var(--el-bg-secondary)', color: 'var(--el-text)', padding: '12px 16px', 
                        fontSize: 14, outline: 'none'
                    }}
                    placeholder="Exam pattern (sections, duration, marks)"
                />
                <button
                    onClick={() => onGenerate({ syllabus_text: syllabus, exam_pattern: pattern })}
                    disabled={loading || !syllabus.trim()}
                    style={{
                        width: 'fit-content', padding: '10px 24px', borderRadius: 10, 
                        background: 'var(--el-text)', color: '#fff', fontSize: 13, fontWeight: 700, 
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
                                <div key={idx} style={{ 
                                    padding: 16, borderRadius: 12, border: '1px solid var(--el-border-subtle)',
                                    background: 'var(--el-bg-secondary)'
                                }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', marginBottom: 4 }}>{topic.topic}</p>
                                    <p style={{ fontSize: 12, color: 'var(--el-text-muted)' }}>Priority: {topic.priority} · {topic.status}</p>
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
