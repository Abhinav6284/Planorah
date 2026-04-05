/**
 * PlanoraDashboard.jsx
 * Main landing page for the Planora study platform.
 * Shows all subjects with progress and quick actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planoraService } from '../../api/planoraService';

const ProgressRing = ({ pct, size = 48 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={4} className="stroke-indigo-100 dark:stroke-white/10 fill-none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={4}
        className="stroke-indigo-500/80 dark:stroke-white/80 fill-none transition-all duration-700"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
      />
    </svg>
  );
};

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white/60 dark:bg-charcoal/60 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900/90 dark:text-white/90 text-base truncate">{subject.name}</h3>
          {subject.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{subject.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ProgressRing pct={pct} />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300/80 dark:bg-white/20 inline-block" />
          {ps?.not_started || 0} not started
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400/80 inline-block shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
          {ps?.weak || 0} weak
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          {ps?.strong || 0} strong
        </span>
      </div>

      {daysLeft !== null && (
        <p className="text-xs font-medium text-gray-700/80 dark:text-gray-300/80">
          {daysLeft === 0 ? '🚨 Exam today!' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to exam`}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Link
          to={`/planora/subject/${subject.id}`}
          className="flex-1 text-center px-3 py-2 rounded-2xl bg-indigo-600/90 dark:bg-white/90 shadow-sm shadow-indigo-600/20 text-white dark:text-gray-900 text-xs font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-md"
        >
          Open
        </Link>
        <button
          onClick={() => onDelete(subject.id)}
          className="px-3 py-2 rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md text-xs text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 dark:hover:bg-red-500/20 transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white/80 dark:bg-charcoal/80 backdrop-blur-2xl backdrop-saturate-200 rounded-[2rem] p-8 shadow-2xl border border-white/50 dark:border-white/10"
      >
        <h2 className="text-xl font-bold text-gray-900/90 dark:text-white/90 mb-6">New Subject</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600/90 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Subject Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Data Structures"
              className="w-full px-4 py-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/80 dark:focus:bg-black/40 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600/90 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Optional short description"
              className="w-full px-4 py-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/80 dark:focus:bg-black/40 transition-all shadow-inner resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600/90 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Exam Date</label>
            <input
              type="date"
              value={form.exam_date}
              onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/80 dark:focus:bg-black/40 transition-all shadow-inner"
            />
          </div>
          {error && <p className="text-xs text-red-600/90">{error}</p>}
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-black/20 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-2xl bg-indigo-600/90 dark:bg-white/90 text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 shadow-lg shadow-indigo-600/20 backdrop-blur-md transition-all disabled:opacity-50">
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

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
      if (status === 404) {
        setError('The study platform service is temporarily unavailable. Please try again later.');
      } else if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load subjects. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    fetchSubjects();
  }, [fetchSubjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject and all its topics?')) return;
    await planoraService.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-charcoalDark dark:via-charcoal dark:to-charcoalDark transition-colors relative overflow-hidden">
      {/* Decorative background blurs for Apple-like glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300/30 dark:bg-indigo-900/20 blur-3xl rounded-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-300/30 dark:bg-cyan-900/20 blur-3xl rounded-full pointer-events-none hidden sm:block"></div>

      <div className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900/90 dark:text-white/90 tracking-tight">Study Platform</h1>
            <p className="text-sm text-gray-500/90 dark:text-gray-400 mt-0.5 font-medium">AI-powered exam preparation</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600/90 dark:bg-white/90 text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20 backdrop-blur-md flex items-center gap-2 hover:-translate-y-0.5 active:scale-95"
          >
            <span className="text-base leading-none">+</span> New Subject
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-3xl bg-white/40 dark:bg-charcoal/40 backdrop-blur-md border border-white/50 dark:border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white/40 dark:bg-charcoal/40 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 max-w-md mx-auto"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{error}</p>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600/90 dark:bg-white/90 shadow-lg shadow-indigo-600/20 backdrop-blur-md text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Retry
            </button>
          </motion.div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white/40 dark:bg-charcoal/40 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-indigo-100/50 dark:bg-charcoal/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900/90 dark:text-white/90 mb-2">No subjects yet</h2>
            <p className="text-sm text-gray-500/90 dark:text-gray-400 mb-8 max-w-xs font-medium">
              Create your first subject, upload your syllabus, and let AI build your study plan.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-2xl bg-indigo-600/90 dark:bg-white/90 text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20 backdrop-blur-md hover:-translate-y-0.5 active:scale-95"
            >
              Create First Subject
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
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
