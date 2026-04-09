import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, Send, X, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AIMentorWidget() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('text');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm your AI Mentor. What are you working on?", sender: 'mentor', timestamp: new Date() }
  ]);
  const messagesEndRef = useRef(null);

  const isDark = theme === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, userMessage]);
      setInputValue('');

      // Simulate mentor response
      setTimeout(() => {
        const mentorResponse = {
          id: messages.length + 2,
          text: `That's great! Let me help you with that. Since you're working on "${inputValue}", here's what I suggest...`,
          sender: 'mentor',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, mentorResponse]);
      }, 500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 1 }}
            className={`absolute bottom-20 right-0 w-80 rounded-3xl overflow-hidden backdrop-blur-2xl border ${
              isDark
                ? 'bg-slate-900/40 border-slate-700/20 shadow-2xl'
                : 'bg-white/40 border-white/60 shadow-2xl'
            }`}
            style={{
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          >
            {/* Header */}
            <motion.div
              className={`px-6 pt-6 pb-4 border-b ${
                isDark ? 'border-slate-700/10' : 'border-slate-900/5'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className={`text-2xl font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}>
                    AI Mentor
                  </h2>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {mode === 'text' ? 'Text guidance' : 'Voice coaching'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-full transition-colors ${
                    isDark
                      ? 'hover:bg-slate-700/40'
                      : 'hover:bg-slate-900/5'
                  }`}
                >
                  <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                </motion.button>
              </div>
            </motion.div>

            {/* Mode Toggle Section */}
            <motion.div
              className={`px-6 pt-4 pb-3 border-b ${
                isDark ? 'border-slate-700/10' : 'border-slate-900/5'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Conversation Mode
              </p>
              <div className={`inline-flex p-1 rounded-xl gap-1 ${
                isDark ? 'bg-slate-800/50' : 'bg-slate-900/5'
              }`}>
                {[
                  { id: 'text', label: 'Text', icon: MessageCircle },
                  { id: 'voice', label: 'Voice', icon: Mic }
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = mode === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(option.id)}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? isDark
                            ? 'text-white'
                            : 'text-slate-950'
                          : isDark
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 rounded-lg ${
                            isDark ? 'bg-slate-700/60' : 'bg-slate-900/10'
                          }`}
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      <div className="relative flex items-center gap-2">
                        <Icon size={14} />
                        <span>{option.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Chat Messages Section */}
            <div className={`flex flex-col h-64 overflow-y-auto ${
              isDark ? 'bg-slate-900/20' : 'bg-slate-50/50'
            }`}>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? isDark
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-950 text-white'
                          : isDark
                          ? 'bg-slate-800/60 text-slate-100'
                          : 'bg-slate-100 text-slate-950'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Section */}
            <motion.div
              className={`px-6 py-4 border-t ${
                isDark ? 'border-slate-700/10' : 'border-slate-900/5'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>
                {mode === 'text' ? 'Message' : 'Voice Input'}
              </p>
              <div className="space-y-3">
                {mode === 'text' ? (
                  <>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder="Ask your mentor..."
                      className={`w-full resize-none rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:ring-1 transition-all ${
                        isDark
                          ? 'bg-slate-800/40 text-white placeholder-slate-500 focus:ring-slate-600 border border-slate-700/20'
                          : 'bg-slate-900/5 text-slate-950 placeholder-slate-500 focus:ring-slate-300 border border-slate-900/5'
                      }`}
                      rows={2}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      className={`w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                        isDark
                          ? 'bg-white text-slate-950 hover:bg-slate-100'
                          : 'bg-slate-950 text-white hover:bg-slate-900'
                      }`}
                    >
                      <Send size={16} />
                      <span>Send</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                      isDark
                        ? 'bg-white text-slate-950 hover:bg-slate-100'
                        : 'bg-slate-950 text-white hover:bg-slate-900'
                    }`}
                  >
                    <Volume2 size={16} />
                    <span>Start Recording</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all ${
          isDark
            ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl'
            : 'bg-slate-950 text-white hover:bg-slate-900 shadow-xl'
        }`}
        style={{
          boxShadow: isDark
            ? '0 10px 40px rgba(255, 255, 255, 0.1)'
            : '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <MessageCircle size={24} />
        </motion.div>
      </motion.button>
    </div>
  );
}
