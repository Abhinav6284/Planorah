# Planorah Tutorial / Product Tour Plan

## Goal
Show new users exactly what Planorah can do — one feature at a time — like Notion, Linear, or Vercel onboarding.

---

## Architecture: Step-based Spotlight Tour

### Approach
- **No full-page blockers** — use a floating tooltip that spotlights (highlights) a specific element
- **Progressive disclosure** — show the tour only after onboarding (Quicky bot) is complete
- **Skippable at any step** — store `tutorial_step` in localStorage; never show it twice
- **5–7 steps max**

---

## Recommended Steps (in order)

| Step | Target Element | Tooltip Title | Tooltip Body |
|------|---------------|---------------|--------------|
| 1 | Dashboard header greeting | **Welcome to your Dashboard** | "This is your command center. See tasks, streaks, and your focus timer at a glance." |
| 2 | TodayExecution / Focus Task card | **Your Daily Mission** | "Each day Planorah picks the most important task for you. Hit Start Session to begin a focused sprint." |
| 3 | Sidebar → Learning Path | **Build a Learning Roadmap** | "Generate a personalized AI roadmap for any skill. Planorah breaks it into daily tasks automatically." |
| 4 | Sidebar → Study Platform | **Study Smarter** | "Upload your syllabus or create exam subjects. AI generates topic guides and tracks what's weak vs strong." |
| 5 | Layout FAB (bottom-right orb) | **Your AI Mentor** | "Click this any time to chat with your AI mentor (text) or do a live voice session. Available on every page." |
| 6 | Sidebar → Resume Builder | **Build an ATS Resume** | "Create and export ATS-optimized resumes. The AI Coach fills sections based on your roadmap progress." |
| 7 | Dashboard streak pill | **Keep your Streak** | "Log in daily and complete at least one task to build your streak. Consistency beats intensity." |

---

## Implementation Plan

### Phase 1 — TutorialOverlay component
**File:** `src/components/Onboarding/TutorialOverlay.jsx`

```
State:
  - currentStep (0-based index, -1 = hidden)
  - stored in localStorage as 'planorah_tutorial_step'

On mount:
  - If localStorage has 'tutorial_done' → skip entirely
  - Else resume from last step

Props each step has:
  - targetSelector (CSS selector of element to spotlight)
  - title, body
  - position: 'top' | 'bottom' | 'left' | 'right'

UI:
  - Dark overlay with a transparent "hole" punched over the target (using box-shadow trick)
  - Floating white card tooltip with arrow pointing at element
  - "Next" button, "Skip tour" link
  - Step indicator dots (e.g., 3 / 7)
```

### Phase 2 — Trigger in Layout.jsx
```jsx
// After onboarding completes, set sessionStorage flag
// Layout reads it on mount and starts tutorial at step 0
const tutorialDone = localStorage.getItem('planorah_tutorial_done');
if (!tutorialDone && onboardingComplete) {
  setTutorialActive(true);
}
```

### Phase 3 — Polish
- Smooth scroll to element if off-screen
- Animate tooltip in with framer-motion (opacity + y slide)
- Mobile: use bottom-sheet tooltip instead of floating card
- Dark mode: overlay adapts automatically

---

## AI Talk Section Architecture

### Current Architecture: **Dual-mode**

```
Mode 1 — Realtime (default)
User mic → AudioWorklet (PCM16, 16kHz) → WebSocket → Django voice_server.py
→ WebSocket proxy → Google Gemini Live API (wss://generativelanguage.googleapis.com)
← Audio response (24kHz) ← resampled in frontend
+ Screen captures via html2canvas every 12s
+ VAD + barge-in support

Mode 2 — STT → LLM → TTS Pipeline (if REACT_APP_AI_PIPELINE_ENABLED=true)
User mic → MediaRecorder (audio/webm) → POST /assistant/v2/turn/
→ Backend: STT → LLM (Claude/Gemini) → TTS
← Response: {transcript, assistant_text, action_proposals, tts_audio}
← Frontend plays TTS audio
```

### Current Problems & Fixes Needed

1. **Voice panel feels cold** — no personality, no greeting on open
   - Fix: Show a "Hello! I'm your AI mentor." intro message when panel opens

2. **No conversation history** — voice sessions are stateless
   - Fix: Show last 3 transcript lines in the voice panel during session

3. **No visual feedback during thinking** — user doesn't know if AI is processing
   - Fix: Add "thinking" state with pulsing orb animation

4. **Pipeline mode lacks streaming** — user waits for full response
   - Fix: Stream assistant_text token by token using SSE

5. **Text chat (AITalkPanel) doesn't remember context between messages**
   - Already partially fixed via conversationId — ensure it's persisted in sessionStorage

### Immediate Improvements for AI Talk

- [ ] Add greeting message on panel open
- [ ] Show live transcript during voice (currently works, verify UI)
- [ ] Add "Listening..." / "Thinking..." / "Speaking..." status indicators with color
- [ ] Persist conversationId in sessionStorage per-page
- [ ] Add conversation history scroll in text chat (last 5 Q&A pairs visible)
- [ ] Voice: add push-to-talk fallback for poor connections

---

## Summary of All Bugs Fixed in This Session

| # | Bug | File Changed |
|---|-----|-------------|
| 1 | Session expired on CompleteProfile (wrong storage key) | `VerifyOTP.jsx` — redirect to `/onboarding` directly |
| 2 | CompleteProfile reads only localStorage, misses sessionStorage tokens | `CompleteProfile.jsx` — use `getAccessToken()` |
| 3 | New user dashboard shows generic AI task instead of "Create task" CTA | `TodayExecution.jsx` — empty state with links |
| 4 | FAB brain icon — no visual identity | `Layout.jsx` — animated AI orb |
| 5 | AITalkPanel shows "Mentor Studio Legacy" | `AITalkPanel.jsx` — clean label "AI Mentor / Text Chat" |
