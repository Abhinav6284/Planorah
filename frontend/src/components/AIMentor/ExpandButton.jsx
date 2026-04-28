import React from 'react';
import { Maximize2, Maximize, ExternalLink, X } from 'lucide-react';
import { useMentorStore } from '../../stores/mentorStore';

/**
 * ExpandButton - Cycles through expand modes
 * Icons: ☐ (default) → ▭ (larger) → ⛶ (fullscreen) → ↗ (newtab)
 */
const ExpandButton = () => {
  const expandMode = useMentorStore((state) => state.expandMode);
  const cycleExpandMode = useMentorStore((state) => state.cycleExpandMode);

  const modeIcons = {
    default: {
      icon: Maximize2,
      label: 'Expand',
      title: 'Default view (☐)',
    },
    larger: {
      icon: Maximize,
      label: 'Larger',
      title: 'Larger view (▭)',
    },
    fullscreen: {
      icon: X,
      label: 'Fullscreen',
      title: 'Fullscreen view (⛶)',
    },
    newtab: {
      icon: ExternalLink,
      label: 'New Tab',
      title: 'Open in new tab (↗)',
    },
  };

  const current = modeIcons[expandMode];
  const IconComponent = current.icon;

  return (
    <button
      onClick={cycleExpandMode}
      title={current.title}
      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      aria-label={current.label}
    >
      <IconComponent size={20} strokeWidth={1.5} />
    </button>
  );
};

export default ExpandButton;
