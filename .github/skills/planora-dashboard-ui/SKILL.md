---
name: planora-dashboard-ui
description: "Design and implement Planora dashboard UI updates in React + Tailwind with consistent spacing, alignment, reusable class systems, and premium visual polish. Use for glassmorphism requests, white minimal theme requests, and iterative style corrections to match existing project theme."
argument-hint: "Task + target theme: glass-white or minimal-white"
user-invocable: true
---

# Planora Dashboard UI Workflow

Use this skill when updating dashboard UI in Planora so output is consistent, production-ready, and aligned with the existing component structure.

## Outcomes

- Dashboard visuals match requested style direction.
- Layout remains clean and aligned on desktop and mobile.
- Styling stays reusable and maintainable (class constants, shared patterns).
- No overflow, broken spacing, or mismatched component look.

## Inputs To Confirm

- Target area (for example: Overview section, widget cards, buttons, timer panel).
- Theme mode:
  - `minimal-white`: flat white surfaces, subtle border/shadow, low visual noise.
  - `glass-white`: frosted white cards, blur, transparency, soft gradients.
- Constraint: preserve existing behavior and data flow; style-only unless explicitly asked.

## Decision Logic

1. If user asks for simple, plain, or minimal UI:
   - Choose `minimal-white`.
   - Remove heavy blur and decorative background glows.
   - Use neutral borders and subtle shadows.
2. If user asks for glass, frosted, premium, or glassmorphism:
   - Choose `glass-white`.
   - Use backdrop blur, translucent white layers, and soft edge highlights.
3. If request conflicts with prior style:
   - Follow the latest explicit user instruction.
   - Refactor style tokens first, then component-level classes.

## Procedure

1. Read the target component and identify style tokens/constants first.
2. Centralize visual language in reusable constants (surface card, inner card, primary button, secondary button).
3. Apply theme conversion top-down:
   - Page background
   - Major cards
   - Nested cards/chips/metric blocks
   - Buttons and icon controls
4. Keep spacing system consistent:
   - Uniform padding/radius scale
   - Regular gap values in repeated groups
   - No crowding near headers or card edges
5. Preserve interaction quality:
   - Keep hover states subtle
   - Keep transition durations consistent
   - Avoid flashy animation unless requested
6. Validate structure:
   - No element overflow
   - Grid/flex alignment intact
   - Text contrast and readability maintained
7. Run quick check for regressions:
   - No accidental logic/data changes
   - No unrelated file churn

## Theme Tokens

### Minimal White

- Surface: white background, light border, small shadow.
- Nested panels: slate-50/similar neutral fill.
- Buttons:
  - Primary: solid blue with clear hover.
  - Secondary: white with neutral border.
- Effects: avoid blur-heavy or glow-heavy visuals.

### Glass White

- Surface: semi-transparent white with backdrop blur.
- Nested panels: lighter transparent layers with soft borders.
- Buttons: premium rounded treatment with subtle depth.
- Effects: soft gradients and motion only where meaningful.

## Quality Checklist

- Theme consistency:
  - Every card follows same visual system.
  - Buttons match each other in radius, weight, and hover behavior.
- Layout consistency:
  - Card spacing and section rhythm are uniform.
  - No clipped text, overflow, or uneven alignment.
- Code consistency:
  - Reusable class constants over scattered ad-hoc classes.
  - No unnecessary inline styles unless dynamic rendering requires it.
- UX quality:
  - Readable hierarchy (title, metadata, content, actions).
  - Visual polish without clutter.

## Completion Criteria

- User-requested theme is clearly visible across the dashboard area edited.
- Component keeps existing functionality and API behavior.
- UI appears coherent with surrounding app styling.
- Diff is focused and easy to maintain.

## Example Prompts

- /planora-dashboard-ui Convert OverviewSection to minimal-white and remove heavy glass effects.
- /planora-dashboard-ui Apply glass-white styling to dashboard cards while keeping current layout.
- /planora-dashboard-ui Normalize button styles across widgets to match minimal-white design.
