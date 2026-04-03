/**
 * StudyPlanner.jsx
 * AI-generated daily study plan for a subject.
 * Route: /planora/subject/:subjectId/plan
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planoraService } from '../../api/planoraService';

const SessionCard = ({ session }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-charcoalMuted500 mt-2 shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{session.topic_name}</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-charcoalMuted px-2 py-0.5 rounded-full">
          {session.duration_minutes} min
        </span>
      </div>
      {session.focus && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session.focus}</p>
      )}
    </div>
  </div>
);

const DayCard = ({ day, index }) => {
  const [open, setOpen] = useState(index === 0);
  const dateObj = new Date(day.date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const isToday = day.date === new Date().toISOString().split('T')[0];
  const totalMin = (day.sessions || []).reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-charcoal rounded-2xl border transition-colors ${isToday ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-charcoalMuted'} overflow-hidden`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {isToday && (
            <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${isToday ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {dateStr} {isToday && <span className="text-[10px] font-bold text-gray-400">(Today)</span>}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {(day.sessions || []).length} session{(day.sessions || []).length !== 1 ? 's' : ''} · {totalMin} min
            </p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-charcoalMuted divide-y divide-gray-50 dark:divide-charcoalMuted/50">
              {(day.sessions || []).map((s, i) => <SessionCard key={i} session={s} />)}
              {day.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 italic">{day.notes}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function StudyPlanner() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ exam_date: '', daily_hours: 2 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, planData] = await Promise.allSettled([
        planoraService.getSubject(subjectId),
        planoraService.getStudyPlan(subjectId),
      ]);
      if (sub.status === 'fulfilled') {
        setSubject(sub.value);
        setForm(f => ({ ...f, exam_date: sub.value.exam_date || '' }));
      }
      if (planData.status === 'fulfilled') {
        setPlan(planData.value);
      }
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.exam_date) { setError('Set an exam date first.'); return; }
    setGenerating(true); setError('');
    try {
      const data = await planoraService.generateStudyPlan(subjectId, {
        exam_date: form.exam_date,
        daily_hours: Number(form.daily_hours),
      });
      setPlan(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Plan generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-charcoalDark flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-charcoalDark transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link to={`/planora/subject/${subjectId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          ← {subject?.name || 'Subject'}
        </Link>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Study Plan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">AI-generated day-by-day schedule based on your topics.</p>

        {/* Generate form */}
        <form onSubmit={handleGenerate} className="bg-white dark:bg-charcoal rounded-2xl border border-gray-200 dark:border-charcoalMuted p-6 mb-8">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            {plan ? 'Regenerate Plan' : 'Generate Plan'}
          </h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Exam Date</label>
              <input
                type="date"
                value={form.exam_date}
                onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-charcoalMuted bg-gray-50 dark:bg-charcoalDark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Daily Hours</label>
              <select
                value={form.daily_hours}
                onChange={e => setForm(f => ({ ...f, daily_hours: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-charcoalMuted bg-gray-50 dark:bg-charcoalDark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              >
                {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map(h => (
                  <option key={h} value={h}>{h}h/day</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {generating ? '🤖 Generating…' : '🤖 Generate'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </form>

        {/* Plan */}
        {plan?.plan_data?.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {plan.plan_data.length} days · {plan.daily_hours}h/day
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {plan.plan_data.map((day, i) => (
                <DayCard key={day.date || i} day={day} index={i} />
              ))}
            </div>
          </div>
        ) : !generating && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Generate your personalized study plan above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
