import React from 'react';
import { useMentorStore } from '../../stores/mentorStore';

/**
 * QuickActions - 2 context-aware action buttons
 * Changes based on currentContext (dashboard, roadmap, notes, progress, settings)
 */
const QUICK_ACTIONS = {
  dashboard: [
    { emoji: '⚡', label: 'What should I focus on today?' },
    { emoji: '📊', label: 'Analyze my progress' },
  ],
  roadmap: [
    { emoji: '📊', label: 'Show my progress' },
    { emoji: '⏭️', label: 'What should I study next?' },
  ],
  notes: [
    { emoji: '✍️', label: 'Summarize my notes' },
    { emoji: '🔍', label: "What's missing?" },
  ],
  progress: [
    { emoji: '📈', label: 'How am I doing?' },
    { emoji: '💡', label: 'Suggest improvements' },
  ],
  settings: [
    { emoji: '⚙️', label: 'Help with settings' },
    { emoji: '📤', label: 'Export my data' },
  ],
};

const QuickActions = ({ onActionSelect }) => {
  const currentContext = useMentorStore((state) => state.currentContext);

  const actions = QUICK_ACTIONS[currentContext] || QUICK_ACTIONS.dashboard;

  const handleActionClick = (action) => {
    // Append to input for user confirmation, or could auto-send
    if (onActionSelect) {
      onActionSelect(action.label);
    }
  };

  return (
    <div className="px-4 py-3 space-y-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => handleActionClick(action)}
          className="w-full px-3 py-2 text-sm text-left rounded-lg bg-white dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        >
          <span className="mr-2">{action.emoji}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
