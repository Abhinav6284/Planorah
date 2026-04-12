import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, X, SendHorizontal } from 'lucide-react';
import { useMentorStore } from '../../stores/mentorStore';
import MentorChat from './MentorChat';
import QuickActions from './QuickActions';
import ExpandButton from './ExpandButton';

/**
 * MentorPanel - Main floating AI Mentor panel with 4 expand modes
 * Modes: default (400x530) → larger (600x600) → fullscreen → newtab
 */
const MentorPanel = () => {
  const {
    expandMode,
    isMinimized,
    currentContext,
    messages,
    isLoading,
    toggleMinimized,
    setMinimized,
    addMessage,
    setLoading,
    cycleExpandMode,
  } = useMentorStore();

  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Simulate API call
    setLoading(true);

    // Simulate response delay
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: 'I received your message: "' + userMessage + '". API integration coming in Task 11!',
      });
      setLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage();
    }
  };

  const handleQuickAction = (actionLabel) => {
    setInput(actionLabel);
    // Focus textarea after setting input
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Handle newtab mode
  useEffect(() => {
    if (expandMode === 'newtab') {
      const newWindow = window.open(window.location.href, '_blank');
      if (newWindow) {
        // Reset to default mode in current window
        cycleExpandMode();
      }
    }
  }, [expandMode, cycleExpandMode]);

  // Mode configurations
  const modeConfig = {
    default: {
      width: 'w-[400px]',
      height: 'h-[530px]',
      position: 'fixed right-4 bottom-4',
      showOverlay: false,
    },
    larger: {
      width: 'w-[600px]',
      height: 'h-[600px]',
      position: 'fixed right-4 bottom-4',
      showOverlay: false,
    },
    fullscreen: {
      width: 'w-screen',
      height: 'h-screen',
      position: 'fixed inset-0',
      showOverlay: true,
    },
  };

  const config = modeConfig[expandMode] || modeConfig.default;

  // Render nothing if in newtab mode
  if (expandMode === 'newtab') {
    return null;
  }

  // Render minimized state
  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        onClick={() => setMinimized(false)}
        className={`${config.position} z-40 p-3 bg-accent-indigo text-white rounded-full shadow-lg hover:bg-accent-indigo-dark transition-colors duration-200`}
        title="Open AI Mentor"
      >
        <span className="text-lg">🤖</span>
      </motion.button>
    );
  }

  return (
    <>
      {/* Overlay for fullscreen mode */}
      {config.showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleMinimized()}
          className="fixed inset-0 z-30 bg-black/40"
        />
      )}

      {/* Main Panel */}
      <motion.div
        initial={false}
        animate={{
          width: config.width,
          height: config.height,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${config.position} z-40 flex flex-col bg-white dark:bg-gray-950 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🤖</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                AI Mentor
              </h3>
              {currentContext && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentContext}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <ExpandButton />
            <button
              onClick={() => toggleMinimized()}
              title="Minimize"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300"
            >
              <ChevronDown size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setMinimized(true)}
              title="Close"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <MentorChat />

        {/* Quick Actions */}
        {messages.length === 0 && <QuickActions onActionSelect={handleQuickAction} />}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-2">
          <div className="flex items-end space-x-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-white dark:bg-dark-bg-secondary rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-indigo resize-none max-h-[100px] text-sm"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              title="Send (Ctrl+Enter)"
              className="p-2 bg-accent-indigo text-white rounded-lg hover:bg-accent-indigo-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <SendHorizontal size={20} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ctrl+Enter to send
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default MentorPanel;
