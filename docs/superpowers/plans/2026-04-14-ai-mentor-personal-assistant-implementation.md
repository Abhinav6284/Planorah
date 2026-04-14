# AI Mentor — Smart Personal Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AI mentor from a basic chat panel into a smart personal assistant that knows the user's journey, surfaces proactive suggestions inline on each page, and guides users to the right places in the app.

**Architecture:** Two new backend endpoints serve user context and proactive suggestions (built on top of the existing `build_backend_context` aggregator). A new `AssistantWidget` component embeds suggestions inline on key pages. Both `AITalkPanel` and `AIVoicePanel` gain a context header showing goals/progress and persist `conversation_id` in `localStorage` so conversations continue across sessions.

**Tech Stack:** Django REST Framework, Gemini API (already wired), React, Framer Motion, localStorage for conversation persistence

---

## File Map

### Backend (new/modified)
- **Create:** `backend/assistant/services/suggestions_service.py` — Gemini call to generate 1-2 proactive suggestions for a given page
- **Modify:** `backend/assistant/views.py` — add `user_context` and `suggestions` view functions
- **Modify:** `backend/assistant/urls.py` — register the two new URL routes

### Frontend (new/modified)
- **Modify:** `frontend/src/api/assistantPipelineService.js` — add `getUserContext()` and `getSuggestions()` methods
- **Create:** `frontend/src/components/Mentoring/AssistantWidget.jsx` — inline per-page suggestion widget
- **Modify:** `frontend/src/components/Mentoring/AITalkPanel.jsx` — add context header + persist conversationId in localStorage
- **Modify:** `frontend/src/components/Mentoring/AIVoicePanel.jsx` — persist conversationId in localStorage
- **Modify:** `frontend/src/components/Dashboard/Dashboard.jsx` — embed AssistantWidget
- **Modify:** `frontend/src/components/Roadmap/RoadmapView.jsx` — embed AssistantWidget
- **Modify:** `frontend/src/components/Tasks/TasksPage.jsx` — embed AssistantWidget (find the correct tasks page file first)
- **Modify:** `frontend/src/components/Resume/ResumeBuilder.jsx` — embed AssistantWidget
- **Modify:** `frontend/src/components/Interview/InterviewChat.jsx` — embed AssistantWidget

---

## Task 1: Create `suggestions_service.py`

**Files:**
- Create: `backend/assistant/services/suggestions_service.py`

This service generates 1–2 proactive suggestions for a given page using the user's context data. It also carries full app navigation knowledge so the assistant can tell users exactly where to go.

- [ ] **Step 1: Create the file**

```python
# backend/assistant/services/suggestions_service.py
import logging
from typing import List, Dict, Any

from .gemini_pipeline import call_gemini

logger = logging.getLogger(__name__)

# Every route in the app — the assistant uses this to guide users to the right place
APP_NAVIGATION = {
    "dashboard": {"path": "/dashboard", "label": "Dashboard", "description": "Your daily command center — tasks, stats, streaks"},
    "roadmap": {"path": "/roadmap", "label": "Roadmap", "description": "Your learning roadmap and milestone progress"},
    "tasks": {"path": "/tasks", "label": "Tasks", "description": "Your study tasks broken down by day"},
    "scheduler": {"path": "/scheduler", "label": "Scheduler", "description": "Your weekly calendar and time blocks"},
    "resume": {"path": "/resume", "label": "Resume", "description": "Your resume builder"},
    "ats": {"path": "/ats", "label": "ATS Scanner", "description": "Check your resume against job descriptions"},
    "interview": {"path": "/interview", "label": "Interview Prep", "description": "Mock interview practice and feedback"},
    "portfolio": {"path": "/portfolio", "label": "Portfolio", "description": "Your project portfolio"},
    "projects": {"path": "/projects", "label": "Projects", "description": "Your project tracker"},
    "lab": {"path": "/lab", "label": "Lab", "description": "Code playground, research hub, and tools"},
    "planora": {"path": "/planora", "label": "Planora", "description": "Your subject and topic study notes"},
    "assistant": {"path": "/assistant", "label": "Assistant", "description": "Full-screen AI assistant"},
}

SUGGESTIONS_SYSTEM_PROMPT = """You are Planorah's personal assistant. Your job is to give the user 1-2 SHORT, specific, actionable suggestions based on their current page and their real data.

Rules:
- Be direct. No fluff, no filler.
- Use real numbers from their data (e.g. "You have 5 pending tasks" not "You have some tasks").
- Each suggestion must include a clear action the user can take RIGHT NOW.
- When relevant, reference a specific page path from APP_NAVIGATION to guide the user.
- Keep each suggestion under 15 words.
- Never repeat the same suggestion twice.
- Format: return ONLY a JSON array of objects like:
  [{"text": "short suggestion", "action_label": "short CTA", "action_type": "navigate|open_panel|none", "action_target": "/path or null"}]
"""


def generate_suggestions(context_source: str, backend_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate 1-2 proactive suggestions for the given page using user context.
    Returns a list of suggestion dicts: [{text, action_label, action_type, action_target}]
    Falls back to static suggestions if Gemini fails.
    """
    profile = backend_context.get("profile", {})
    tasks = backend_context.get("tasks", {})
    roadmaps = backend_context.get("roadmaps", {})
    execution = backend_context.get("execution", {})

    task_summary = tasks.get("summary", {})
    pending = task_summary.get("pending", 0)
    in_progress = task_summary.get("in_progress", 0)
    completed = task_summary.get("completed", 0)
    total = task_summary.get("total", 0)

    roadmap_count = roadmaps.get("count", 0)
    roadmap_items = roadmaps.get("items", [])
    streak = execution.get("current_streak", 0)
    xp = execution.get("xp_points", 0)

    nav_json = "\n".join([f"  {k}: {v['path']} — {v['description']}" for k, v in APP_NAVIGATION.items()])

    prompt = f"""{SUGGESTIONS_SYSTEM_PROMPT}

APP NAVIGATION (use these paths when guiding the user):
{nav_json}

USER DATA:
- Name: {profile.get('name', 'Student')}
- Goal: {profile.get('goal_statement', 'Not set')}
- Target role: {profile.get('target_role', 'Not set')}
- Current page: {context_source}
- Tasks: {pending} pending, {in_progress} in progress, {completed} completed out of {total} total
- Roadmaps: {roadmap_count} active
- Streak: {streak} days
- XP: {xp}
- Roadmap details: {roadmap_items[:2]}

Generate 1-2 suggestions for the "{context_source}" page. Return ONLY the JSON array, no markdown, no explanation."""

    try:
        raw = call_gemini(prompt, max_tokens=256)
        # Strip markdown code fences if present
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json
        suggestions = json.loads(raw.strip())
        if isinstance(suggestions, list):
            return suggestions[:2]
    except Exception as exc:
        logger.warning("suggestions_service Gemini call failed: %s", exc)

    return _fallback_suggestions(context_source, pending, roadmap_count)


def _fallback_suggestions(context_source: str, pending_tasks: int, roadmap_count: int) -> List[Dict[str, Any]]:
    """Static fallback suggestions when Gemini is unavailable."""
    fallbacks = {
        "dashboard": [
            {"text": f"You have {pending_tasks} pending tasks today", "action_label": "View tasks", "action_type": "navigate", "action_target": "/tasks"},
        ],
        "roadmap": [
            {"text": "Continue your roadmap progress", "action_label": "Open roadmap", "action_type": "navigate", "action_target": "/roadmap"},
        ],
        "tasks": [
            {"text": f"{pending_tasks} tasks are waiting for you", "action_label": "Start one", "action_type": "open_panel", "action_target": None},
        ],
        "resume": [
            {"text": "Check your resume against a job description", "action_label": "Run ATS scan", "action_type": "navigate", "action_target": "/ats"},
        ],
        "interview": [
            {"text": "Practice a mock interview session", "action_label": "Start now", "action_type": "open_panel", "action_target": None},
        ],
        "scheduler": [
            {"text": "Plan your week with time blocks", "action_label": "Open scheduler", "action_type": "navigate", "action_target": "/scheduler"},
        ],
    }
    return fallbacks.get(context_source, [
        {"text": "Ask me anything about your progress", "action_label": "Open chat", "action_type": "open_panel", "action_target": None},
    ])
```

- [ ] **Step 2: Check that `call_gemini` exists in `gemini_pipeline.py`**

```bash
grep -n "def call_gemini" backend/assistant/services/gemini_pipeline.py
```

If the function is named differently (e.g. `run_gemini`, `generate`), update the import in `suggestions_service.py` to match.

- [ ] **Step 3: Commit**

```bash
git add backend/assistant/services/suggestions_service.py
git commit -m "feat(assistant): add suggestions_service with app navigation awareness"
```

---

## Task 2: Add `user_context` and `suggestions` views

**Files:**
- Modify: `backend/assistant/views.py`

- [ ] **Step 1: Add the two view functions at the bottom of `views.py`**

Open `backend/assistant/views.py` and append after the last function:

```python
from .services.context_aggregator import build_backend_context
from .services.suggestions_service import generate_suggestions


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assistant_user_context(request):
    """
    Returns a cleaned summary of the user's journey for display in the
    assistant panel header (goals, progress, streak).
    """
    try:
        ctx = build_backend_context(request.user, context_source="general")
        profile = ctx.get("profile", {})
        tasks = ctx.get("tasks", {}).get("summary", {})
        roadmaps = ctx.get("roadmaps", {})
        execution = ctx.get("execution", {})

        total = tasks.get("total", 0)
        completed = tasks.get("completed", 0)
        progress_pct = round((completed / total) * 100) if total > 0 else 0

        payload = {
            "name": profile.get("name", ""),
            "goal": profile.get("goal_statement", ""),
            "target_role": profile.get("target_role", ""),
            "progress_pct": progress_pct,
            "tasks_completed": completed,
            "tasks_total": total,
            "streak": execution.get("current_streak", 0),
            "roadmap_count": roadmaps.get("count", 0),
        }
        return Response(payload, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("assistant_user_context failed: %s", exc)
        return Response({"error": "Could not load user context."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assistant_suggestions(request):
    """
    Returns 1-2 proactive suggestions for the given page context.
    Query param: ?context_source=dashboard
    """
    context_source = request.query_params.get("context_source", "general")
    try:
        backend_ctx = build_backend_context(request.user, context_source=context_source)
        suggestions = generate_suggestions(context_source, backend_ctx)
        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("assistant_suggestions failed: %s", exc)
        return Response({"suggestions": []}, status=status.HTTP_200_OK)
```

- [ ] **Step 2: Verify the imports at the top of `views.py` now include the new services**

The two import lines above go inside the function, so no top-level import change is needed. Confirm the file saves cleanly.

- [ ] **Step 3: Commit**

```bash
git add backend/assistant/views.py
git commit -m "feat(assistant): add user_context and suggestions endpoints"
```

---

## Task 3: Register new URL routes

**Files:**
- Modify: `backend/assistant/urls.py`

- [ ] **Step 1: Add the two new paths**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='assistant-chat'),
    path('v2/config/', views.assistant_v2_config, name='assistant-v2-config'),
    path('v2/turn/', views.assistant_v2_turn, name='assistant-v2-turn'),
    path('v2/action/confirm/', views.assistant_v2_action_confirm, name='assistant-v2-action-confirm'),
    path('v2/jobs/<uuid:job_id>/', views.assistant_v2_job_status, name='assistant-v2-job-status'),
    path('v2/user-context/', views.assistant_user_context, name='assistant-v2-user-context'),
    path('v2/suggestions/', views.assistant_suggestions, name='assistant-v2-suggestions'),
]
```

- [ ] **Step 2: Test both endpoints manually**

```bash
# From backend directory — start server if not running
python manage.py runserver

# In another terminal (replace TOKEN with a real auth token):
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/assistant/v2/user-context/
curl -H "Authorization: Bearer TOKEN" "http://localhost:8000/api/assistant/v2/suggestions/?context_source=dashboard"
```

Expected: `user-context` returns a JSON object with `goal`, `progress_pct`, etc. `suggestions` returns `{"suggestions": [...]}`.

- [ ] **Step 3: Commit**

```bash
git add backend/assistant/urls.py
git commit -m "feat(assistant): register user-context and suggestions routes"
```

---

## Task 4: Add service methods to `assistantPipelineService.js`

**Files:**
- Modify: `frontend/src/api/assistantPipelineService.js`

- [ ] **Step 1: Add `getUserContext` and `getSuggestions` to the service object**

Open `frontend/src/api/assistantPipelineService.js`. After the `getJobStatus` method (before the closing `};`), add:

```javascript
  getUserContext: async () => {
    const response = await api.get('assistant/v2/user-context/');
    return response.data;
  },

  getSuggestions: async (contextSource = 'general') => {
    const response = await api.get('assistant/v2/suggestions/', {
      params: { context_source: contextSource },
    });
    return response.data?.suggestions ?? [];
  },
```

- [ ] **Step 2: Verify the file still exports correctly**

```bash
grep -n "export const assistantPipelineService" frontend/src/api/assistantPipelineService.js
```

Expected: line 10 (or nearby), one export statement.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/assistantPipelineService.js
git commit -m "feat(assistant): add getUserContext and getSuggestions service methods"
```

---

## Task 5: Create `AssistantWidget.jsx`

**Files:**
- Create: `frontend/src/components/Mentoring/AssistantWidget.jsx`

This is the inline per-page widget. It fetches suggestions on mount and shows them as compact cards. The "Tell me more" button opens the full panel (calls `onOpenPanel`). The "Do it" button (for `navigate` actions) routes to the target path.

- [ ] **Step 1: Create the component**

```jsx
// frontend/src/components/Mentoring/AssistantWidget.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { assistantPipelineService } from '../../api/assistantPipelineService';

/**
 * Inline assistant widget for embedding on key pages.
 * Props:
 *   contextSource  — string matching CTX keys ('dashboard','tasks','resume',etc.)
 *   onOpenPanel    — function to open the full AITalkPanel
 */
export default function AssistantWidget({ contextSource = 'general', onOpenPanel }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    assistantPipelineService.getSuggestions(contextSource)
      .then((data) => { if (!cancelled) setSuggestions(data); })
      .catch(() => { if (!cancelled) setSuggestions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [contextSource]);

  if (dismissed || (!loading && suggestions.length === 0)) return null;

  const handleAction = (suggestion) => {
    if (suggestion.action_type === 'navigate' && suggestion.action_target) {
      navigate(suggestion.action_target);
    } else if (suggestion.action_type === 'open_panel') {
      onOpenPanel?.();
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-4 rounded-2xl border border-white/8 bg-[#0f1117]/80 backdrop-blur-md p-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
                <Sparkles size={12} className="text-white/70" />
              </div>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Assistant</span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-1"
            >
              ✕
            </button>
          </div>

          {/* Suggestions */}
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={12} />
              </motion.div>
              <span>Checking your progress...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/8 transition-colors"
                >
                  <span className="text-sm text-white/80 leading-snug flex-1">{s.text}</span>
                  {s.action_label && (
                    <button
                      onClick={() => handleAction(s)}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap shrink-0"
                    >
                      {s.action_label}
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => onOpenPanel?.()}
                className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors mt-1 self-start"
              >
                <ArrowRight size={11} />
                Ask me anything
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Mentoring/AssistantWidget.jsx
git commit -m "feat(assistant): create inline AssistantWidget component"
```

---

## Task 6: Enhance `AITalkPanel.jsx` — context header + memory

**Files:**
- Modify: `frontend/src/components/Mentoring/AITalkPanel.jsx`

Two changes:
1. Persist `conversationId` in `localStorage` so conversation continues across page refreshes
2. Add a slim context header showing the user's goal and progress when no message is active

- [ ] **Step 1: Add localStorage persistence for conversationId**

In `AITalkPanel.jsx`, find the `conversationId` state initialization (around line 134):

```javascript
const [conversationId, setConversationId] = useState(null);
```

Replace it with:

```javascript
const CONV_KEY = `planorah_conv_${contextSource}`;
const [conversationId, setConversationId] = useState(() => localStorage.getItem(CONV_KEY));
```

Then find the line where `conversationId` is set from the response (around line 160-161):

```javascript
if (data?.conversation_id) setConversationId(data.conversation_id);
```

Replace it with:

```javascript
if (data?.conversation_id) {
  setConversationId(data.conversation_id);
  localStorage.setItem(CONV_KEY, data.conversation_id);
}
```

Then in `handleNewChat` (around line 221), add the localStorage clear:

```javascript
const handleNewChat = useCallback(() => {
  setResult(null);
  setTranscript("");
  setError("");
  setConversationId(null);
  localStorage.removeItem(CONV_KEY);
}, [CONV_KEY]);
```

- [ ] **Step 2: Add context header with user context data**

After the existing state declarations (around line 136), add:

```javascript
const [userCtx, setUserCtx] = useState(null);

useEffect(() => {
  assistantPipelineService.getUserContext()
    .then(setUserCtx)
    .catch(() => {});
}, []);
```

Add the import for `useEffect` if it isn't already imported (it should be — check line 1).

- [ ] **Step 3: Add the context header to the render**

In the scrollable content section, find the empty state block that starts with:

```javascript
{!result && !loading && (
  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
```

Insert this context header block right before the `<div style={{ width: 46 ...` (the sparkle icon div):

```jsx
{userCtx && (userCtx.goal || userCtx.target_role) && (
  <div style={{
    marginBottom: 16,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  }}>
    {userCtx.target_role && (
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Target: {userCtx.target_role}
      </p>
    )}
    {userCtx.tasks_total > 0 && (
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
        {userCtx.progress_pct}% done · {userCtx.tasks_completed}/{userCtx.tasks_total} tasks · {userCtx.streak}d streak
      </p>
    )}
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Mentoring/AITalkPanel.jsx
git commit -m "feat(assistant): add conversation memory and context header to AITalkPanel"
```

---

## Task 7: Enhance `AIVoicePanel.jsx` — conversation memory

**Files:**
- Modify: `frontend/src/components/Mentoring/AIVoicePanel.jsx`

Same localStorage persistence pattern as Task 6, applied to the voice panel.

- [ ] **Step 1: Find where `conversationId` is stored in AIVoicePanel**

```bash
grep -n "conversationId\|conversation_id" frontend/src/components/Mentoring/AIVoicePanel.jsx | head -20
```

Note the line numbers where `conversationId` is declared and where it's set from the response.

- [ ] **Step 2: Add localStorage persistence**

Find the `useState` for `conversationId` (will look like `useState(null)` or similar). Replace it:

```javascript
const CONV_KEY = `planorah_conv_voice_${contextSource}`;
const [conversationId, setConversationId] = useState(() => localStorage.getItem(CONV_KEY));
```

Find every place where `setConversationId(...)` is called with an actual ID and add the localStorage write:

```javascript
setConversationId(id);
localStorage.setItem(CONV_KEY, id);
```

Find the reset/clear logic (usually in a `handleClose` or `handleReset` function) and add:

```javascript
localStorage.removeItem(CONV_KEY);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Mentoring/AIVoicePanel.jsx
git commit -m "feat(assistant): persist voice conversation ID across sessions"
```

---

## Task 8: Integrate `AssistantWidget` on Dashboard

**Files:**
- Modify: `frontend/src/components/Dashboard/Dashboard.jsx`

- [ ] **Step 1: Read the top of Dashboard.jsx to understand its structure**

```bash
head -60 frontend/src/components/Dashboard/Dashboard.jsx
```

Note the imports section and where the main content return begins.

- [ ] **Step 2: Add the import**

At the top of `Dashboard.jsx`, add:

```javascript
import AssistantWidget from '../Mentoring/AssistantWidget';
```

- [ ] **Step 3: Find the right insertion point**

Look for the outermost wrapper div of the page content (typically the first `<div className="...p-4...">` or similar). Insert the widget as the very first element inside the page content area:

```jsx
<AssistantWidget contextSource="dashboard" onOpenPanel={onOpenPanel} />
```

**Note:** `onOpenPanel` may not exist as a prop in Dashboard. If Dashboard doesn't have a way to open the panel, check if it has access to a state setter or context. If not, the widget's "Ask me anything" button can be wired with a fallback — set `onOpenPanel` to `undefined` and the button will simply not render the panel-open action (the navigate actions will still work).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Dashboard/Dashboard.jsx
git commit -m "feat(assistant): embed AssistantWidget on Dashboard"
```

---

## Task 9: Integrate `AssistantWidget` on Roadmap, Resume, and Interview pages

**Files:**
- Modify: `frontend/src/components/Roadmap/RoadmapView.jsx`
- Modify: `frontend/src/components/Resume/ResumeBuilder.jsx`
- Modify: `frontend/src/components/Interview/InterviewChat.jsx`

For each file, the pattern is identical: add import, embed widget at top of page content.

- [ ] **Step 1: Add widget to RoadmapView.jsx**

Add at top of file:
```javascript
import AssistantWidget from '../Mentoring/AssistantWidget';
```

Find the first content div in the return statement and insert as first child:
```jsx
<AssistantWidget contextSource="roadmap" onOpenPanel={undefined} />
```

- [ ] **Step 2: Add widget to ResumeBuilder.jsx**

Add at top of file:
```javascript
import AssistantWidget from '../Mentoring/AssistantWidget';
```

Find the first content div in the return statement and insert as first child:
```jsx
<AssistantWidget contextSource="resume" onOpenPanel={undefined} />
```

- [ ] **Step 3: Add widget to InterviewChat.jsx**

Add at top of file:
```javascript
import AssistantWidget from '../Mentoring/AssistantWidget';
```

Find the first content div in the return statement and insert as first child:
```jsx
<AssistantWidget contextSource="interview" onOpenPanel={undefined} />
```

- [ ] **Step 4: Find and integrate the Tasks page**

```bash
grep -rl "export default" frontend/src/components/Tasks/ | head -5
```

Open the main Tasks component, add import and widget with `contextSource="tasks"`.

- [ ] **Step 5: Commit all page integrations**

```bash
git add frontend/src/components/Roadmap/RoadmapView.jsx \
        frontend/src/components/Resume/ResumeBuilder.jsx \
        frontend/src/components/Interview/InterviewChat.jsx
git commit -m "feat(assistant): embed AssistantWidget on Roadmap, Resume, Interview pages"
```

```bash
# After adding Tasks page:
git add frontend/src/components/Tasks/
git commit -m "feat(assistant): embed AssistantWidget on Tasks page"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** user-context endpoint (Task 1-3), suggestions endpoint (Task 1-3), inline widget (Task 5), panel memory (Task 6-7), page integrations (Task 8-9) — all spec sections covered.
- [x] **Navigation awareness:** `APP_NAVIGATION` dict in `suggestions_service.py` covers all 12 app routes; Gemini prompt includes it explicitly.
- [x] **Placeholder scan:** No TBDs. Task 8 Step 3 has a conditional note about `onOpenPanel` — handled with `undefined` fallback documented.
- [x] **Type consistency:** `conversationId` localStorage key uses `planorah_conv_${contextSource}` in AITalkPanel and `planorah_conv_voice_${contextSource}` in AIVoicePanel — distinct, no collision.
- [x] **Fallback safety:** `suggestions_service.py` has `_fallback_suggestions` — if Gemini fails, widget still renders with static suggestions.
- [x] **Import for `useEffect` in AITalkPanel:** noted in Task 6 — verify it's already imported before adding.
