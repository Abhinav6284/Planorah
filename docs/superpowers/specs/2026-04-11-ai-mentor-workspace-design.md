# AI Mentor Workspace — Complete Design Specification

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** Full workspace redesign (all phases: layout, editor, AI mentor, roadmap, dashboard)  
**Tech Stack:** React 18 + Tailwind CSS + Zustand + Framer Motion  

---

## Overview

A Notion-inspired, AI-powered student mentor workspace that combines:
- **Block-based note editor** (Notion-like with slash commands, drag-drop)
- **Floating AI mentor panel** (context-aware chat with expandable modes)
- **Visual roadmap system** (learning paths with progress tracking)
- **Progress dashboard** (charts, streaks, completion metrics)
- **Responsive sidebar + navbar** (navigation, search, user profile)

All features integrate with existing Django backend APIs for real data and AI-powered suggestions.

---

## 1. Architecture

### 1.1 High-Level Structure

```
Workspace (Container)
├── Sidebar (Navigation)
├── Navbar (Search, Profile, Theme)
└── Main Content Area (Dynamic)
    ├── Dashboard View
    ├── Roadmap View
    ├── Notes/Editor View
    ├── Progress View
    └── Settings View
    
└── AI Mentor Panel (Floating, Expandable)
```

### 1.2 Component Organization

**Folder Structure:**

```
frontend/src/
├── components/
│   ├── Workspace/
│   │   ├── WorkspaceLayout.jsx          # Main container + routing
│   │   └── WorkspaceContext.jsx         # Shared workspace context
│   │
│   ├── Sidebar/
│   │   ├── Sidebar.jsx                  # Left navigation
│   │   ├── NavItem.jsx                  # Navigation item
│   │   └── SidebarToggle.jsx            # Collapse button
│   │
│   ├── Navbar/
│   │   ├── Navbar.jsx                   # Top bar container
│   │   ├── SearchBar.jsx                # Global search
│   │   ├── UserMenu.jsx                 # Profile dropdown
│   │   └── ThemeToggle.jsx              # Dark/light switch
│   │
│   ├── BlockEditor/
│   │   ├── BlockEditor.jsx              # Editor container
│   │   ├── Block.jsx                    # Block wrapper
│   │   ├── BlockToolbar.jsx             # Inline formatting
│   │   ├── SlashCommand.jsx             # "/" command menu
│   │   ├── blocks/
│   │   │   ├── TextBlock.jsx
│   │   │   ├── HeadingBlock.jsx
│   │   │   ├── BulletListBlock.jsx
│   │   │   ├── NumberedListBlock.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   ├── ChecklistBlock.jsx
│   │   │   ├── ToggleBlock.jsx
│   │   │   ├── QuoteBlock.jsx
│   │   │   └── ImageBlock.jsx
│   │   └── EditorProvider.jsx           # Editor state/context
│   │
│   ├── AIMentor/
│   │   ├── MentorPanel.jsx              # Main panel wrapper
│   │   ├── MentorChat.jsx               # Chat messages area
│   │   ├── MentorInput.jsx              # Input textarea
│   │   ├── ChatMessage.jsx              # Single message
│   │   ├── QuickActions.jsx             # Quick action buttons
│   │   ├── ContextChip.jsx              # Context indicator
│   │   ├── ExpandButton.jsx             # Mode cycling button
│   │   └── MentorProvider.jsx           # Mentor state
│   │
│   ├── Roadmap/
│   │   ├── RoadmapView.jsx              # Roadmap display
│   │   ├── RoadmapNode.jsx              # Single node
│   │   ├── RoadmapDetail.jsx            # Expanded detail
│   │   ├── StatusBadge.jsx              # Status indicator
│   │   └── RoadmapProvider.jsx          # Roadmap state
│   │
│   ├── Dashboard/
│   │   ├── DashboardView.jsx            # Dashboard container
│   │   ├── StatsCard.jsx                # Metric card
│   │   ├── ProgressChart.jsx            # Activity chart
│   │   ├── StreakWidget.jsx             # Streak counter
│   │   ├── TasksWidget.jsx              # Today's tasks
│   │   └── DashboardProvider.jsx        # Dashboard state
│   │
│   └── shared/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       ├── Loader.jsx
│       ├── Toast.jsx
│       ├── Tooltip.jsx
│       └── ThemeProvider.jsx
│
├── stores/
│   ├── authStore.js                     # User authentication
│   ├── workspaceStore.js                # Workspace UI state
│   ├── editorStore.js                   # Block editor state
│   ├── mentorStore.js                   # AI mentor state
│   ├── roadmapStore.js                  # Roadmap state
│   └── dashboardStore.js                # Dashboard state
│
├── hooks/
│   ├── useAPI.js                        # API requests with error handling
│   ├── useEditor.js                     # Editor logic (add/delete/update blocks)
│   ├── useMentor.js                     # Mentor logic (send message, fetch history)
│   ├── useTheme.js                      # Theme toggle
│   └── useDebounce.js                   # Debounced save
│
├── services/
│   ├── api.js                           # Axios instance + config
│   ├── mentorService.js                 # AI mentor API calls
│   ├── roadmapService.js                # Roadmap API calls
│   ├── dashboardService.js              # Dashboard API calls
│   └── editorService.js                 # Editor save/load
│
├── styles/
│   ├── tailwind.config.js               # Tailwind configuration
│   ├── globals.css                      # Global styles + CSS variables
│   └── animations.css                   # Custom Framer Motion animations
│
└── App.jsx
```

---

## 2. Zustand State Management

Each feature has its own store for clarity and modularity.

### 2.1 workspaceStore.js

```javascript
export const useWorkspaceStore = create((set) => ({
  // UI State
  sidebarOpen: true,
  currentSection: 'dashboard', // 'dashboard' | 'roadmap' | 'notes' | 'mentor' | 'progress' | 'settings'
  theme: 'light', // 'light' | 'dark'
  
  // User
  user: null,
  isAuthenticated: false,
  
  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentSection: (section) => set({ currentSection: section }),
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
```

### 2.2 editorStore.js

```javascript
export const useEditorStore = create((set) => ({
  // Document state
  blocks: [], // Array of { id, type, content, children }
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  
  // Actions
  addBlock: (type, content) => set((state) => ({
    blocks: [...state.blocks, { id: generateId(), type, content }],
    isDirty: true,
  })),
  updateBlock: (id, content) => set((state) => ({
    blocks: state.blocks.map((b) => b.id === id ? { ...b, content } : b),
    isDirty: true,
  })),
  deleteBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id),
    isDirty: true,
  })),
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  setSaving: (saving) => set({ isSaving: saving }),
  markSaved: () => set({ isDirty: false, lastSaved: new Date(), isSaving: false }),
}));
```

### 2.3 mentorStore.js

```javascript
export const useMentorStore = create((set) => ({
  // Chat state
  messages: [], // Array of { id, role: 'user' | 'assistant', content, timestamp }
  isLoading: false,
  
  // Expand modes
  expandMode: 'default', // 'default' | 'larger' | 'fullscreen' | 'newtab'
  
  // Context
  currentContext: 'dashboard', // Page context for quick actions
  quickActions: [],
  
  // Actions
  addMessage: (role, content) => set((state) => ({
    messages: [...state.messages, {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    }],
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  cycleExpandMode: () => set((state) => {
    const modes = ['default', 'larger', 'fullscreen', 'newtab'];
    const currentIndex = modes.indexOf(state.expandMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    return { expandMode: nextMode };
  }),
  setContext: (context, actions) => set({ currentContext: context, quickActions: actions }),
  clearMessages: () => set({ messages: [] }),
}));
```

### 2.4 roadmapStore.js

```javascript
export const useRoadmapStore = create((set) => ({
  // Roadmap data
  roadmaps: [],
  selectedRoadmapId: null,
  nodes: [], // Learning steps
  
  // Progress
  progress: 0,
  
  // Actions
  setRoadmaps: (roadmaps) => set({ roadmaps }),
  selectRoadmap: (id) => set({ selectedRoadmapId: id }),
  setNodes: (nodes) => set({ nodes }),
  updateNodeStatus: (nodeId, status) => set((state) => ({
    nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, status } : n),
  })),
  setProgress: (progress) => set({ progress }),
}));
```

### 2.5 dashboardStore.js

```javascript
export const useDashboardStore = create((set) => ({
  // Stats
  stats: {
    currentStreak: 0,
    tasksCompletedToday: 0,
    overallCompletion: 0,
  },
  
  // Chart data
  chartData: [], // Activity data for past 7/30 days
  isLoading: false,
  
  // Actions
  setStats: (stats) => set({ stats }),
  setChartData: (data) => set({ chartData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## 3. Block Editor Specification

### 3.1 Supported Block Types

| Type | Description | Example |
|------|-------------|---------|
| **Text** | Paragraph text | Regular content |
| **Heading** | H1, H2, H3 | Section titles |
| **Bullet List** | Unordered list | Points, ideas |
| **Numbered List** | Ordered list | Steps, sequences |
| **Code** | Code block with syntax highlighting | Programming snippets |
| **Checklist** | Checkbox list | Tasks, todos |
| **Toggle** | Collapsible section | Hide/show content |
| **Quote** | Blockquote | Cited content |
| **Image** | Image embed | Visual content |

### 3.2 Block Structure (in Zustand)

```javascript
{
  id: string,           // Unique identifier
  type: string,         // 'text' | 'heading' | 'bullet' | ...
  content: string,      // Block text content
  metadata: {
    level?: 1-3,        // For headings
    language?: 'js',    // For code blocks
    isChecked?: false,  // For checklist
  },
  children?: Block[],   // For nested structures (toggle, indented lists)
  createdAt: Date,
  updatedAt: Date,
}
```

### 3.3 Editor Interactions

**Keyboard Shortcuts:**
- `/ ` → Open command palette (suggest block types)
- `Cmd/Ctrl + B` → Bold
- `Cmd/Ctrl + I` → Italic
- `Cmd/Ctrl + K` → Insert link
- `Backspace` (on empty line) → Delete block
- `Cmd/Ctrl + Enter` → Submit (save)
- `Tab` → Indent block
- `Shift + Tab` → Unindent block

**Mouse Interactions:**
- Click `+` icon left of block → Add new block
- Drag handle → Reorder blocks
- Select text → Show inline formatting toolbar

### 3.4 Auto-Save

- Debounce timer: 30 seconds
- On change: set `isDirty: true`
- After 30s of no changes: POST to `/api/notes/save/`
- Show "Saved at X:XX" indicator
- If error: show toast with retry button

---

## 4. AI Mentor Panel Specification

### 4.1 Panel Modes

The expand button cycles through modes:

| Mode | Size | Behavior | Use Case |
|------|------|----------|----------|
| **Default** | 400px wide | Floating card, right side | Quick reference |
| **Larger** | 600px wide | Wider floating card | Better readability |
| **Fullscreen** | 100vw × 100vh | Modal overlay | Focused chat |
| **New Tab** | Browser tab | Separate window | Multi-screen |

### 4.2 Panel Components

**Header:**
- Context chip (e.g., "📊 Dashboard")
- "New Chat" button (clears messages, shows quick actions)
- Expand button (cycles modes)
- Minimize button (collapses panel)

**Message Area:**
- Auto-scroll to latest message
- Typing indicator while loading
- Differentiate user (right) vs assistant (left) messages
- Timestamp on messages

**Input Area:**
- Textarea (auto-expand on input)
- Send button or Ctrl+Enter to submit
- Character count (optional)

**Quick Actions (2 per page):**

| Page | Action 1 | Action 2 |
|------|----------|----------|
| Dashboard | "What should I focus on today?" | "Analyze my progress" |
| Roadmap | "Show my progress" | "What should I study next?" |
| Notes | "Summarize my notes" | "What's missing?" |
| Progress | "How am I doing?" | "Suggest improvements" |
| Settings | "Help with settings" | "Export my data" |

### 4.3 Quick Actions Data Structure

```javascript
const QUICK_ACTIONS_BY_SECTION = {
  dashboard: [
    { emoji: '⚡', label: 'What should I focus on today?', prompt: '...' },
    { emoji: '📊', label: 'Analyze my progress', prompt: '...' },
  ],
  roadmap: [
    { emoji: '📊', label: 'Show my progress', prompt: '...' },
    { emoji: '⏭️', label: 'What should I study next?', prompt: '...' },
  ],
  // ... etc
};
```

### 4.4 Chat Flow

1. User types message in textarea
2. User clicks send or presses `Ctrl+Enter`
3. `mentorStore.addMessage('user', text)` → local update
4. `POST /api/ai_mentoring/chat/` with message
5. Show typing indicator
6. Receive response
7. `mentorStore.addMessage('assistant', response)` → append to chat
8. Auto-scroll to latest message

---

## 5. Roadmap System Specification

### 5.1 Roadmap Structure

```javascript
{
  id: string,
  title: string,
  description: string,
  createdAt: Date,
  nodes: [
    {
      id: string,
      title: string,
      description: string,
      status: 'not_started' | 'in_progress' | 'completed',
      order: number,
      resources: [{ type: 'link' | 'video', url, title }],
      estimatedHours: number,
      completedAt?: Date,
    }
  ],
  progress: number, // 0-100
}
```

### 5.2 Roadmap View

**Display Options:**
- Linear list (top-down, current view)
- Visual timeline (optional future)
- Tree structure (optional future)

**Node Status Indicators:**
- 🔘 Not Started (gray)
- 🟡 In Progress (yellow/blue)
- ✅ Completed (green)

**Interactions:**
- Click node → expand detail panel
- Toggle status → update backend
- Drag to reorder (optional)

### 5.3 Node Detail Panel

Shows:
- Full title and description
- Status toggle buttons
- Resources (links, videos)
- Estimated time
- Completion date
- "Ask mentor" button (opens AI mentor with node context)

---

## 6. Dashboard Specification

### 6.1 Metrics

**Streak:**
- Current consecutive days of activity
- Display: "5 🔥" or similar
- Reset after 1 day missed

**Today's Tasks:**
- Tasks completed today
- Display: "3/8 completed"

**Overall Completion:**
- % of all roadmap nodes completed
- Display: Circular or linear progress bar

**Weekly Activity Chart:**
- Line chart showing activity per day
- 7 or 30 day options
- X-axis: dates, Y-axis: activity count

### 6.2 Components

```
Dashboard
├── Header ("Welcome back, [Name]")
├── Quick Stats Row
│   ├── Streak Widget (🔥 5 days)
│   ├── Tasks Widget (3/8 completed)
│   └── Completion Widget (45%)
└── Charts Section
    └── Weekly Activity (line chart)
```

### 6.3 Data Source

- `/api/analytics/dashboard/` → stats
- `/api/analytics/activity_chart/?days=7` → chart data
- Auto-refresh every 60 seconds

---

## 7. Design System

### 7.1 Colors

**Light Mode:**
```css
--bg-primary: #ffffff;      /* Main background */
--bg-secondary: #f5f5f5;    /* Cards, panels */
--bg-tertiary: #efefef;    /* Hover, select */

--text-primary: #1f2937;    /* Main text */
--text-secondary: #6b7280;  /* Secondary text */
--text-tertiary: #9ca3af;   /* Placeholder, hint */

--border: #e5e7eb;          /* Borders */

--accent-indigo: #4f46e5;   /* Primary action */
--accent-blue: #3b82f6;     /* Secondary action */
--success: #10b981;         /* Completed, success */
--warning: #f59e0b;         /* In progress, warning */
--error: #ef4444;           /* Error, danger */
```

**Dark Mode:**
```css
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-tertiary: #2d2d2d;

--text-primary: #f3f4f6;
--text-secondary: #d1d5db;
--text-tertiary: #9ca3af;

--border: #3f3f3f;

/* Accents same as light mode */
```

### 7.2 Typography

**Font Family:** Inter (Tailwind default)

**Sizes:**
- H1: 2xl (32px), font-bold
- H2: xl (20px), font-semibold
- H3: lg (18px), font-semibold
- Body: base (16px), font-normal
- Small: sm (14px), font-normal
- Tiny: xs (12px), font-normal

### 7.3 Spacing

**Grid:** 4px base unit (Tailwind standard)
- p-1 = 4px, p-2 = 8px, p-4 = 16px, p-6 = 24px, p-8 = 32px

**Common Spacing:**
- Sidebar: w-64 (256px), collapsible to w-16 (64px)
- Card padding: p-4 or p-6
- Section gaps: gap-4, gap-6
- Margins: m-2, m-4

### 7.4 Shadows & Borders

**Shadows:**
- `shadow-sm`: Subtle (buttons, hover states)
- `shadow-md`: Cards, inputs
- `shadow-lg`: Floating panels, modals
- `shadow-xl`: Dropdowns, floating menus

**Borders:**
- `rounded-lg`: 8px (buttons, inputs)
- `rounded-xl`: 12px (cards)
- `rounded-2xl`: 16px (large cards)
- `border-1`: 1px solid

### 7.5 Animations

**Framer Motion Presets:**
- **Fade In:** `opacity: 0 → 1`, duration: 200ms
- **Slide Up:** `y: 20 → 0`, duration: 300ms
- **Scale:** `scale: 0.95 → 1`, duration: 200ms
- **Expand Panel:** width/height transition, duration: 300ms, ease: "easeInOut"

**CSS Transitions:**
- Hover states: `transition: all 200ms ease`
- Color changes: `transition: color 150ms ease`

---

## 8. API Integration

### 8.1 Endpoints Used

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| **Roadmaps** | `/api/roadmap/` | GET | List all roadmaps |
| **Roadmap Detail** | `/api/roadmap/{id}/` | GET | Get specific roadmap |
| **Update Node** | `/api/roadmap/{id}/nodes/{nodeId}/` | PATCH | Update node status |
| **AI Chat** | `/api/ai_mentoring/chat/` | POST | Send message |
| **Chat History** | `/api/ai_mentoring/history/` | GET | Get past messages |
| **Dashboard** | `/api/analytics/dashboard/` | GET | Fetch stats |
| **Activity Chart** | `/api/analytics/activity_chart/?days=7` | GET | Fetch chart data |
| **User** | `/api/users/me/` | GET | Get current user |
| **Notes Save** | `/api/notes/save/` | POST | Save editor blocks |
| **Notes Load** | `/api/notes/{id}/` | GET | Load saved note |

### 8.2 Error Handling

- Network errors: Show toast with retry button
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show subscription upgrade modal
- 400 Bad Request: Show validation error toast
- 500 Server Error: Show error toast with "Contact support" link

---

## 9. Responsive Design

### 9.1 Breakpoints (Tailwind standard)

- **Mobile:** < 640px (no sidebar, full-width, stacked layout)
- **Tablet:** 640px - 1024px (collapsed sidebar, 2-column)
- **Desktop:** > 1024px (full sidebar, multi-column)

### 9.2 Layouts by Breakpoint

**Mobile:**
- Sidebar hidden by default (hamburger menu)
- Main content: full width
- AI Mentor: bottom sheet or modal
- Charts: stacked, single column

**Tablet:**
- Sidebar: collapsed (icons only)
- Main content: 70% width
- AI Mentor: side panel, narrower
- Charts: 2-column grid

**Desktop:**
- Sidebar: full width (256px)
- Main content: dynamic width
- AI Mentor: 400-600px side panel
- Charts: multi-column grid

---

## 10. Accessibility

- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`
- ARIA labels on buttons: `aria-label="Expand"`
- Keyboard navigation: Tab through all interactive elements
- Color contrast: WCAG AA compliance
- Focus indicators: Visible on all focusable elements
- Alt text on images: Descriptive, not placeholder

---

## 11. Performance Optimization

### 11.1 Code Splitting

- Lazy load components: `React.lazy()` for large features
- Dynamic imports for editor blocks, chart libraries

### 11.2 Memoization

- Memoize expensive components: `React.memo()` for Chat, Editor
- Memoize selectors in Zustand stores

### 11.3 Data Loading

- Paginate roadmap nodes (if many)
- Infinite scroll for chat messages
- Cache API responses (30-60 second TTL)

### 11.4 Bundle Size

- Tree-shake unused Recharts features
- Use Monaco Editor lazy loading for code blocks
- Lazy load Framer Motion animations

---

## 12. Testing Checklist

### 12.1 Functional Tests

- [ ] Editor: Add, edit, delete, reorder blocks
- [ ] Editor: Slash command menu opens and filters
- [ ] Editor: Debounced save works (verify 30s delay)
- [ ] Editor: Block types render correctly
- [ ] AI Mentor: Send message → response appears
- [ ] AI Mentor: Quick actions trigger correct prompts
- [ ] AI Mentor: Expand button cycles through modes
- [ ] Roadmap: Load roadmaps from API
- [ ] Roadmap: Click node → detail panel opens
- [ ] Roadmap: Update status → backend updates
- [ ] Dashboard: Stats load correctly
- [ ] Dashboard: Chart renders with data
- [ ] Sidebar: Collapse/expand works
- [ ] Navbar: Search works (if implemented)
- [ ] Theme: Toggle dark/light mode
- [ ] Auth: User profile loads on mount

### 12.2 UI/UX Tests

- [ ] Animations are smooth (no jank)
- [ ] Responsive: Mobile, tablet, desktop layouts
- [ ] Keyboard navigation: Tab through all elements
- [ ] Hover states: All buttons have hover effects
- [ ] Loading states: Spinners appear during API calls
- [ ] Error states: Toast messages show on error
- [ ] Touch targets: Mobile buttons are > 44px
- [ ] Contrast: Text is readable in light and dark mode

### 12.3 Integration Tests

- [ ] Sidebar nav updates `currentSection` in store
- [ ] Changing section loads correct component
- [ ] AI Mentor context updates based on current section
- [ ] Quick actions are different per section
- [ ] Roadmap data syncs with API
- [ ] Editor saves to backend
- [ ] Dashboard stats update on page load

---

## 13. Deployment & Future Enhancements

### 13.1 MVP (Phase 1)

- ✅ Layout + Sidebar + Navbar
- ✅ Block Editor (text, heading, list, code)
- ✅ AI Mentor (basic chat, 2 quick actions)
- ✅ Roadmap (list view, status toggle)
- ✅ Dashboard (basic stats, chart)

### 13.2 Phase 2

- Multi-page document support
- Advanced editor blocks (embeds, tables)
- AI mentor: context awareness (reads user's roadmap)
- Roadmap: visual timeline view
- Dashboard: customizable widgets

### 13.3 Phase 3

- Collaboration (share notes, real-time editing)
- Mobile app
- Offline support
- Advanced analytics
- Custom themes

---

## 14. Summary

This design provides a complete, polished, feature-rich workspace that:

✅ Uses all existing backend APIs  
✅ Combines productivity (editor, roadmap) + AI (mentor)  
✅ Responsive across all devices  
✅ Smooth animations and transitions  
✅ Clean, Notion-inspired aesthetic  
✅ Modular component architecture  
✅ Zustand state management (no prop drilling)  
✅ Accessibility-first approach  

**Ready for implementation:** Yes

---

**Approved by:** User  
**Review date:** 2026-04-11  
**Implementation start:** Upon writing-plans approval
