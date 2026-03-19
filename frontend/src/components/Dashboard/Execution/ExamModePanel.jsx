import React, { useState } from 'react';

const ExamModePanel = ({ plan, loading, onGenerate }) => {
    const [syllabus, setSyllabus] = useState('');
    const [pattern, setPattern] = useState('');

    return (
        <div className="rounded-3xl border border-white/10 bg-[#111723] p-5 text-white">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exam Mode</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-rose-400/20 text-rose-100 border border-rose-300/30">Major Feature</span>
            </div>

            <div className="mt-4 grid gap-3">
                <textarea
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    className="min-h-[110px] rounded-xl border border-white/15 bg-black/25 p-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-300/50"
                    placeholder="Paste syllabus text or key topics"
                />
                <input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/25 p-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-300/50"
                    placeholder="Exam pattern (sections, marks, duration)"
                />
                <button
                    onClick={() => onGenerate({ syllabus_text: syllabus, exam_pattern: pattern })}
                    disabled={loading || !syllabus.trim()}
                    className="w-fit px-4 py-2 rounded-xl bg-cyan-300 text-[#052231] text-sm font-bold disabled:opacity-50"
                >
                    {loading ? 'Generating Plan...' : 'Generate Exam Plan'}
                </button>
            </div>

            {plan && (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Topics</p>
                        <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                            {(plan.topics || []).map((topic, idx) => (
                                <div key={`${topic.topic}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                                    <p className="text-sm font-medium">{topic.topic}</p>
                                    <p className="text-xs text-slate-300 mt-1">Priority: {topic.priority} · Status: {topic.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Revision Tracker</p>
                        <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                            {(plan.revision_schedule || []).map((item, idx) => (
                                <div key={`${item.day}-${idx}`} className="rounded-xl border border-cyan-300/20 bg-cyan-500/5 p-2.5">
                                    <p className="text-sm font-medium">{item.day}</p>
                                    <p className="text-xs text-slate-200 mt-1">{item.focus}</p>
                                    <p className="text-xs text-slate-400 mt-1">{item.duration}</p>
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
