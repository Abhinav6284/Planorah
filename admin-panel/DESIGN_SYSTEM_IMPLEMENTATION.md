# Planorah Admin Dashboard - Cal.com Design System Implementation

## Overview

The Planorah admin dashboard has been completely redesigned following the **Cal.com-inspired design system** as specified in `DESIGN.md`. This is a sophisticated, monochromatic design philosophy emphasizing professional restraint, elegant typography, and subtle depth through advanced shadow systems.

## Key Design Principles

### 1. **Monochromatic Color Palette**

- **Charcoal** (`#242424`): Primary text, headings, primary interactive elements
- **Midnight** (`#111111`): Deep emphasis text and overlays
- **Mid-Gray** (`#898989`): Secondary text, labels, muted content
- **White** (`#ffffff`): Background and surfaces
- **Link Blue** (`#0099ff`): Hyperlinks and focus states
- **Semantic Colors**: Green (success), Red (danger), Amber (warning)

No brand colors. The dashboard is intentionally colorless except for semantic states and links.

### 2. **Typography System**

- **Display/Headings**: Cal Sans (requires Google Fonts import)
  - H1: 36px, weight 600, tight tracking
  - H2: 28px, weight 600, tight tracking
  - H3: 20px, weight 600
  - H4: 16px, weight 600

- **Body/UI**: Inter (system font fallback)
  - Body: 16px, weight 400, relaxed line-height
  - Small: 14px, weight 400
  - Extra Small: 12px, weight 500

### 3. **Spacing System (8px Base Unit)**

- xs: 1px
- sm: 2px
- md: 4px
- base: 8px
- lg: 12px
- xl: 16px
- xxl: 20px
- 3xl: 24px
- section: 80px (between major sections)

### 4. **Shadow & Elevation System**

The most sophisticated element - multi-layered shadows for visual depth:

```
Level 2 Card (Primary):
  rgba(19,19,22,0.7) 0px 1px 5px -4px,     // Contact shadow
  rgba(34,42,53,0.08) 0px 0px 0px 1px,     // Ring border (no CSS border)
  rgba(34,42,53,0.05) 0px 4px 8px 0px      // Diffused soft shadow
```

## Component Architecture

### Layout Structure

```
Layout (white bg, pt-20)
├── Sidebar (256px | 80px collapsed)
│   ├── Logo section
│   ├── Navigation menu
│   └── User profile + actions
├── Navbar (sticky, h-20)
│   ├── Search bar
│   ├── Notifications
│   └── Profile menu
└── Main Content (px-8, py-8)
    └── Page content
```

### File Structure Updated

```
admin-panel/src/
├── components/
│   └── layout/
│       ├── Layout.jsx          (NEW: Cal.com design)
│       ├── Navbar.jsx          (NEW: monochromatic nav)
│       └── Sidebar.jsx         (NEW: elegant sidebar)
├── pages/
│   ├── Dashboard.jsx           (NEW: redesigned metrics)
│   ├── Users.jsx               (NEW: clean table)
│   ├── Subscriptions.jsx       (UPDATE NEEDED)
│   ├── Analytics.jsx           (UPDATE NEEDED)
│   └── Settings.jsx            (UPDATE NEEDED)
├── styles/
│   └── designSystem.js         (NEW: reusable constants)
└── tailwind.config.js          (UPDATED: Cal.com tokens)
```

## Tailwind Configuration

### New Design Tokens

```javascript
// Colors
charcoal: '#242424'
midnight: '#111111'
mid-gray: '#898989'
link-blue: '#0099ff'
border-gray: 'rgba(34, 42, 53, 0.08)'

// Shadows
shadow-level-2-card
shadow-level-3-soft
shadow-level-4-highlight

// Radius scale
rounded-xs (2px)
rounded-md (6px)
rounded-lg (8px)
rounded-xl (12px)
rounded-pill (9999px)
```

## Usage Patterns

### Typography

```jsx
// Headlines
<h1 className="font-cal-sans font-semibold text-4xl text-charcoal tracking-tight">
  Dashboard
</h1>

// Body text
<p className="font-inter text-base text-charcoal leading-relaxed">
  Description text
</p>

// Secondary text
<p className="font-inter text-sm text-mid-gray">
  Muted description
</p>
```

### Cards

```jsx
// Standard card
<div className="bg-white rounded-lg shadow-level-2-card border border-border-gray p-6">
  Content
</div>

// Compact card
<div className="bg-white rounded-lg shadow-level-2-card border border-border-gray p-4">
  Content
</div>

// Large card
<div className="bg-white rounded-lg shadow-level-2-card border border-border-gray p-8">
  Content
</div>
```

### Buttons

```jsx
// Primary (solid charcoal)
<button className="bg-charcoal text-white font-inter text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-midnight">
  Action
</button>

// Secondary (white with border)
<button className="bg-white text-charcoal border border-border-gray px-4 py-2.5 rounded-lg hover:bg-gray-50">
  Cancel
</button>

// Ghost (minimal)
<button className="text-charcoal px-4 py-2.5 rounded-lg hover:bg-gray-50">
  Option
</button>
```

### Forms

```jsx
// Input
<input
  className="w-full bg-white border border-border-gray rounded-lg px-4 py-2.5 font-inter text-sm text-charcoal placeholder-mid-gray focus:outline-none focus:border-charcoal"
  placeholder="Search…"
/>
```

### Tables

```jsx
<table className="w-full">
  <thead className="bg-gray-50 border-b border-border-gray">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-inter font-semibold uppercase tracking-wide text-mid-gray">
        Header
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border-gray">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-inter text-sm text-charcoal">Data</td>
    </tr>
  </tbody>
</table>
```

## Updated Components

### ✅ Completed

1. **Tailwind Config** - Cal.com design tokens integrated
2. **Layout** - White background, improved spacing
3. **Navbar** - Monochromatic, clean search/notifications
4. **Sidebar** - Elegant navigation, charcoal active state
5. **Dashboard** - Redesigned KPI cards, charts with monochromatic theme
6. **Users Page** - Clean table, streamlined filters
7. **Design System Constants** - `designSystem.js` for reusable patterns

### ⏳ Still Need Update

- Subscriptions.jsx
- Analytics.jsx
- Settings.jsx
- Any legacy `style={{ background: 'var(--bg-surface)' }}` patterns

## Migration Guide

### For Existing Components

Replace old patterns:

```javascript
// OLD
style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}

// NEW
className="bg-white text-charcoal"
```

Replace old color system:

```javascript
// OLD
style={{ color: 'var(--accent)', background: 'rgba(245,158,11,0.15)' }}

// NEW
className="text-charcoal bg-gray-100"
```

Replace custom shadows:

```javascript
// OLD
style={{ boxShadow: 'custom-shadow' }}

// NEW
className="shadow-level-2-card"
```

### Font Updates

Ensure these fonts are available:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cal+Sans:wght@600&display=swap");
```

Add to Tailwind `globals.css` or main CSS file.

## Best Practices

1. **Always use Cal Sans for headings** (h1, h2, h3, h4)
2. **Always use Inter for body text** (p, span, label)
3. **Use semantic color names** (charcoal, midnight, mid-gray) instead of hex values
4. **Leverage the shadow system** - never use CSS borders for cards, use `shadow-level-2-card` + `border-border-gray`
5. **Maintain generous whitespace** - section spacing of 80px creates premium feel
6. **Avoid custom colors** - the monochromatic palette is intentional
7. **Use the designSystem.js constants** for consistency
8. **Never add gradients** - depth comes from shadows, not color transitions

## Accessibility

- **Focus states**: Use `focus:ring-2 focus:ring-charcoal` for keyboard navigation
- **Contrast**: Charcoal on white meets WCAG AAA standards
- **Icon sizing**: 16px-20px minimum for clickable targets
- **Disabled state**: Use opacity-50 + cursor-not-allowed

## Performance Notes

- Multi-layered shadows are GPU-accelerated (no performance impact)
- No decorative imagery or gradients (faster rendering)
- Minimal color transitions (faster paint)
- Tailwind purge configured for production optimization

## Future Enhancements

- [ ] Dark mode support (flip charcoal/white, adjust shadows)
- [ ] Animation library polish (currently using Framer Motion)
- [ ] Responsive refinement for mobile (currently adequate)
- [ ] PDF export styling (maintain monochromatic theme)
- [ ] Print stylesheet (white text on charcoal background)

## Support & Questions

Refer to:

- `DESIGN.md` - Comprehensive design system spec
- `designSystem.js` - Reusable constants and utilities
- Updated component files - Implementation examples

---

**Last Updated**: April 2026
**Design Inspiration**: Cal.com + Uber's minimal aesthetic
**Font Stack**: Cal Sans (display) + Inter (body)
