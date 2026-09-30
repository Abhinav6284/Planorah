# Planorah Frontend Redesign — Design Spec

Date: 2026-09-30 · Status: awaiting review

## Goal

Replace the current mixed look (warm/yellowish stone, glass cards, orange glow, widget grids,
four competing design systems, ~200 hardcoded hex colors) with one coherent system, and
restructure navigation around the core loop. Covers the whole frontend: app, auth,
onboarding and marketing site.

**Why:** the product felt unfocused and "not worth it". A calm, focused UI with 4 nav items
makes the core loop (plan → do → adapt) the obvious thing.

**Success =** every screen uses only the new tokens and primitives; no `--el-*`, glass,
glow, or hardcoded hex values remain; `npm run build` and lint pass; the user signs off
each area.

## Decisions (agreed)

| Topic | Decision |
|---|---|
| Visual direction | **Mono + Lime**: pure black/white neutrals, one vivid lime accent |
| Layout | **Slim left sidebar + single focus column** |
| Navigation | **Today · Path · Mentor · Progress**; Career/Billing/Settings/Support under avatar menu |
| Scope | Everything: app, auth, onboarding, marketing |
| Approach | Tokens + small primitive set, rebuild each screen on them |
| Not included | CRA→Vite, backend changes, core-loop logic (sub-project 3), new features |

## 1. Design tokens

Defined once as CSS variables in `src/styles/tokens.css`. Dark is default (`:root`);
light overrides under `.light` (existing `ThemeContext` toggles `dark`/`light` on `<html>`).
Tailwind `theme.colors` maps to these variables, replacing the old Cal.com/indigo config.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#000000` | `#FFFFFF` | page |
| `--bg-subtle` | `#0A0A0A` | `#FAFAFA` | sidebar, inset areas |
| `--surface` | `#111111` | `#FFFFFF` | rows, panels |
| `--surface-hover` | `#171717` | `#F5F5F5` | hover / active nav |
| `--border` | `#1F1F1F` | `#E5E5E5` | default 1px border |
| `--border-strong` | `#2E2E2E` | `#D4D4D4` | inputs, emphasis |
| `--text` | `#FAFAFA` | `#0A0A0A` | primary text |
| `--text-muted` | `#A3A3A3` | `#525252` | secondary |
| `--text-faint` | `#737373` | `#A3A3A3` | meta, placeholders |
| `--accent` | `#BEF264` | `#BEF264` | primary button fill, active marker, focus ring |
| `--accent-fg` | `#000000` | `#000000` | text on accent |
| `--accent-text` | `#BEF264` | `#4D7C0F` | accent used as text (contrast-safe in light) |
| `--accent-soft` | `rgba(190,242,100,.12)` | `rgba(77,124,15,.10)` | chips, selected bg |
| `--danger` / `--warning` / `--info` | `#F87171` / `#FBBF24` / `#60A5FA` | `#DC2626` / `#B45309` / `#2563EB` | status only |

- **Type:** `Geist` (UI + headings) and `Geist Mono` (numbers, timers, code), from Google
  Fonts. All other font imports (Plus Jakarta, Newsreader, Manrope, Space Grotesk, Lora,
  DM Sans, JetBrains Mono) are removed.
  Scale: 12 / 13 / 14 (body) / 16 / 20 / 28 / 40 / 56 (marketing hero). Headings weight 600,
  tracking −0.02em.
- **Radius:** 6 (inputs, buttons), 8 (rows), 12 (panels, dialogs). Pills only for badges.
- **Spacing:** Tailwind default 4px scale.
- **Elevation:** none on content. Borders separate things. Only menus/dialogs get one
  shadow token `--shadow-pop`.

**Visual rules**
- No glass, blur, glow, gradients, or decorative backgrounds.
- Lime is scarce: primary CTA, active nav marker, focus ring, "positive state" chips. Never
  large fills, never body text on light theme.
- Prefer lists and sectioned pages over card grids. A "card" only when content is truly a
  standalone object (e.g. a roadmap in a list of roadmaps).
- Numbers use Geist Mono with tabular figures.

## 2. Primitives (`src/components/ui/`)

Tailwind-class based, no inline `style={{}}`. One file each, barrel `index.js`.

| Primitive | Variants / notes |
|---|---|
| `Button` | `primary` (lime), `secondary` (border), `ghost`, `danger`; sizes `sm`/`md`; `loading`; renders `Link` when `to` given |
| `Input`, `Textarea`, `Select` | label, hint, error; shared field styles |
| `Surface` | bordered block, radius 12, optional header (title + action) |
| `ListRow` | leading slot, title, meta, trailing slot; clickable/hover state |
| `Badge` | `neutral`, `accent`, `danger`, `warning`, `info` |
| `Tabs` | underline style, keyboard arrows |
| `Menu` | dropdown for avatar menu; Esc/outside-click close, arrow keys |
| `Dialog` | modal with focus trap, Esc close, `--shadow-pop` |
| `EmptyState` | icon, title, text, action |
| `Skeleton`, `Spinner` | loading |
| `PageHeader` | title, subtitle, actions — used at top of every app page |

Icons stay `lucide-react` (already installed), 16px, stroke 1.75.

## 3. App shell

`AppLayout` replaces `Layout.jsx` + `Sidebar.jsx`.

- **Desktop:** 220px sidebar on `--bg-subtle`: logo, 4 nav items (icon + label; active =
  `--surface-hover` + 2px lime left marker), spacer, avatar button opening `Menu`:
  Resume · Portfolio · LinkedIn check · Billing · Settings · Support · Theme toggle · Log out.
- **Mobile (<768px):** sidebar hidden; bottom tab bar with the 4 items; avatar in a slim top bar.
- Main column: max-width 760px for Today/Mentor, 1040px for Path/Progress/Career.
- Existing global widgets (assistant bubble, tour) are re-evaluated: the floating
  assistant is removed (Mentor is a nav item); the tour is restyled.

## 4. Information architecture & routes

| New route | Replaces (redirect) | Content |
|---|---|---|
| `/today` | `/dashboard`, `/tasks`, `/tasks/day`, `/tasks/focus`, `/scheduler` | greeting + one-line state ("Flow is strong"), today's task list, start focus, week strip, full-screen focus mode |
| `/path` | `/roadmap/list`, `/roadmap/projects`, `/planora`, `/projects` | tabs: Roadmaps · Exams · Projects; `/path/roadmap/:id`, `/path/new`, `/path/exam/...` detail routes |
| `/mentor` | `/assistant` | single conversation: text by default, voice toggle; merges Assistant + voice panel |
| `/progress` | `/tasks/analytics` | streak, heatmap, completion trend, intelligence insights in plain language, adaptation suggestions |
| `/career/*` | `/resume/*`, `/ats`, `/linkedin-analyzer`, `/portfolio/edit` | reached from avatar menu |
| `/settings`, `/billing/*` | same | reached from avatar menu |

Old paths get `<Navigate replace>` redirects so bookmarks and in-app links keep working.
`/` for logged-in users → `/today`.

## 5. Screen rebuild order

Each step ships complete (new UI, old styling removed for that area), builds, and gets the
user's sign-off before the next.

1. Tokens, fonts, Tailwind mapping, primitives
2. App shell + routes/redirects
3. Today
4. Path (roadmaps, exams, projects, generator)
5. Mentor
6. Progress
7. Career (resume list/builder/ATS/LinkedIn, portfolio), Settings, Billing
8. Auth (login, register, OTP, reset) + onboarding
9. Marketing site (landing + all public pages, one shared marketing layout)
10. Final sweep: delete old `index.css` variables (`--el-*`, `--orange`, glass/glow
    classes), `DESIGN.md`, unused fonts; grep for hex colors and `style={{` in components

Logic, API calls and stores are kept; only presentation and structure change. Where a
screen's JSX mixes logic and layout heavily (e.g. 1,100-line files), logic is extracted
into a hook in the same folder while rebuilding.

## 6. Error, empty and loading states

Every data view uses `Skeleton` while loading, `EmptyState` with a clear next action when
empty (e.g. Today with no tasks → "Create your first path"), and an inline error row with
retry on failure. No blank screens.

## 7. Accessibility

Focus ring (2px lime, 2px offset) on all interactive elements; contrast AA for text in both
themes (hence `--accent-text` in light); `Menu`/`Dialog`/`Tabs` keyboard-operable; icons
in icon-only buttons have `aria-label`.

## 8. Verification

Per step: `npm run build` with zero warnings, `eslint src` clean for touched files, app run
locally and checked in both themes at desktop and mobile widths, then user review. Final
step greps confirm no leftover old tokens or hardcoded hex values in `src/components`.
