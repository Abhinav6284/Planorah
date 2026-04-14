# AI Mentor — Smart Personal Assistant Redesign

**Date:** 2026-04-14  
**Status:** Approved  
**Scope:** AITalkPanel, AIVoicePanel, new inline page widgets, new backend context/suggestions APIs

## Overview

Transform the AI mentor from a basic reactive chat panel into a smart personal assistant that understands the user's journey, surfaces proactive suggestions inline on each page, and executes actions on their behalf. Both voice and text are equal first-class interaction modes.

## Architecture

### Three Layers

**1. Enhanced Persistent Panel**
- AITalkPanel + AIVoicePanel get conversation memory (persists across sessions)
- Shows user's current goals and progress at the top of the panel
- Action proposals with confirm/cancel (already exists — keep and polish)
- Clean, professional tone — not overly personal, focused on guidance

**2. Inline Page Widgets (new)**
- A non-intrusive assistant card embedded in each major page layout
- Shows 1-2 smart suggestions based on current page + user journey
- Quick action buttons: "Tell me more" (opens full panel) or "Do it" (executes action inline)
- Feels native to the page, not floating or distracting

**3. Smart Context Backend (new endpoints)**
- `GET /api/assistant/user-context` — returns goals, progress summary, active blockers, recent activity
- `POST /api/assistant/suggestions` — accepts page context + user context, returns 1-2 smart suggestions
- Persistent conversation memory stored server-side (across sessions)

## What Changes

| Component | Action |
|-----------|--------|
| FAB (floating button) | Keep as-is |
| AITalkPanel | Enhance: add memory, context header, polish |
| AIVoicePanel | Enhance: add memory |
| Inline page widget | New: `AssistantWidget.jsx` |
| Backend suggestions API | New: `GET /api/assistant/suggestions` |
| Backend user-context API | New: `GET /api/assistant/user-context` |
| Conversation storage | New: persistent DB table |

## Inline Widget Behavior Per Page

| Page | Example suggestion |
|------|-------------------|
| Dashboard | "You have 4 overdue tasks — want me to create a priority plan?" |
| Tasks | "Your sprint looks overloaded — let me help you cut it down" |
| Resume | "2 ATS issues detected in your resume" |
| Interview | "You haven't practiced in 5 days — quick mock session?" |
| Roadmap | "You're 60% done — here's what to focus on next" |
| Scheduler | "You have no deep work blocks this week" |
| Projects | "Your project milestone is overdue by 3 days" |

## Panel Enhancements

### Context Header
At the top of the panel (above quick actions), show:
- User's active goal (e.g., "Goal: Land a frontend role at a product company")
- Progress indicator (e.g., "72% through your roadmap")
- Last interaction note (e.g., "Last time: you were stuck on CSS layout")

### Memory
- `conversation_history` stored server-side per user
- On panel open: last 5 exchanges pre-loaded as context for the AI
- Session continues from where user left off

## Design Principles
- **Professional, not chatty** — assistant gives clear, actionable guidance
- **Non-intrusive inline presence** — widgets don't dominate page layouts
- **Fast** — suggestions load quickly, don't block page render
- **Action-oriented** — every response should end with something the user can do

## Out of Scope
- Push notifications
- Autonomous background task execution (user always confirms)
- Per-user personality customization
