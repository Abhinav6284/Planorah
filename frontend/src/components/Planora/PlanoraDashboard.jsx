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
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={4} className="stroke-gray-200 dark:stroke-gray-700 fill-none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={4}
        className="stroke-gray-900 dark:stroke-white fill-none transition-all duration-700"
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
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{subject.name}</h3>
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
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
          {ps?.not_started || 0} not started
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          {ps?.weak || 0} weak
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {ps?.strong || 0} strong
        </span>
      </div>

      {daysLeft !== null && (
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {daysLeft === 0 ? '🚨 Exam today!' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to exam`}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Link
          to={`/planora/subject/${subject.id}`}
          className="flex-1 text-center px-3 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-80 transition-opacity"
        >
          Open
        </Link>
        <button
          onClick={() => onDelete(subject.id)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Subject</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Data Structures"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Optional short description"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Exam Date</label>
            <input
              type="date"
              value={form.exam_date}
              onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
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
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Study Platform</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AI-powered exam preparation</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span> New Subject
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{error}</p>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </motion.div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No subjects yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Create your first subject, upload your syllabus, and let AI build your study plan.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              Create First Subject
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
