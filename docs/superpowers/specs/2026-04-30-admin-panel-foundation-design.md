# Admin Panel — Foundation & Theme System
**Date:** 2026-04-30
**Scope:** Sub-project 1 of N — Foundation layer for the existing `admin-panel/` React app

---

## Problem

The admin panel (`admin-panel/`) exists as a React 18 + Vite app with a Cal.com-inspired light design, but it has several broken/incomplete pieces:

1. `Input.jsx` uses dark-mode-only hardcoded classes (`bg-obs-elevated`, `text-[#F1F5F9]`, `focus:border-gold/50`) that don't exist in the config — inputs are invisible/broken
2. `Toast.jsx` references `var(--bg-elevated)`, `var(--text-primary)`, `var(--text-secondary)` which are undefined → transparent background, invisible text
3. `Settings.jsx` profile save fakes a 600ms delay, never POSTs to backend
4. Admin Logs page is missing entirely from the React app (exists only in Django templates)
5. No theme toggle — light/dark preference not supported

---

## Design

### Theme System

**Approach:** CSS custom properties for all color tokens + `ThemeContext` for toggle state. No Tailwind `dark:` classes — all components use `var(--*)` for colors. Tailwind used only for layout/spacing.

**Token sets in `index.css`:**

```css
:root {
  --bg-base:        #ffffff;
  --bg-elevated:    #f9fafb;
  --bg-card:        #ffffff;
  --bg-toast:       #1e1e1e;   /* stays dark in both modes — toasts are always dark */
  --text-primary:   #242424;
  --text-secondary: #898989;
  --text-on-toast:  #f1f5f9;
  --border:         rgba(34,42,53,0.08);
  --border-bright:  rgba(34,42,53,0.14);
}

.dark {
  --bg-base:        #111111;
  --bg-elevated:    #1a1a1a;
  --bg-card:        #1e1e1e;
  --bg-toast:       #2a2a2a;
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-on-toast:  #f1f5f9;
  --border:         rgba(255,255,255,0.06);
  --border-bright:  rgba(255,255,255,0.12);
}

* { transition: background-color 0.2s, color 0.2s, border-color 0.2s; }
```

**ThemeContext (`src/context/ThemeContext.jsx`):**
- State: `theme` ('light' | 'dark')
- `toggleTheme()` — flips state, syncs `dark` class on `document.documentElement`, persists to `localStorage`
- On mount: reads `localStorage` preference, applies immediately to prevent flash

**Toggle button:** Lucide `Sun`/`Moon` icon in Navbar top-right, calls `toggleTheme()`

---

### Component Fixes

**`Input.jsx`** — replace all dark-only hardcoded values with CSS vars:
- Background: `var(--bg-elevated)`
- Text: `var(--text-primary)`
- Placeholder: `var(--text-secondary)`
- Border: `var(--border-bright)`
- Focus: blue-500 accent (neutral, works in both modes)

**`Toast.jsx`** — update to use `var(--bg-toast)` and `var(--text-on-toast)` so it renders dark in both light and dark mode (toasts should always contrast against page content).

**Layout shell (Sidebar, Navbar, Layout.jsx)** — replace hardcoded Tailwind white/gray classes with CSS var inline styles or Tailwind arbitrary values pointing to vars:
- Backgrounds: `bg-[var(--bg-base)]`, `bg-[var(--bg-card)]`
- Borders: `border-[var(--border)]`
- Text: `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`

---

### Settings Profile Save

Wire the admin profile form to the real backend:
- **Backend change needed:** `GET /api/admin/me/` exists but only handles GET. Add PATCH support to `api_views.me` in `backend/saas_admin/api_views.py` — accepts `{ first_name, last_name, email }`, saves to `request.user`, returns updated user object.
- **Frontend:** Add `updateMe(data)` to `adminApi` in `services/api.js` — `PATCH /api/admin/me/`.
- On success: update `AuthContext` user state, show success toast
- On error: show error toast with message
- Loading state: disable form + show spinner on button during request

---

### Admin Logs Page

New page: `src/pages/Logs.jsx`
- Route: `/logs` (added to `App.jsx` under `ProtectedRoute`)
- Sidebar nav entry: "Admin Logs" with `ScrollText` icon between Analytics and Settings
- Fetches `GET /api/admin/logs/?limit=100`
- Renders a table: timestamp, admin user, action, target, details
- Filter bar: search by action text, date range picker (today / 7d / 30d)
- No pagination needed for initial implementation (limit=100 covers common use)

---

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Add CSS token sets (`:root` + `.dark`) + transition rule |
| `src/context/ThemeContext.jsx` | New — theme state, toggle, localStorage persistence |
| `src/main.jsx` | Wrap app in `<ThemeProvider>` |
| `src/components/ui/Input.jsx` | Replace hardcoded dark classes with CSS vars |
| `src/components/ui/Toast.jsx` | Use `--bg-toast` + `--text-on-toast` tokens |
| `src/components/layout/Navbar.jsx` | Add theme toggle button; update colors to CSS vars |
| `src/components/layout/Sidebar.jsx` | Update hardcoded colors to CSS vars |
| `src/components/layout/Layout.jsx` | Update background to `var(--bg-base)` |
| `src/services/api.js` | Add `updateMe(data)` PATCH endpoint |
| `src/pages/Settings.jsx` | Wire profile save to real API |
| `src/pages/Logs.jsx` | New — admin logs page |
| `src/App.jsx` | Add `/logs` route + sidebar nav entry |
| `backend/saas_admin/api_views.py` | Add PATCH support to `me` view |

---

## Out of Scope

- Dark/light variants for Dashboard charts (Recharts colors stay charcoal — readable in both modes)
- Navbar search backend wiring (separate sub-project)
- Notifications API (separate sub-project)
- Any other page UI changes beyond color variable migration
