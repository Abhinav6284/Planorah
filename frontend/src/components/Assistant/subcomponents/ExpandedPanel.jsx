import React from 'react';
import styles from '../UnifiedAIAssistant.module.css';

export default function ExpandedPanel({
  isExpanded,
  mode,
  onModeChange,
  onClose,
  children,
  isDarkMode = false,
  isCollapsing = false,
}) {
  if (!isExpanded) return null;

  return (
    <div
      className={`${styles.expandedPanel} ${isCollapsing ? styles.collapsing : ''} ${
        isDarkMode ? styles.dark : ''
      }`}
      role="dialog"
      aria-label="AI Assistant"
    >
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.headerIcon}>
            {mode === 'voice' ? '🎙️' : '💬'}
          </div>
          <div>
            <p className={styles.headerLabel}>
              {mode === 'voice' ? 'AI VOICE' : 'AI ASSISTANT'}
            </p>
            <h3>{mode === 'voice' ? 'Live Conversation' : 'Mentor Studio'}</h3>
          </div>
        </div>

        <div className={styles.headerActions}>
          {mode === 'text' && (
            <button
              className={styles.headerButton}
              onClick={() => onModeChange('voice')}
              title="Switch to voice"
              aria-label="Switch to voice mode"
            >
              🎤
            </button>
          )}
          {mode === 'voice' && (
            <button
              className={styles.headerButton}
              onClick={() => onModeChange('text')}
              title="Switch to text"
              aria-label="Switch to text mode"
            >
              💬
            </button>
          )}
          <button
            className={styles.headerButton}
            onClick={onClose}
            title="Close"
            aria-label="Close AI Assistant"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>{children}</div>
    </div>
  );
}
