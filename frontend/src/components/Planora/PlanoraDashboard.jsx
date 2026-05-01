import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planoraService } from '../../api/planoraService';

/* ─── Progress ring ─────────────────────────────────────────────────────── */
const ProgressRing = ({ pct, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3} className="stroke-gray-100 dark:stroke-white/8 fill-none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={3}
        className="stroke-terracotta fill-none transition-all duration-700"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
      />
    </svg>
  );
};

/* ─── Subject card ───────────────────────────────────────────────────────── */
const SubjectCard = ({ subject, onDelete }) => {
  const { progress_summary: ps } = subject;
  const totalStudied = (ps?.weak || 0) + (ps?.strong || 0);
  const pct = ps?.total ? Math.round((totalStudied / ps.total) * 100) : 0;
  const daysLeft = subject.exam_date
    ? Math.max(0, Math.ceil((new Date(subject.exam_date) - new Date()) / 86400000))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200 flex flex-col gap-4"
      style={{ background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-textPrimary dark:text-white text-[15px] truncate">{subject.name}</h3>
          {subject.description && (
            <p className="text-xs text-textSecondary dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <ProgressRing pct={pct} />
          <span className="text-[10px] font-semibold text-terracotta">{pct}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-textSecondary dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
          {ps?.not_started || 0} not started
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/8 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {ps?.weak || 0} weak
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/8 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {ps?.strong || 0} strong
        </span>
      </div>

      {/* Exam countdown */}
      {daysLeft !== null && (
        <p className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl w-fit ${daysLeft === 0
            ? 'bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400'
            : daysLeft <= 3
              ? 'bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400'
              : 'bg-gray-50 dark:bg-white/5 text-textSecondary dark:text-gray-400'
          }`}>
          {daysLeft === 0 ? '🚨 Exam today!' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to exam`}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 mt-auto">
        <Link
          to={`/planora/subject/${subject.id}`}
          className="flex-1 text-center px-3 py-2 rounded-xl bg-terracotta hover:bg-terracottaHover text-white text-xs font-semibold transition-colors duration-150"
        >
          Open
        </Link>
        <button
          onClick={() => onDelete(subject.id)}
          className="px-3 py-2 rounded-xl border border-borderMuted dark:border-white/8 text-xs text-textSecondary dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-150"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

/* ─── New subject modal ──────────────────────────────────────────────────── */
const NewSubjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', exam_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Subject name is required.'); return; }
    setLoading(true);
    try {
      const subject = await planoraService.createSubject({
        name: form.name.trim(),
        description: form.description.trim(),
        exam_date: form.exam_date || null,
      });
      onCreate(subject);
      onClose();
    } catch {
      setError('Failed to create subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="w-full max-w-md bg-white dark:bg-charcoal rounded-2xl p-7 shadow-2xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.55)] border border-borderMuted dark:border-white/8"
      >
        <h2 className="text-lg font-bold text-textPrimary dark:text-white mb-6">New Subject</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary dark:text-gray-400 mb-1.5 uppercase tracking-wider">Subject Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Data Structures"
              className="w-full px-4 py-2.5 rounded-xl border border-borderMuted dark:border-white/10 bg-beigeSecondary/50 dark:bg-black/20 text-sm text-textPrimary dark:text-white placeholder:text-textSecondary/60 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta/25 dark:focus:ring-terracotta/30 focus:border-terracotta/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-textSecondary dark:text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Optional short description"
              className="w-full px-4 py-2.5 rounded-xl border border-borderMuted dark:border-white/10 bg-beigeSecondary/50 dark:bg-black/20 text-sm text-textPrimary dark:text-white placeholder:text-textSecondary/60 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta/25 dark:focus:ring-terracotta/30 focus:border-terracotta/40 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-textSecondary dark:text-gray-400 mb-1.5 uppercase tracking-wider">Exam Date</label>
            <input
              type="date"
              value={form.exam_date}
              onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-borderMuted dark:border-white/10 bg-beigeSecondary/50 dark:bg-black/20 text-sm text-textPrimary dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta/25 focus:border-terracotta/40 transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-borderMuted dark:border-white/8 text-sm text-textSecondary dark:text-gray-400 font-medium hover:bg-beigeSecondary dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracottaHover text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function PlanoraDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await planoraService.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setError('The study platform service is temporarily unavailable. Please try again later.');
      else if (status === 401) setError('Your session has expired. Please log in again.');
      else setError('Failed to load subjects. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleRetry = useCallback(() => { setLoading(true); setError(''); fetchSubjects(); }, [fetchSubjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject and all its topics?')) return;
    await planoraService.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--el-bg)' }}>
      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-textPrimary dark:text-white tracking-tight">Study Platform</h1>
            <p className="text-sm text-textSecondary dark:text-gray-400 mt-0.5">AI-powered exam preparation</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracottaHover text-white text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-base leading-none">+</span> New Subject
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-white dark:bg-charcoal border border-borderMuted dark:border-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl shadow-sm p-8 max-w-sm mx-auto"
            style={{ background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}
          >
            <span className="text-4xl mb-4">⚠️</span>
            <h2 className="text-base font-semibold text-textPrimary dark:text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-textSecondary dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracottaHover text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && subjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl shadow-sm p-10 max-w-sm mx-auto"
            style={{ background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}
          >
            <div className="w-16 h-16 bg-beigeSecondary dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-borderMuted dark:border-white/8">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-lg font-bold text-textPrimary dark:text-white mb-2">No subjects yet</h2>
            <p className="text-sm text-textSecondary dark:text-gray-400 mb-7 max-w-[240px] leading-relaxed">
              Create your first subject, upload your syllabus, and let AI build your study plan.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracottaHover text-white text-sm font-semibold transition-colors"
            >
              Create First Subject
            </button>
          </motion.div>
        )}

        {/* Subject grid */}
        {!loading && !error && subjects.length > 0 && (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {subjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <NewSubjectModal
            onClose={() => setShowModal(false)}
            onCreate={s => setSubjects(prev => [s, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
