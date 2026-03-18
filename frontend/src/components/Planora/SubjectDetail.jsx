/**
 * SubjectDetail.jsx
 * Shows full subject detail: topics, exam pattern editor, syllabus upload,
 * progress overview and navigation to notes/guide/planner.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planoraService } from '../../api/planoraService';

// ── Small helpers ────────────────────────────────────────────────────────────

const badge = (val, map) => {
  const cfg = map[val] || map._default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${cfg}`}>
      {val?.charAt(0).toUpperCase() + val?.slice(1).replace('_', ' ')}
    </span>
  );
};

const importanceMap = {
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  _default: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusMap = {
  not_started: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  weak: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  strong: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  _default: 'bg-gray-100 text-gray-600 border-gray-200',
};

const depthMap = {
  short: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  medium: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  long: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800',
  _default: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ── Topic Row ────────────────────────────────────────────────────────────────

const TopicRow = ({ topic, onProgressChange }) => {
  const [status, setStatus] = useState(topic.status);
  const [confidence, setConfidence] = useState(topic.confidence);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (newStatus, newConf) => {
    setSaving(true);
    try {
      await planoraService.updateTopicProgress(topic.id, { status: newStatus, confidence: newConf });
      onProgressChange();
    } finally {
      setSaving(false);
    }
  }, [topic.id, onProgressChange]);

  const cycleStatus = async () => {
    const next = { not_started: 'weak', weak: 'strong', strong: 'not_started' }[status];
    setStatus(next);
    await save(next, confidence);
  };

  const handleConfidence = async (e) => {
    const val = Number(e.target.value);
    setConfidence(val);
    await save(status, val);
  };

  return (
    <motion.div
      layout
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{topic.name}</span>
          {badge(topic.importance, importanceMap)}
          {badge(topic.depth, depthMap)}
        </div>
        {topic.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{topic.description}</p>
        )}
      </div>

      {/* Confidence slider */}
      <div className="hidden sm:flex items-center gap-2 w-28">
        <input
          type="range" min={0} max={100} value={confidence}
          onChange={handleConfidence}
          className="w-full accent-gray-900 dark:accent-white h-1 cursor-pointer"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{confidence}</span>
      </div>

      {/* Status toggle */}
      <button onClick={cycleStatus} disabled={saving} className="shrink-0">
        {badge(status, statusMap)}
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/planora/topic/${topic.id}/notes`}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Notes
        </Link>
        <Link
          to={`/planora/topic/${topic.id}/guide`}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Guide
        </Link>
      </div>
    </motion.div>
  );
};

// ── Syllabus Panel ───────────────────────────────────────────────────────────

const SyllabusPanel = ({ subject, onTopicsGenerated }) => {
  const [text, setText] = useState(subject.syllabus_text || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!text.trim() && !file) { setMessage('Add syllabus text or upload a file.'); return; }
    setUploading(true); setMessage('');
    try {
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        await planoraService.uploadSyllabus(subject.id, fd);
      } else {
        await planoraService.uploadSyllabus(subject.id, { syllabus_text: text });
      }
      setMessage('✓ Syllabus saved.');
    } catch {
      setMessage('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true); setMessage('🤖 AI is extracting topics…');
    try {
      const data = await planoraService.generateTopics(subject.id);
      onTopicsGenerated(data.topics || []);
      setMessage(`✓ ${(data.topics || []).length} topics generated.`);
    } catch {
      setMessage('Topic generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        📄 Syllabus
      </h3>
      <textarea
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste your syllabus here…"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none mb-3"
      />
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {file ? file.name : 'Upload PDF'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
      </div>
      {message && <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{message}</p>}
      <div className="flex items-center gap-2">
        <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
          {uploading ? 'Saving…' : 'Save Syllabus'}
        </button>
        <button onClick={handleGenerate} disabled={generating} className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
          {generating ? 'Generating…' : '🤖 Generate Topics'}
        </button>
      </div>
    </div>
  );
};

// ── Exam Pattern Panel ───────────────────────────────────────────────────────

const ExamPatternPanel = ({ subjectId, initial }) => {
  const [rows, setRows] = useState(
    initial?.marks_distribution?.length
      ? initial.marks_distribution
      : [{ marks: 2, count: 10, type: 'MCQ' }],
  );
  const [totalMarks, setTotalMarks] = useState(initial?.total_marks || 100);
  const [duration, setDuration] = useState(initial?.duration_minutes || 180);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const addRow = () => setRows(r => [...r, { marks: 5, count: 5, type: 'Short' }]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await planoraService.saveExamPattern(subjectId, {
        marks_distribution: rows,
        total_marks: Number(totalMarks),
        duration_minutes: Number(duration),
      });
      setMsg('✓ Exam pattern saved.');
    } catch {
      setMsg('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">📊 Exam Pattern</h3>
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
        <label className="flex items-center gap-2">
          Total marks
          <input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none" />
        </label>
        <label className="flex items-center gap-2">
          Duration (min)
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none" />
        </label>
      </div>
      <div className="space-y-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <input type="number" value={row.marks} onChange={e => updateRow(i, 'marks', e.target.value)} placeholder="Marks" className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" />
            <span className="text-gray-400">×</span>
            <input type="number" value={row.count} onChange={e => updateRow(i, 'count', e.target.value)} placeholder="Questions" className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" />
            <input type="text" value={row.type} onChange={e => updateRow(i, 'type', e.target.value)} placeholder="Type" className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" />
            <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>
          </div>
        ))}
      </div>
      {msg && <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{msg}</p>}
      <div className="flex items-center gap-2">
        <button onClick={addRow} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          + Row
        </button>
        <button onClick={save} disabled={saving} className="px-4 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('topics');

  const fetchSubject = useCallback(async () => {
    try {
      const data = await planoraService.getSubject(subjectId);
      setSubject(data);
      setTopics(data.topics || []);
    } catch {
      navigate('/planora');
    } finally {
      setLoading(false);
    }
  }, [subjectId, navigate]);

  useEffect(() => { fetchSubject(); }, [fetchSubject]);

  const handleTopicsGenerated = useCallback((newTopics) => {
    setTopics(newTopics);
    setTab('topics');
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!subject) return null;

  const ps = subject.progress_summary || {};
  const daysLeft = subject.exam_date
    ? Math.max(0, Math.ceil((new Date(subject.exam_date) - new Date()) / 86400000))
    : null;

  const tabs = [
    { id: 'topics', label: `Topics (${topics.length})` },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'exam-pattern', label: 'Exam Pattern' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back */}
        <Link to="/planora" className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          ← All Subjects
        </Link>

        {/* Subject Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{subject.name}</h1>
              {subject.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subject.description}</p>}
              {daysLeft !== null && (
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
                  {daysLeft === 0 ? '🚨 Exam today!' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to exam`}
                </p>
              )}
            </div>
            <Link
              to={`/planora/subject/${subject.id}/plan`}
              className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              📅 Study Plan
            </Link>
          </div>

          {/* Progress bar */}
          {ps.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{ps.strong || 0}/{ps.total} strong</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(((ps.strong || 0) / ps.total) * 100)}%` }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>⚪ {ps.not_started} not started</span>
                <span>🟡 {ps.weak} weak</span>
                <span>🟢 {ps.strong} strong</span>
                <span className="ml-auto">avg confidence: {ps.avg_confidence}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === 'topics' && (
            <motion.div key="topics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {topics.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <p className="text-gray-400 text-sm mb-3">No topics yet.</p>
                  <button onClick={() => setTab('syllabus')} className="text-xs text-gray-900 dark:text-white font-semibold underline underline-offset-2">
                    Upload syllabus to generate topics →
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Click status badge to cycle • Drag slider for confidence</p>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {topics.map(topic => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        onProgressChange={fetchSubject}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'syllabus' && (
            <motion.div key="syllabus" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <SyllabusPanel subject={subject} onTopicsGenerated={handleTopicsGenerated} />
            </motion.div>
          )}

          {tab === 'exam-pattern' && (
            <motion.div key="exam-pattern" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <ExamPatternPanel subjectId={subject.id} initial={subject.exam_pattern} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
