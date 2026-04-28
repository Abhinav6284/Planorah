# AI Mentor Widget Redesign — Specification

**Date:** 2026-04-11  
**Status:** Approved  
**Component:** `frontend/src/components/AIMentorWidget.jsx`

## Overview

Redesign the AI Mentor Widget header and quick actions to improve usability. The widget now supports three expand modes (larger panel, fullscreen modal, new tab) accessible via a cycling expand button. Quick actions are reduced from 3 to 2 per page, with intentional categorization to guide users without overwhelming the interface.

## Key Changes

### 1. Header Buttons

**Current state:** New Chat, Edit, Expand (disabled), Minimize  
**New state:** New Chat, Expand, Minimize

| Button | Action | Notes |
|--------|--------|-------|
| **New AI chat** | Clear chat + show dropdown to switch context | Essential; keeps existing behavior |
| **⛶ Expand** | Cycle through three modes | New behavior; replaces disabled expand button |
| **−Minimize** | Close the widget panel (can reopen from FAB) | Keep as-is |

**Remove:** Edit button (no use case identified)

### 2. Expand Button Behavior (Cycling)

Clicking the expand button cycles through four states, returning to default after mode 3:

1. **Mode 1: Default floating panel** (400px width, floating card)
2. **Mode 2: Larger floating panel** (600px width, more visible)
3. **Mode 3: Fullscreen modal** (fills screen, same widget UI, modal overlay)
4. **Mode 4: New tab** (opens chat in separate browser tab)
5. **Mode 5: Back to Mode 1** (cycle repeats)

**Constraint:** None of these modes should interfere with normal page usage.

- Modes 1 & 2: Still floating, user can interact with page behind widget
- Mode 3: Full modal overlay, but modal can be minimized to return to page
- Mode 4: Separate tab, original page is untouched

### 3. Context Chip

**Current behavior:** Display page context (e.g., "⚡ Dashboard")  
**Change:** Keep as-is

The context chip remains visible in the input area, showing the current page source. No dropdown; it's informational only.

### 4. Quick Actions (Reduced)

**Current behavior:** 3 quick action buttons per page  
**New behavior:** 2 quick action buttons per page

**Categorization Strategy:**
- **Action 1:** "What should I..." — Insight/analysis question
- **Action 2:** "How do I..." OR page-specific guidance — Actionable help

**Examples by page:**

| Page | Action 1 | Action 2 |
|------|----------|----------|
| Dashboard | "What should I focus on today?" | "Analyze my progress" |
| Roadmap | "Show my progress" | "What should I study next?" |
| Lab | "Explain the concept" | "Help me set up this experiment" |
| Interview | "Practice common questions" | "Behavioral interview tips" |
| Resume | "Improve my resume content" | "ATS optimization tips" |
| Projects | "Suggest improvements" | "How can I level up?" |

**Fallback:** If a page doesn't fit this pattern perfectly, pick the two most contextually relevant actions from the existing `QUICK_ACTIONS_BY_SOURCE`.

### 5. Visual & Interaction Details

- **Widget UI:** Same component code across all expand modes; only CSS changes for sizing/positioning
- **Transitions:** Smooth animations when cycling between modes (Framer Motion)
- **State management:** Track current expand mode in component state
- **Input focus:** Auto-focus textarea when panel opens (existing behavior; keep)
- **Scrolling:** Auto-scroll to latest message (existing behavior; keep)

## Data Structure Changes

### `QUICK_ACTIONS_BY_SOURCE` Refactor

Reduce from 3 to 2 actions per source:

```javascript
const QUICK_ACTIONS_BY_SOURCE = {
  dashboard: [
    { emoji: '⚡', label: 'What should I focus on today?' },
    { emoji: '📊', label: 'Analyze my progress' },
  ],
  roadmap: [
    { emoji: '📊', label: 'Show my progress' },
    { emoji: '⏭️', label: 'What should I study next?' },
  ],
  // ... etc for all pages
};
```

### Add Expand Mode State

```javascript
const [expandMode, setExpandMode] = useState('default'); // 'default' | 'larger' | 'fullscreen' | 'newtab'
```

## Implementation Notes

### Header Changes
- Remove edit button from JSX
- Update expand button click handler to cycle through modes
- Update minimize button (already works)

### Panel Sizing
- **Default:** `width: 400px, maxHeight: 530px` (current)
- **Larger:** `width: 600px, maxHeight: 600px`
- **Fullscreen:** `width: 100vw, height: 100vh, position: fixed, inset: 0`

### New Tab Mode
- Should open the same chat UI in a new browser tab
- May need a separate route (e.g., `/chat?mode=standalone`) or a standalone HTML view
- User's current chat should carry over (share state via sessionStorage or API)

### Quick Actions Display
- Update rendering logic to show only first 2 actions from `getQuickActions()`
- No other changes to quick action behavior

## Testing Checklist

- [ ] Expand button cycles through all four modes correctly
- [ ] Minimize button works in all expand modes
- [ ] New Chat button clears and shows quick actions in all modes
- [ ] Quick actions display exactly 2 per page
- [ ] Fullscreen modal can be minimized and returns to page
- [ ] New tab mode opens properly and persists chat
- [ ] Page interaction still works when widget is in default/larger modes
- [ ] Animations are smooth on all transitions
- [ ] Context chip displays correctly in all modes
- [ ] Input auto-focus works in all modes

## Future Enhancements

- User preference for default expand mode (stored in localStorage)
- Drag-to-reposition for default/larger modes
- Resizable widget (user can drag edges to resize)
- Keyboard shortcut to toggle expand modes

---

**Approved by:** User  
**Design review:** Visual companion mockups shown and validated  
**Ready for implementation:** Yes
