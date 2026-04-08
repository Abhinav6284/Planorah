# Unified AI Assistant Redesign
**Date:** 2026-04-08  
**Status:** Design Approved  
**Priority:** P1 (Performance + UX Improvement)

---

## Overview

Replace the current heavy, full-screen AI modal experience (AITalkPanel + AIVoicePanel) with a single, lightweight, premium floating assistant that stays out of the way while users work. The new component provides smooth transitions between text and voice modes, animated waveform visualizations, glassmorphism aesthetic, and non-blocking workflow integration.

**Goal:** Make AI assistance feel like a premium feature (like Eleven Labs) while keeping performance lightweight and user workflow unblocked.

---

## Problem Statement

**Current Issues:**
1. **Full-screen takeover** — AITalkPanel takes over entire viewport, blocking user's work
2. **Sluggish performance** — Heavy backdrop blur animations, complex state management, multiple redundant components
3. **Blocking interaction model** — Can't chat with AI while viewing dashboard or working on tasks
4. **Fragmented UX** — Separate buttons for "AI Talk" (voice) and "AI Chat" (text) with different interfaces
5. **Heavy animations** — Framer Motion with complex transitions causing lag on lower-end devices

**User Impact:**
- Users abandon AI assistance because it interrupts workflow
- Voice feature feels separate and disconnected
- Perception of app as "slow" even though core features are fast

---

## Design Goals

1. **Non-blocking:** Float in corner, always accessible, never interrupts work
2. **Premium feel:** Glassmorphism, smooth animations, polished micro-interactions
3. **Lightweight:** Minimal re-renders, CSS animations only, lazy-loaded voice module
4. **Unified:** Text and voice in one cohesive interface
5. **Fast:** <100ms expand animation, smooth 60fps transitions, no jank
6. **Responsive:** Works on mobile (slides up from bottom), tablet (corner panel), desktop (floating bubble)

---

## Architecture

### Component Hierarchy

```
UnifiedAIAssistant (container, manages all state & logic)
├── CompactWidget (floating bubble, 70×70px)
├── ExpandedPanel (glassmorphism container, 380×500px on desktop)
│   ├── PanelHeader (mode toggle: Text/Voice, close button)
│   ├── ContentArea (dynamic based on mode)
│   │   ├── TextChat
│   │   │   ├── MessageList (memoized)
│   │   │   └── TextInput
│   │   └── VoicePanel
│   │       ├── WaveformVisualizer (animated bars)
│   │       ├── VoiceSelector (Aoede, Charon, etc.)
│   │       └── VoiceControls (Stop, Switch to Text)
│   └── BottomActions (Voice toggle, Expand full, Close)
└── useVoiceSession hook (reused from existing code)
```

**Single Responsibility:**
- `UnifiedAIAssistant` — State, transitions, orchestration
- `CompactWidget` — Expand/minimize button, click handler
- `ExpandedPanel` — Layout and styling for glass effect
- `TextChat` — Message rendering and input (memoized to prevent re-renders)
- `VoicePanel` — Waveform visualization and voice controls (lazy-loaded)

### State Management

**Local Component State:**
```javascript
const [isExpanded, setIsExpanded] = useState(false);
const [mode, setMode] = useState('text'); // 'text' | 'voice'
const [messages, setMessages] = useState([...]);
const [isListening, setIsListening] = useState(false);
const [conversationId, setConversationId] = useState(null);
const [loading, setLoading] = useState(false);
```

**No Context/Redux needed:** All state local to component (self-contained floating widget).

### Styling Approach

**Glassmorphism:**
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.6);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
```

**Animations (CSS only):**
- Expand/collapse: `transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Messages fade-in: `@keyframes fadeIn { from: opacity 0, y: 8px; to: opacity 1, y: 0 }`
- Waveform pulse: `@keyframes pulse { 0%: scaleY(0.3); 50%: scaleY(1); }`
- No Framer Motion (too heavy for simple transitions)

**Gradients:**
- Primary: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple/indigo, matches Planorah)
- Subtle: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)`

---

## States & Interactions

### State 1: Compact (Floating Bubble)
- **Size:** 70×70px circle
- **Position:** Fixed bottom-right corner (with 24px margin)
- **Display:** Purple gradient bubble with chat icon
- **Hover:** Scale 1.02, shadow expand
- **Click:** Expand smoothly to panel (0.3s animation)
- **z-index:** 50 (above most content, below modals)

### State 2: Expanded Text Mode
- **Size:** 380×500px (desktop), 340×400px (tablet), 90vw×max (mobile)
- **Position:** Fixed bottom-right, slides up from compact
- **Content:** Message history + input field
- **Messages:** 
  - User: right-aligned, purple gradient background
  - Assistant: left-aligned, subtle glassmorphic background
  - Fade-in animation (0.15s stagger)
- **Input:** Auto-focus when expanded, Enter to send (Cmd/Ctrl+Enter for new line)
- **Mode toggle:** Text/Voice button in header

### State 3: Expanded Voice Mode
- **Size:** Same as text (380×500px, responsive)
- **Content:** Animated waveform visualization
- **Waveform:** 7 animated bars (0.6s pulse cycle, staggered 0.1s apart)
- **Voice selector:** Grid of voice options (Aoede, Charon, Fenrir, Kore, Puck)
- **Recording state:** "LISTENING..." label with animated waveform
- **Controls:** Stop Recording, Switch to Text buttons
- **Visualizer updates:** Real-time from audio input (Web Audio API)

### Transitions
- **Compact ↔ Expanded:** 0.3s smooth size/opacity transition
- **Text ↔ Voice:** 0.2s fade + slide (content swaps smoothly)
- **Message arrival:** 0.15s fade-in with 40ms stagger per message
- **Collapse animation:** Reverse of expand (0.25s)

---

## Performance Optimizations

1. **Lazy Load Voice Module**
   - Voice logic only loads when user clicks "Voice" button
   - Saves ~50KB on initial page load
   - useVoiceSession hook imported conditionally

2. **Memoization**
   - `TextChat` wrapped in `React.memo(TextChat, (prev, next) => prev.messages === next.messages)`
   - Prevents re-render when parent state changes unrelated to messages
   - VoicePanel memoized similarly

3. **CSS-only Animations**
   - Waveform pulse: pure CSS @keyframes (GPU accelerated, 60fps)
   - Expand/collapse: CSS transitions with cubic-bezier easing
   - No requestAnimationFrame or JS-driven animations

4. **Backdrop Blur**
   - Hardware-accelerated CSS `backdrop-filter: blur(20px)`
   - Much lighter than canvas blur; GPU handles it
   - Degrades gracefully on older browsers (just opacity)

5. **Debounced Input**
   - Text input debounced 300ms before sending to API
   - Prevents excessive API calls on fast typing
   - Visual feedback shows "typing..." state

6. **Message Virtualization** (Future)
   - If chat history grows >50 messages, implement virtual scrolling
   - Only render visible messages + 5 above/below
   - Keeps scroll smooth even with long conversations

---

## API & Service Integration

**Reuse Existing Services:**
- `assistantPipelineService.sendTextTurn()` — text mode (already in AITalkPanel)
- `mentoringService.createSession()` — fallback if pipeline fails
- `useVoiceSession` hook — voice recording & waveform (from AIVoicePanel)
- `assistantPipelineService.confirmAction()` — action proposals

**No Breaking Changes:**
- New component is additive (doesn't modify existing services)
- Old AITalkPanel/AIVoicePanel can stay until migration complete
- Drop-in replacement in Layout.jsx

---

## Responsive Design

| Breakpoint | Size | Position | Behavior |
|---|---|---|---|
| **Desktop (1024px+)** | 380×500px | Bottom-right, floats over content | Stays in corner, doesn't reflow page |
| **Tablet (768-1023px)** | 340×400px | Bottom-right with larger safe margins | Shrinks to fit, stays accessible |
| **Mobile (<768px)** | 90vw × auto | Bottom of screen, full width | Slides up from bottom above keyboard, can minimize |

**Mobile Behavior:**
- Expands from bottom of viewport instead of corner
- Stays above keyboard (reposition on keyboard show/hide)
- Can be swiped down to minimize
- Full width for easier touch interaction

---

## Accessibility & Constraints

1. **Dark Mode Support** — All colors have dark mode counterparts (use `dark:` Tailwind classes)
2. **Motion Preferences** — Respect `prefers-reduced-motion` (disable animations if enabled)
3. **Keyboard Navigation:**
   - Tab through buttons, input field
   - Enter to send message
   - Escape to close panel
   - Cmd/Ctrl+Enter for new line in text area
4. **Screen Readers:**
   - Messages announced as they arrive
   - Buttons labeled clearly (aria-label if needed)
   - Voice mode: "Recording..." announcement
5. **Z-index Strategy:** Use 50 for compact widget, 51 for expanded panel (always above, never hidden)

---

## Data Flow

### Text Mode
```
User types message → debounced input (300ms) → 
  → assistantPipelineService.sendTextTurn() → 
  → response with assistant_text + action_proposals → 
  → append to messages state → 
  → MessageList re-renders with fade-in animation
```

### Voice Mode
```
User clicks "Voice" → lazy-load useVoiceSession → 
  → Web Audio API captures input → 
  → WaveformVisualizer updates in real-time → 
  → On "Stop Recording" → send audio to backend → 
  → transcription + assistant response → 
  → display as new message → 
  → show voice selector buttons again
```

---

## File Structure

```
frontend/src/components/
├── Assistant/
│   └── UnifiedAIAssistant.jsx          (main component)
│       ├── useUnifiedAIState.js        (custom hook for state logic)
│       └── styles.module.css           (glassmorphism & animations)
├── Assistant/subcomponents/
│   ├── CompactWidget.jsx               (floating bubble)
│   ├── ExpandedPanel.jsx               (container)
│   ├── TextChat.jsx                    (text mode, memoized)
│   ├── VoicePanel.jsx                  (voice mode, memoized, lazy-loaded)
│   └── WaveformVisualizer.jsx          (animated bars)
└── Layout.jsx                          (add <UnifiedAIAssistant /> here)
```

---

## Implementation Phases

### Phase 1: Core Component (Week 1)
- [ ] Build UnifiedAIAssistant with compact & expanded states
- [ ] Implement smooth expand/collapse animation (CSS)
- [ ] Add text mode with message rendering
- [ ] Integrate with assistantPipelineService

### Phase 2: Voice Mode (Week 2)
- [ ] Lazy-load useVoiceSession hook
- [ ] Build WaveformVisualizer with CSS animations
- [ ] Implement voice-to-text conversion
- [ ] Add voice selector UI

### Phase 3: Polish & Performance (Week 2-3)
- [ ] Optimize for mobile (responsive layout)
- [ ] Add dark mode support
- [ ] Test on low-end devices (performance profiling)
- [ ] Implement message virtualization if needed
- [ ] Accessibility audit (WCAG 2.1 AA)

### Phase 4: Migration (Week 3)
- [ ] Deploy alongside old components
- [ ] Collect user feedback
- [ ] Remove old AITalkPanel & AIVoicePanel
- [ ] Update any links/references

---

## Success Metrics

- **Performance:** Panel expands in <100ms, no layout jank
- **Adoption:** Users keeping panel open during work (time-on-screen metric)
- **Engagement:** 2x more voice interactions (vs current separate button)
- **User Feedback:** "Feels premium", "doesn't interrupt my workflow"
- **Mobile:** Panel responsive on all devices, accessible touch targets (48px+)

---

## Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Backdrop blur too heavy on older browsers | Graceful degradation: just use opacity |
| Voice module doesn't lazy-load properly | Test with code splitting, monitor bundle size |
| Animation jank on low-end mobile | Profile with Chrome DevTools, use CSS animations only |
| z-index conflicts with other modals | Document z-index strategy, test with modals |
| Voice recording fails on some devices | Fallback to text mode, clear error message |

---

## Dependencies & Libraries

- **React** (existing)
- **Framer Motion** (remove for animations, use CSS instead)
- **Web Audio API** (for waveform visualization, browser native)
- **Existing services:** assistantPipelineService, mentoringService, useVoiceSession

**No new external dependencies required.**

---

## Notes for Implementation

1. **Remove Framer Motion from this component** — Use CSS transitions/animations for performance
2. **Reuse useVoiceSession hook** — Don't rebuild voice logic; import from existing AIVoicePanel
3. **Keep old components until migration** — Deploy new component, let old ones coexist, then remove
4. **Test on real devices** — Especially mobile and low-end devices (Pixel 4a, iPhone SE)
5. **Dark mode must work** — Test with dark mode enabled from day 1
6. **Monitor performance** — Use Lighthouse, Chrome DevTools to verify <100ms expand animation
