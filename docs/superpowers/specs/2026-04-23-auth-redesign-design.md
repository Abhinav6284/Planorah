# Auth Pages Redesign — Cal.com-Inspired Split Panel

_2026-04-23_

## Source

Design bundle from claude.ai/design (bundle ID: 24BjRVy42ajwps2bDvYqFQ). Chat transcript: `planorah/chats/chat1.md`. Primary design file: `planorah/project/src/auth.jsx`.

## Scope

Redesign `frontend/src/components/Login.jsx` and `frontend/src/components/Register.jsx`. No backend changes. All existing OAuth integrations (Google, GitHub), API calls, and React Router navigation are preserved exactly.

## Design System

- **Fonts:** Cal Sans (600, display headings) + Inter (body 400–600) + JetBrains Mono (mono). Added via Google Fonts import in `frontend/public/index.html`.
- **Palette:** charcoal `#242424`, midnight `#111111`, white `#ffffff`, light-gray `#f5f5f5`, mid-gray `#898989`, link-blue `#0099ff`
- **Shadows:** multi-layered ring-shadow system (no CSS borders) — `shadow-card`, `shadow-btn-dark`, `shadow-ring`
- **Dark mode:** existing `useTheme` context, CSS variable flip on `[data-theme="dark"]`

## Layout — Both Pages

50/50 grid split (full-screen, no scroll on left panel):

### Left — Brand Panel (`#242424` charcoal)
- SVG line-grid backdrop at 6% opacity
- Top: Planorah logo (white "P" mark in rounded square) + "← Back to site" link
- Middle: mono eyebrow label ("Welcome back" / "Start for free"), Cal Sans 44px headline (2 lines), body copy, 3 feature bullets (circular bordered check icons)
- Bottom: hairline divider, student testimonial quote, attribution with avatar initials

### Right — Form Panel (white / dark bg)
- Top bar: toggle link to other auth page (right-aligned)
- Heading block: Cal Sans 36px title + body subhead
- SSO section: Google button + GitHub button (full-width, ring-shadow, provider SVG icons)
- Divider: "or with email" (JetBrains Mono, uppercase)
- Form fields: `auth-input` styled inputs with focus ring
- Login extras: show/hide password toggle, "Forgot password?" link, "Keep me signed in" checkbox
- Register extras: Full name field, school email hint, password strength meter (4-segment bar)
- Terms/agree checkbox on Register
- Error banner (amber-tinted)
- Primary CTA button (charcoal bg, white text, full width)
- Footer note: encryption + privacy assurance

## Key Differences from Current Design

| Current | New |
|---|---|
| Dark `#080808` left panel with animated orbs | Charcoal `#242424` with static SVG grid |
| Cycling animated headline (Framer Motion) | Static Cal Sans headline per mode |
| Floating stat cards | Feature bullet list + testimonial |
| Outfit / Playfair fonts | Cal Sans / Inter / JetBrains Mono |
| Orange `#D96C4A` accent color | Monochrome (charcoal/white only) |
| Microsoft/Apple SSO in prototype | **Kept Google + GitHub** (real backend) |

## Implementation Plan

1. Add Cal Sans + JetBrains Mono to `frontend/public/index.html` Google Fonts import
2. Rewrite `Login.jsx` — new split-panel layout, preserve all auth logic
3. Rewrite `Register.jsx` — same layout with name field + PwStrength meter
4. Add `auth-input` CSS class to `frontend/src/index.css` or equivalent global stylesheet
