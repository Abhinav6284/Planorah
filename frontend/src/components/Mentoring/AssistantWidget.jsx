// frontend/src/components/Mentoring/AssistantWidget.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { assistantPipelineService } from '../../api/assistantPipelineService';

/**
 * Inline assistant widget — embeds at the top of key pages.
 * Props:
 *   contextSource  — string: 'dashboard' | 'tasks' | 'resume' | 'roadmap' | 'interview' | etc.
 *   onOpenPanel    — optional function: opens the full AI chat panel
 */
export default function AssistantWidget({ contextSource = 'general', onOpenPanel }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    assistantPipelineService.getSuggestions(contextSource)
      .then((data) => { if (!cancelled) setSuggestions(data); })
      .catch(() => { if (!cancelled) setSuggestions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [contextSource]);

  const handleAction = (suggestion) => {
    if (suggestion.action_type === 'navigate' && suggestion.action_target) {
      navigate(suggestion.action_target);
    } else if (suggestion.action_type === 'open_panel') {
      onOpenPanel?.();
    }
  };

  if (!loading && suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-5 rounded-2xl border border-white/[0.08] bg-[#0f1117]/80 backdrop-blur-md p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
                <Sparkles size={12} className="text-white/70" />
              </div>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Assistant</span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-1"
              aria-label="Dismiss assistant suggestions"
            >
              ✕
            </button>
          </div>

          {/* Suggestions */}
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={12} />
              </motion.div>
              <span>Checking your progress...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <div
                  key={s.text || i}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/[0.08] transition-colors"
                >
                  <span className="text-sm text-white/80 leading-snug flex-1">{s.text}</span>
                  {s.action_label && (
                    <button
                      onClick={() => handleAction(s)}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap shrink-0"
                    >
                      {s.action_label}
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => onOpenPanel?.()}
                className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors mt-1 self-start"
              >
                <ArrowRight size={11} />
                Ask me anything
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
