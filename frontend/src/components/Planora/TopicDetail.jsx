/**
 * TopicDetail.jsx
 * Renders AI-generated Notes or Study Guide for a topic.
 * Route: /planora/topic/:topicId/notes | /planora/topic/:topicId/guide
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planoraService } from '../../api/planoraService';

// ── Notes Renderer ───────────────────────────────────────────────────────────

const NotesView = ({ content }) => {
  if (!content) return null;
  const {
    definition, explanation, key_points = [], examples = [],
    formulas_or_diagrams, exam_tip, conclusion,
  } = content;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {definition && (
        <Section title="Definition">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white border-l-4 border-gray-900 dark:border-white">
            {definition}
          </div>
        </Section>
      )}
      {explanation && (
        <Section title="Explanation">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{explanation}</p>
        </Section>
      )}
      {key_points.length > 0 && (
        <Section title="Key Points">
          <ul className="space-y-1.5">
            {key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
                {pt}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {examples.length > 0 && (
        <Section title="Examples">
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                {ex.title && <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{ex.title}</p>}
                <p className="text-sm text-gray-700 dark:text-gray-300">{ex.content}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      {formulas_or_diagrams && (
        <Section title="Formulas / Diagrams">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">
            {formulas_or_diagrams}
          </div>
        </Section>
      )}
      {exam_tip && (
        <Section title="Exam Tip">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            💡 {exam_tip}
          </div>
        </Section>
      )}
      {conclusion && (
        <Section title="Conclusion">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{conclusion}</p>
        </Section>
      )}
    </div>
  );
};

// ── Study Guide Renderer ─────────────────────────────────────────────────────

const StudyGuideView = ({ content }) => {
  if (!content) return null;
  const {
    order_of_learning = [], key_focus_areas = [], common_mistakes = [],
    revision_strategy = {}, resources_tips = [], time_estimate,
  } = content;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      {time_estimate && (
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-300 mb-6">
          ⏱ Estimated time: <strong>{time_estimate}</strong>
        </div>
      )}
      {order_of_learning.length > 0 && (
        <Section title="Order of Learning">
          <div className="space-y-2">
            {order_of_learning.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step.step || i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{step.action}</p>
                  {step.duration && <p className="text-xs text-gray-400 mt-0.5">{step.duration}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {key_focus_areas.length > 0 && (
        <Section title="Key Focus Areas">
          <ul className="space-y-1.5">
            {key_focus_areas.map((area, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-900 dark:text-white">→</span> {area}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {common_mistakes.length > 0 && (
        <Section title="Common Mistakes">
          <div className="space-y-1.5">
            {common_mistakes.map((m, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-400">
                ⚠ {m}
              </div>
            ))}
          </div>
        </Section>
      )}
      {revision_strategy && Object.keys(revision_strategy).length > 0 && (
        <Section title="Revision Strategy">
          <div className="space-y-2">
            {Object.entries(revision_strategy).map(([key, val]) => (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{val}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      {resources_tips.length > 0 && (
        <Section title="Tips & Resources">
          <ul className="space-y-1.5">
            {resources_tips.map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span>✦</span> {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function TopicDetail() {
  const { topicId } = useParams();
  const location = useLocation();
  const isGuide = location.pathname.endsWith('/guide');

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await (isGuide
        ? planoraService.getStudyGuide(topicId)
        : planoraService.getNotes(topicId));
      setContent(res.content);
    } catch (err) {
      if (err?.response?.status === 404) {
        setContent(null); // not generated yet
      } else {
        setError('Failed to load content.');
      }
    } finally {
      setLoading(false);
    }
  }, [topicId, isGuide]);

  // Fetch topic info (name, subject)
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await (isGuide
        ? planoraService.generateStudyGuide(topicId)
        : planoraService.generateNotes(topicId));
      setContent(res.content);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const label = isGuide ? 'Study Guide' : 'Notes';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F5F7] dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          ← Back
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                {isGuide ? '📖 Study Guide' : '📝 AI Notes'}
              </p>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Topic #{topicId}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle between notes and guide */}
              <Link
                to={`/planora/topic/${topicId}/${isGuide ? 'notes' : 'guide'}`}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {isGuide ? 'View Notes' : 'View Guide'}
              </Link>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {generating ? '🤖 Generating…' : content ? `🔄 Regenerate ${label}` : `🤖 Generate ${label}`}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className={`h-4 bg-gray-100 dark:bg-gray-700 rounded ${i === 2 ? 'w-3/4' : 'w-full'}`} />)}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !content ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">{isGuide ? '📖' : '📝'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No {label.toLowerCase()} generated yet.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {generating ? `🤖 Generating ${label}…` : `Generate ${label} with AI`}
              </button>
            </div>
          ) : isGuide ? (
            <AnimatePresence mode="wait">
              <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <StudyGuideView content={content} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NotesView content={content} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
