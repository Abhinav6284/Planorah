import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ChatMessage - Single message in the chat
 * Props: message { id, role, content, timestamp }
 */
const ChatMessage = ({ message }) => {
  const [showTime, setShowTime] = useState(false);
  const isUser = message.role === 'user';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-accent-indigo text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>

        {showTime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-1 opacity-70"
          >
            {formatTime(message.timestamp)}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
