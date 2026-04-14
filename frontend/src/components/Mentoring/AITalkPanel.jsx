import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Mic, Minus, SquarePen } from "lucide-react";
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import { getContextSourceFromPath, buildFrontendAssistantContext } from "../../utils/assistantContext";
import env from "../../config/env";

const CONTEXT_LABELS = {
  roadmap: "Roadmap",
  dashboard: "Dashboard",
  tasks: "Tasks",
  resume: "Resume",
  ats: "ATS",
  interview: "Interview",
  portfolio: "Portfolio",
  projects: "Projects",
  planora: "Planora",
  scheduler: "Scheduler",
  lab: "Lab",
  general: "General",
};

const makeMessage = (role, content, proposals = []) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  proposals,
});

export default function AITalkPanel({
  contextSource: contextSourceProp = "general",
  studentGoal = "",
  currentProgress = "",
  isOpen = false,
  onClose,
  onSwitchToVoice,
}) {
  const contextSource = contextSourceProp !== "general"
    ? contextSourceProp
    : (typeof window !== "undefined" ? getContextSourceFromPath(window.location.pathname) : "general");

  const contextLabel = useMemo(() => CONTEXT_LABELS[contextSource] || "General", [contextSource]);
  const convKey = useMemo(() => `planorah_conv_${contextSource}`, [contextSource]);
  const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes("text");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(convKey));

  const listRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setConversationId(localStorage.getItem(convKey));
    setMessages([]);
    setInput("");
    setError("");
  }, [convKey]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(async (overrideText = "") => {
    const text = String(overrideText || input || "").trim();
    if (!text || loading) return;

    setError("");
    setLoading(true);
    setMessages((prev) => [...prev, makeMessage("user", text)]);
    setInput("");

    try {
      if (pipelineEnabled) {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
        const response = await assistantPipelineService.sendTextTurn({
          message: text,
          contextSource,
          frontendContext: buildFrontendAssistantContext({
            pathname,
            visiblePanel: "quicky_text_panel",
            metadata: {
              student_goal: studentGoal,
              current_progress: currentProgress,
            },
          }),
          conversationId,
          languagePreference: "hinglish",
        });

        if (response?.conversation_id) {
          setConversationId(response.conversation_id);
          localStorage.setItem(convKey, response.conversation_id);
        }

        setMessages((prev) => [
          ...prev,
          makeMessage(
            "assistant",
            response?.assistant_text || "I could not generate a response right now.",
            Array.isArray(response?.action_proposals) ? response.action_proposals : []
          ),
        ]);
      } else {
        const response = await mentoringService.createSession({
          context_source: contextSource,
          student_goal: studentGoal,
          current_progress: currentProgress,
          transcript: text,
        });

        setMessages((prev) => [
          ...prev,
          makeMessage("assistant", response?.mentor_message || "I could not generate a response right now."),
        ]);
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
      setMessages((prev) => [...prev, makeMessage("assistant", "I hit an error. Please retry in a moment.")]);
    } finally {
      setLoading(false);
    }
  }, [contextSource, conversationId, convKey, currentProgress, input, loading, pipelineEnabled, studentGoal]);

  const handleProposalDecision = useCallback(async (messageId, proposalId, confirmed) => {
    if (!pipelineEnabled || !conversationId || !proposalId || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await assistantPipelineService.confirmAction({
        conversationId,
        proposalId,
        confirmed,
        idempotencyKey: `${conversationId}:${proposalId}:${confirmed ? "yes" : "no"}`,
      });

      setMessages((prev) => prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        return {
          ...msg,
          proposals: (msg.proposals || []).filter((proposal) => proposal.proposal_id !== proposalId),
        };
      }));

      if (response?.assistant_text) {
        setMessages((prev) => [...prev, makeMessage("assistant", response.assistant_text)]);
      }

      if (response?.job_id) {
        const poll = async () => {
          try {
            const job = await assistantPipelineService.getJobStatus(response.job_id);
            if (job?.status === "queued" || job?.status === "running") {
              setTimeout(poll, 2000);
              return;
            }
            const jobText = job?.status === "succeeded"
              ? "Action completed successfully."
              : (job?.error || "Action failed while processing.");
            setMessages((prev) => [...prev, makeMessage("assistant", jobText)]);
          } catch (_pollErr) {
            setMessages((prev) => [...prev, makeMessage("assistant", "Could not fetch action status.")]);
          }
        };
        setTimeout(poll, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to confirm this action.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, pipelineEnabled]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setError("");
    setConversationId(null);
    localStorage.removeItem(convKey);
  }, [convKey]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="quicky-text"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed bottom-4 left-3 right-3 z-[9999] ml-auto w-[calc(100vw-24px)] max-w-[430px] overflow-hidden rounded-3xl border-2 border-borderMuted bg-white/95 shadow-[0_14px_36px_rgba(47,39,32,0.22)] backdrop-blur-md dark:border-white/10 dark:bg-charcoal"
      >
        <div className="flex items-center justify-between gap-2 border-b border-borderMuted px-3 py-3 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-terracotta/30 bg-terracotta/10 text-2xl">
              🦉
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-textPrimary dark:text-white">Quicky Assistant</p>
              <p className="truncate text-xs font-medium text-textSecondary dark:text-gray-400">{contextLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleNewChat}
              title="New chat"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
            >
              <SquarePen size={15} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Minimize"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
            >
              <Minus size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div ref={listRef} className="max-h-[46vh] min-h-[220px] space-y-3 overflow-y-auto bg-beigePrimary/55 px-3 py-3 dark:bg-charcoalDark/50">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-borderMuted bg-white/80 px-3 py-2 text-sm text-textSecondary dark:border-white/10 dark:bg-charcoal/70 dark:text-gray-400">
              Start chatting with Quicky. Ask anything and continue the conversation naturally.
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-[14px] leading-relaxed ${msg.role === "user"
                ? "rounded-br-md bg-terracotta text-white"
                : "rounded-bl-md border border-borderMuted bg-white text-textPrimary dark:border-white/10 dark:bg-charcoal dark:text-gray-100"
                }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.role === "assistant" && Array.isArray(msg.proposals) && msg.proposals.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.proposals.map((proposal) => (
                      <div key={proposal.proposal_id} className="rounded-xl border border-terracotta/25 bg-beigeSecondary/70 p-2 dark:border-terracotta/35 dark:bg-charcoalMuted/60">
                        <p className="mb-2 text-xs font-semibold text-textPrimary dark:text-gray-200">{proposal.summary}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleProposalDecision(msg.id, proposal.proposal_id, true)}
                            className="rounded-lg bg-terracotta px-2.5 py-1 text-xs font-semibold text-white hover:bg-terracottaHover"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProposalDecision(msg.id, proposal.proposal_id, false)}
                            className="rounded-lg border border-borderMuted bg-white px-2.5 py-1 text-xs font-semibold text-textSecondary hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoal dark:text-gray-300 dark:hover:bg-charcoalMuted"
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
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-borderMuted bg-white px-3 py-2 text-sm text-textSecondary dark:border-white/10 dark:bg-charcoal dark:text-gray-400">
                Quicky is thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="p-3">
          <div className="rounded-2xl border-2 border-terracotta/20 bg-white p-2 shadow-sm dark:border-terracotta/30 dark:bg-charcoalDark">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={2}
              placeholder="Message Quicky..."
              className="w-full resize-none border-none bg-transparent px-2 py-1 text-base text-textPrimary outline-none placeholder:text-textSecondary/70 dark:text-white dark:placeholder:text-gray-500"
            />

            <div className="mt-1 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={onSwitchToVoice}
                className="inline-flex items-center gap-1 rounded-full border border-borderMuted bg-white px-3 py-1 text-xs font-semibold text-textSecondary hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoal dark:text-gray-300 dark:hover:bg-charcoalMuted"
                title="Switch to voice"
              >
                <Mic size={13} strokeWidth={2.2} />
                Voice
              </button>

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-white disabled:cursor-not-allowed disabled:bg-beigeMuted dark:disabled:bg-charcoalMuted"
                title="Send"
              >
                <ArrowUp size={14} strokeWidth={2.8} />
              </button>
            </div>
          </div>

          <p className="mt-2 text-right text-xs text-textSecondary dark:text-gray-500">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
