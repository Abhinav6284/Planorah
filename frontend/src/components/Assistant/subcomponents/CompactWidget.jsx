import React from 'react';
import styles from '../UnifiedAIAssistant.module.css';

export default function CompactWidget({ isExpanded, onToggle }) {
  if (isExpanded) return null; // Hide when expanded

  return (
    <button
      className={styles.compactWidget}
      onClick={onToggle}
      aria-label="Open AI Assistant"
      title="Click to open AI Assistant"
    >
      <span style={{ fontSize: '24px' }}>💬</span>
    </button>
  );
}
