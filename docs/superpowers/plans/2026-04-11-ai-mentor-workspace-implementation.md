# AI Mentor Workspace Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan task-by-task. Each step uses checkbox (`- [ ]`) syntax.

**Goal:** Build a complete, production-ready AI Mentor Workspace combining block-based note editor, floating AI chat panel, visual roadmap, and progress dashboard with real backend API integration.

**Architecture:** Feature-based modular structure with centralized Zustand stores. Each feature (Editor, Mentor, Roadmap, Dashboard) is self-contained but shares workspace context.

**Tech Stack:** React 18 + Tailwind CSS + Zustand + Framer Motion + Axios + Recharts

---

## Task List

### Phase 1: Foundation (Tasks 1-3)
- [ ] Task 1: Tailwind Configuration & Global Styles
- [ ] Task 2: Create Zustand Stores (State Management Foundation)
- [ ] Task 3: Create Shared UI Components

### Phase 2: Layout & Navigation (Tasks 4-6)
- [ ] Task 4: Create Workspace Layout & Routing
- [ ] Task 5: Create Sidebar Navigation
- [ ] Task 6: Create Navbar

### Phase 3: Core Features (Tasks 7-12)
- [ ] Task 7: Create Block Editor Foundation
- [ ] Task 8: Create AI Mentor Panel
- [ ] Task 9: Create Roadmap View
- [ ] Task 10: Create Dashboard View
- [ ] Task 11: Create API Services & Integration
- [ ] Task 12: Wire up Data & Complete Integration

---

## PHASE 1: FOUNDATION

### Task 1: Tailwind Configuration & Global Styles

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Create: `frontend/src/styles/variables.css`

**Context:** Set up the design system foundation with Tailwind colors, typography, spacing, and animations. This must be done first because all other components depend on these styles.

- [ ] Step 1: Extend tailwind.config.js with custom colors and theme
- [ ] Step 2: Create variables.css for CSS custom properties
- [ ] Step 3: Update frontend/src/index.css with global styles
- [ ] Step 4: Verify styles load without errors
- [ ] Step 5: Commit changes

**Expected Output:** 
- Tailwind configured with custom color palette (light/dark mode)
- Global styles applied, scrollbar styled, focus/selection styles
- Ready for component development

---

### Task 2: Create Zustand Stores (State Management Foundation)

**Files:**
- Create: `frontend/src/stores/authStore.js`
- Create: `frontend/src/stores/workspaceStore.js`
- Create: `frontend/src/stores/editorStore.js`
- Create: `frontend/src/stores/mentorStore.js`
- Create: `frontend/src/stores/roadmapStore.js`
- Create: `frontend/src/stores/dashboardStore.js`

**Context:** Create all Zustand stores for global state management. Each store handles one domain (auth, workspace UI, editor, mentor, roadmap, dashboard). This is foundational for all features.

- [ ] Step 1: Create authStore.js for user authentication
- [ ] Step 2: Create workspaceStore.js for UI state (sidebar, section, theme)
- [ ] Step 3: Create editorStore.js for block editor state
- [ ] Step 4: Create mentorStore.js for AI mentor state
- [ ] Step 5: Create roadmapStore.js for roadmap state
- [ ] Step 6: Create dashboardStore.js for dashboard statistics
- [ ] Step 7: Test all stores initialize correctly
- [ ] Step 8: Commit all stores

**Expected Output:**
- 6 Zustand stores with proper TypeScript-like structure
- All with devtools middleware for debugging
- Ready to be consumed by components

---

### Task 3: Create Shared UI Components

**Files:**
- Create: `frontend/src/components/shared/Button.jsx`
- Create: `frontend/src/components/shared/Card.jsx`
- Create: `frontend/src/components/shared/Modal.jsx`
- Create: `frontend/src/components/shared/Loader.jsx`
- Create: `frontend/src/components/shared/Toast.jsx`
- Create: `frontend/src/components/shared/ThemeProvider.jsx`
- Create: `frontend/src/components/shared/index.js`

**Context:** Create reusable UI components that all features will use. These are foundational; every feature depends on Button, Card, etc.

- [ ] Step 1: Create Button.jsx with variants (primary, secondary, ghost, danger)
- [ ] Step 2: Create Card.jsx for content containers
- [ ] Step 3: Create Modal.jsx with Framer Motion animations
- [ ] Step 4: Create Loader.jsx spinner component
- [ ] Step 5: Create Toast.jsx notification system with hook
- [ ] Step 6: Create ThemeProvider.jsx for dark mode support
- [ ] Step 7: Create index.js for barrel exports
- [ ] Step 8: Commit all shared components

**Expected Output:**
- 6 polished, reusable components
- Toast system with useToast hook
- Ready for all features to use

---

## PHASE 2: LAYOUT & NAVIGATION

### Task 4: Create Workspace Layout & Routing

**Files:**
- Create: `frontend/src/components/Workspace/WorkspaceLayout.jsx`
- Create: `frontend/src/components/Workspace/index.js`
- Modify: `frontend/src/App.jsx`

**Context:** Create the main workspace container that orchestrates sidebar, navbar, content area, and mentor panel. This is the routing hub for the entire app.

- [ ] Step 1: Create WorkspaceLayout.jsx with section routing
- [ ] Step 2: Create Workspace index.js
- [ ] Step 3: Update App.jsx with ThemeProvider, ToastContainer, WorkspaceLayout
- [ ] Step 4: Test routing between sections (dashboard, roadmap, notes, etc)
- [ ] Step 5: Commit workspace layout

**Expected Output:**
- Workspace layout orchestrates all sections
- Routing works (currentSection changes content)
- User auth integration
- App.jsx properly wrapped with providers

---

### Task 5: Create Sidebar Navigation

**Files:**
- Create: `frontend/src/components/Sidebar/Sidebar.jsx`
- Create: `frontend/src/components/Sidebar/NavItem.jsx`
- Create: `frontend/src/components/Sidebar/index.js`

**Context:** Create collapsible sidebar with navigation items. Desktop: full width when open, collapsed to icons when closed. Mobile: hidden by default, shows as overlay. Updates currentSection in store.

- [ ] Step 1: Create Sidebar.jsx with collapse animation
- [ ] Step 2: Create NavItem.jsx with active states
- [ ] Step 3: Create Sidebar index.js
- [ ] Step 4: Test collapse/expand functionality
- [ ] Step 5: Test responsive behavior (mobile/desktop)
- [ ] Step 6: Test navigation between sections
- [ ] Step 7: Commit sidebar

**Expected Output:**
- Responsive sidebar (desktop + mobile)
- Smooth animations on collapse/expand
- 5 nav items (dashboard, roadmap, notes, progress, settings)
- Proper active state styling

---

### Task 6: Create Navbar

**Files:**
- Create: `frontend/src/components/Navbar/Navbar.jsx`
- Create: `frontend/src/components/Navbar/SearchBar.jsx`
- Create: `frontend/src/components/Navbar/UserMenu.jsx`
- Create: `frontend/src/components/Navbar/index.js`

**Context:** Create top navbar with search, notifications, and user menu. Search updates workspaceStore. User menu allows theme toggle and logout.

- [ ] Step 1: Create Navbar.jsx layout
- [ ] Step 2: Create SearchBar.jsx with input handling
- [ ] Step 3: Create UserMenu.jsx with dropdown
- [ ] Step 4: Create Navbar index.js
- [ ] Step 5: Test search query updates store
- [ ] Step 6: Test theme toggle functionality
- [ ] Step 7: Test logout flow
- [ ] Step 8: Commit navbar

**Expected Output:**
- Top navbar with all controls
- Search integrates with workspaceStore
- User menu dropdown with theme + logout
- Responsive on mobile

---

## PHASE 3: CORE FEATURES

### Task 7: Create Block Editor Foundation

**Files:**
- Create: `frontend/src/components/BlockEditor/BlockEditor.jsx`
- Create: `frontend/src/components/BlockEditor/Block.jsx`
- Create: `frontend/src/components/BlockEditor/blocks/TextBlock.jsx`
- Create: `frontend/src/components/BlockEditor/blocks/HeadingBlock.jsx`
- Create: `frontend/src/components/BlockEditor/blocks/BulletBlock.jsx`
- Create: `frontend/src/components/BlockEditor/blocks/index.js`
- Create: `frontend/src/components/BlockEditor/index.js`

**Context:** Create a Notion-like block editor with drag-drop reordering, multiple block types, and auto-save to backend. Start with text, heading, bullet types. Expand later.

- [ ] Step 1: Create Block.jsx wrapper with drag handle
- [ ] Step 2: Create TextBlock.jsx
- [ ] Step 3: Create HeadingBlock.jsx
- [ ] Step 4: Create BulletBlock.jsx
- [ ] Step 5: Create BlockEditor.jsx container
- [ ] Step 6: Implement drag-drop reordering
- [ ] Step 7: Implement auto-save (debounced 30s)
- [ ] Step 8: Test adding/deleting blocks
- [ ] Step 9: Test drag-drop reordering
- [ ] Step 10: Test auto-save timing
- [ ] Step 11: Commit block editor

**Expected Output:**
- Full block editor with 3+ block types
- Drag-drop reordering works
- Auto-save with debounce (30s)
- "Unsaved changes" / "Saved" indicator
- Add block button at bottom

---

### Task 8: Create AI Mentor Panel

**Files:**
- Create: `frontend/src/components/AIMentor/MentorPanel.jsx`
- Create: `frontend/src/components/AIMentor/MentorChat.jsx`
- Create: `frontend/src/components/AIMentor/ChatMessage.jsx`
- Create: `frontend/src/components/AIMentor/QuickActions.jsx`
- Create: `frontend/src/components/AIMentor/ExpandButton.jsx`
- Create: `frontend/src/components/AIMentor/index.js`

**Context:** Create floating AI mentor panel with expandable modes (default 400px, larger 600px, fullscreen, new tab). Shows context-aware quick actions. Cycles expand modes on button click.

- [ ] Step 1: Create MentorPanel.jsx container
- [ ] Step 2: Create MentorChat.jsx message display area
- [ ] Step 3: Create ChatMessage.jsx for single message
- [ ] Step 4: Create QuickActions.jsx with 2 actions per page
- [ ] Step 5: Create ExpandButton.jsx cycling logic
- [ ] Step 6: Implement expand mode cycling (default → larger → fullscreen → newtab)
- [ ] Step 7: Implement quick action button clicks (append to message input)
- [ ] Step 8: Test expand button cycles through modes
- [ ] Step 9: Test minimize/expand
- [ ] Step 10: Test quick actions update based on section
- [ ] Step 11: Commit AI mentor panel

**Expected Output:**
- Floating mentor panel (400px default)
- Expand button cycles through 4 modes
- Quick actions (2 per section)
- Chat message display
- Input textarea with send button
- Minimize/expand buttons

---

### Task 9: Create Roadmap View

**Files:**
- Create: `frontend/src/components/Roadmap/RoadmapView.jsx`
- Create: `frontend/src/components/Roadmap/RoadmapNode.jsx`
- Create: `frontend/src/components/Roadmap/NodeDetail.jsx`
- Create: `frontend/src/components/Roadmap/StatusBadge.jsx`
- Create: `frontend/src/components/Roadmap/index.js`

**Context:** Create roadmap display showing learning steps as linear list with status (not started/in progress/completed). Click node to expand detail. Update status via API.

- [ ] Step 1: Create RoadmapView.jsx container
- [ ] Step 2: Create RoadmapNode.jsx for single node
- [ ] Step 3: Create StatusBadge.jsx (visual indicator)
- [ ] Step 4: Create NodeDetail.jsx expansion panel
- [ ] Step 5: Fetch roadmaps from `/api/roadmap/` on mount
- [ ] Step 6: Implement status toggle (update via `/api/roadmap/{id}/nodes/`)
- [ ] Step 7: Calculate and display progress percentage
- [ ] Step 8: Test node click opens detail
- [ ] Step 9: Test status toggle updates UI and API
- [ ] Step 10: Test progress percentage updates
- [ ] Step 11: Commit roadmap view

**Expected Output:**
- Linear roadmap display
- Nodes show title, description, status, estimated hours
- Click to expand detail panel
- Status toggle buttons (not started/in progress/completed)
- Progress bar showing completion %
- API integration

---

### Task 10: Create Dashboard View

**Files:**
- Create: `frontend/src/components/Dashboard/DashboardView.jsx`
- Create: `frontend/src/components/Dashboard/StatsCard.jsx`
- Create: `frontend/src/components/Dashboard/ActivityChart.jsx`
- Create: `frontend/src/components/Dashboard/StreakWidget.jsx`
- Create: `frontend/src/components/Dashboard/index.js`

**Context:** Create dashboard showing statistics (streak, tasks completed today, overall completion %) and a chart of weekly activity. Fetch from `/api/analytics/` endpoints.

- [ ] Step 1: Create DashboardView.jsx layout
- [ ] Step 2: Create StatsCard.jsx for metric display
- [ ] Step 3: Create ActivityChart.jsx with Recharts
- [ ] Step 4: Create StreakWidget.jsx
- [ ] Step 5: Fetch dashboard stats from `/api/analytics/dashboard/`
- [ ] Step 6: Fetch activity data from `/api/analytics/activity_chart/`
- [ ] Step 7: Display streak with emoji
- [ ] Step 8: Display tasks completed / completion %
- [ ] Step 9: Render line chart of weekly activity
- [ ] Step 10: Test auto-refresh every 60s
- [ ] Step 11: Commit dashboard

**Expected Output:**
- Dashboard header with welcome message
- 3 metric cards (streak, tasks, completion %)
- Weekly activity line chart
- Responsive grid layout
- API integration

---

### Task 11: Create API Services & Integration

**Files:**
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/services/roadmapService.js`
- Create: `frontend/src/services/dashboardService.js`
- Create: `frontend/src/services/mentorService.js`
- Create: `frontend/src/hooks/useAPI.js`

**Context:** Create centralized API client with error handling, auth headers, and typed response handling. Create service functions for each feature (roadmap, dashboard, mentor).

- [ ] Step 1: Create api.js Axios instance with auth headers
- [ ] Step 2: Create useAPI.js hook for data fetching with loading/error
- [ ] Step 3: Create roadmapService.js (GET /api/roadmap/, PATCH nodes)
- [ ] Step 4: Create dashboardService.js (GET /api/analytics/)
- [ ] Step 5: Create mentorService.js (POST /api/ai_mentoring/chat/, GET history)
- [ ] Step 6: Test all services with real API
- [ ] Step 7: Test error handling (401, 403, 500)
- [ ] Step 8: Test auth token refresh
- [ ] Step 9: Commit API services

**Expected Output:**
- Centralized Axios instance
- Auth header injection
- Service functions for each feature
- Error handling + retry logic
- useAPI hook for components

---

### Task 12: Wire up Data & Complete Integration

**Files:**
- Modify: All feature components to use API services
- Modify: All components to dispatch and consume Zustand stores
- Integration: Mentor panel context-aware quick actions
- Integration: Editor auto-save to backend
- Integration: All data flow from stores

**Context:** Connect all components to use API services and Zustand stores. Ensure data flows correctly: API → store → component. Test all integrations.

- [ ] Step 1: Wire BlockEditor to save blocks to `/api/notes/save/`
- [ ] Step 2: Wire RoadmapView to fetch from API and update store
- [ ] Step 3: Wire DashboardView to fetch analytics and display
- [ ] Step 4: Wire MentorPanel to send messages via API
- [ ] Step 5: Update quick actions based on currentSection from store
- [ ] Step 6: Test end-to-end: edit notes → auto-save → verify API call
- [ ] Step 7: Test roadmap fetch → status update → progress recalc
- [ ] Step 8: Test mentor send message → API call → display response
- [ ] Step 9: Test dashboard refresh on section change
- [ ] Step 10: Test dark mode toggle across all components
- [ ] Step 11: Final integration testing
- [ ] Step 12: Commit all integration changes

**Expected Output:**
- All components connected to APIs
- All data flows through Zustand stores
- No prop drilling
- Full end-to-end functionality
- Ready for QA

---

## Post-Implementation

After all tasks complete:
1. Run full test suite
2. Code review by superpowers:requesting-code-review
3. Commit to main branch
4. Deploy to staging for QA

---

**Status:** Ready for execution via subagent-driven-development
