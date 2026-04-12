import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { useMentorStore } from '../../stores/mentorStore';

/**
 * MentorChat - Messages display area with auto-scroll and typing indicator
 */
const MentorChat = () => {
  const messages = useMentorStore((state) => state.messages);
  const isLoading = useMentorStore((state) => state.isLoading);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white dark:bg-gray-950">
      <AnimatePresence mode="popLayout">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex items-center justify-center text-center"
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                👋 Hi there! I'm your AI Mentor.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                Ask me anything to get started
              </p>
            </div>
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-start mb-3"
          >
            <div className="bg-gray-100 dark:bg-dark-bg-tertiary px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MentorChat;
