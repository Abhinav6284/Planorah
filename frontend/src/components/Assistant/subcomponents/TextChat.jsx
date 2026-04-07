import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from '../UnifiedAIAssistant.module.css';

function TextChat({ messages, onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  }, [input, isLoading, onSendMessage]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        // Cmd/Ctrl+Enter for new line
        setInput((prev) => prev + '\n');
      } else {
        // Enter alone sends message
        e.preventDefault();
        handleSend();
      }
    }
  }, [handleSend]);

  return (
    <>
      {/* Message List */}
      <div className={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : ''}`}>
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.messageBubble} style={{ display: 'flex', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite' }} />
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite 0.2s' }} />
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite 0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.textInput}>
        <textarea
          className={styles.inputField}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={isLoading}
          rows={3}
          style={{ resize: 'none' }}
        />
        <div className={styles.inputActions}>
          <button
            className={styles.actionButton}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{ opacity: isLoading || !input.trim() ? 0.5 : 1 }}
          >
            ➤ Send
          </button>
        </div>
      </div>
    </>
  );
}

// Memoize to prevent re-renders when parent state changes (e.g., isExpanded)
export default React.memo(
  TextChat,
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if messages, isLoading, or onSendMessage changes
    return (
      prevProps.messages === nextProps.messages &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.onSendMessage === nextProps.onSendMessage
    );
  }
);
