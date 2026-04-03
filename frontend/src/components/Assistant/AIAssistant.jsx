import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { assistantService } from '../../api/assistantService';
import { assistantPipelineService } from '../../api/assistantPipelineService';
import env from '../../config/env';
import { buildFrontendAssistantContext, getContextSourceFromPath } from '../../utils/assistantContext';

const INITIAL_ASSISTANT_MESSAGE = `Hey there! 👋 I'm your AI learning companion.

I can help you with:
• Understanding your progress across all roadmaps
• Managing your tasks and what to study next
• Setting learning goals and tracking milestones
• Answering questions about the platform

Just ask me anything about your learning journey!`;

const createMessageId = () => Date.now() + Math.floor(Math.random() * 1000);

export default function AIAssistant() {
  const location = useLocation();
  const initialMessage = location.state?.initialMessage;
  const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes('text');

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: INITIAL_ASSISTANT_MESSAGE,
      proposals: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasProcessedInitialMessage = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendAssistantMessage = useCallback((content, proposals = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: 'assistant',
        content,
        proposals: Array.isArray(proposals) ? proposals : [],
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    const clean = String(messageText || '').trim();
    if (!clean || loading) return;

    const userMessage = {
      id: createMessageId(),
      role: 'user',
      content: clean,
      proposals: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (pipelineEnabled) {
        try {
          const pathname = location.pathname || '/assistant';
          const contextSource = getContextSourceFromPath(pathname);
          const frontendContext = buildFrontendAssistantContext({
            pathname,
            visiblePanel: 'assistant_page',
            metadata: {
              channel: 'text',
              sent_at: new Date().toISOString(),
            },
          });

          const response = await assistantPipelineService.sendTextTurn({
            message: clean,
            contextSource,
            frontendContext,
            conversationId,
            languagePreference: 'hinglish',
          });

          if (response?.conversation_id) {
            setConversationId(response.conversation_id);
          }

          appendAssistantMessage(
            response?.assistant_text || "I'm not sure how to help with that yet.",
            response?.action_proposals || []
          );
        } catch (pipelineError) {
          if (!env.AI_PIPELINE_FALLBACK_REALTIME_ENABLED) {
            throw pipelineError;
          }
          const fallbackResponse = await assistantService.sendMessage(clean);
          appendAssistantMessage(
            fallbackResponse?.message || "I'm not sure how to help with that. Try asking about your tasks or roadmaps!",
            []
          );
        }
      } else {
        const response = await assistantService.sendMessage(clean);
        appendAssistantMessage(
          response?.message || "I'm not sure how to help with that. Try asking about your tasks or roadmaps!",
          []
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      appendAssistantMessage('Sorry, I encountered an error. Please try again.', []);
    } finally {
      setLoading(false);
    }
  }, [appendAssistantMessage, conversationId, loading, location.pathname, pipelineEnabled]);

  const handleProposalDecision = useCallback(async (messageId, proposalId, confirmed) => {
    if (!pipelineEnabled || !conversationId || !proposalId) {
      return;
    }
    setLoading(true);
    try {
      const response = await assistantPipelineService.confirmAction({
        conversationId,
        proposalId,
        confirmed,
        idempotencyKey: `${conversationId}:${proposalId}:${confirmed ? 'yes' : 'no'}`,
      });

      setMessages((prev) => prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        return {
          ...msg,
          proposals: (msg.proposals || []).filter((proposal) => proposal.proposal_id !== proposalId),
        };
      }));

      if (response?.assistant_text) {
        appendAssistantMessage(response.assistant_text, []);
      }

      if (response?.job_id) {
        const pollJob = async () => {
          try {
            const job = await assistantPipelineService.getJobStatus(response.job_id);
            if (job?.status === 'queued' || job?.status === 'running') {
              setTimeout(pollJob, 2000);
              return;
            }
            if (job?.status === 'succeeded') {
              appendAssistantMessage('Action complete ho gaya.', []);
            } else {
              appendAssistantMessage(job?.error || 'Action failed while processing.', []);
            }
          } catch (pollErr) {
            console.error('Assistant job polling failed', pollErr);
          }
        };
        setTimeout(pollJob, 1500);
      }
    } catch (error) {
      console.error('Proposal decision failed:', error);
      appendAssistantMessage('Action confirmation failed. Please retry.', []);
    } finally {
      setLoading(false);
    }
  }, [appendAssistantMessage, conversationId, pipelineEnabled]);

  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage]);

  const handleSend = async (e) => {
    e?.preventDefault();
    await sendMessage(input);
  };

  const quickQuestions = [
    { icon: '📚', text: 'What should I study today?' },
    { icon: '📈', text: 'How am I progressing?' },
    { icon: '🎯', text: "What's my next milestone?" },
    { icon: '⏰', text: 'Show my pending tasks' },
  ];

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: INITIAL_ASSISTANT_MESSAGE,
        proposals: [],
      },
    ]);
    setConversationId(null);
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-[#0A0A0A] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-6">
          <div className="text-center mb-8">
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Powered by Gemini {pipelineEnabled ? 'Pipeline' : 'Legacy Chat'}
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${msg.role === 'user'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? '👤' : '✨'}
                  </div>

                  <div className={`relative px-4 py-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-md'
                    : 'bg-white dark:bg-charcoal text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-charcoalMuted rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-violet-600 dark:prose-strong:text-violet-400 leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.role === 'assistant' && Array.isArray(msg.proposals) && msg.proposals.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.proposals.map((proposal) => (
                          <div key={proposal.proposal_id} className="rounded-xl border border-violet-200 dark:border-violet-700 p-2">
                            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">{proposal.summary}</p>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleProposalDecision(msg.id, proposal.proposal_id, true)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProposalDecision(msg.id, proposal.proposal_id, false)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-charcoalMuted text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-charcoalMuted"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm">
                      ✨
                    </div>
                    <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-charcoalMuted rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-charcoalMuted py-3 md:py-4">
        <div className="max-w-3xl mx-auto px-3 md:px-4">
          <AnimatePresence>
            {messages.length <= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4"
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickQuestions.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => sendMessage(q.text)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-charcoal text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-charcoalMuted hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all text-sm"
                    >
                      <span>{q.icon}</span>
                      <span>{q.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-charcoal rounded-2xl border border-gray-200 dark:border-charcoalMuted shadow-lg shadow-gray-200/50 dark:shadow-black/30 p-2">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything about your learning journey..."
                rows={1}
                className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none text-sm"
                disabled={loading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              <div className="flex items-center gap-1 pr-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoalMuted rounded-xl transition-all"
                    title="Clear Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-violet-600"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
