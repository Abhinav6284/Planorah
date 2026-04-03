# Planora Landing Page - Bartix-Inspired Design

## 🎯 Design Philosophy

This landing page **replicates the visual structure and aesthetic of Bartix** while keeping Planora's unique content. The design prioritizes:

- ✅ **Exact layout matching**: Same section order, proportions, and grid structure
- ✅ **Visual identity**: Gradient borders, glassmorphism, premium minimalism
- ✅ **Typography hierarchy**: Bold headlines, clean sans-serif, readable subtext
- ✅ **Spacing rhythm**: Consistent padding, aligned grids, breathing room
- ✅ **Interactive elements**: Smooth animations, hover effects, scroll reveals

---

## 📐 Layout Structure

### Page Sections (in order):

1. **Navbar** - Fixed, glassmorphic
2. **Hero Section** - 2-column (text left, product mockup right)
3. **Features Section** - 2-column grid (matches Bartix)
4. **Showcase Section** - 3-column stat cards (gradient borders)
5. **How It Works** - 4-step timeline
6. **Testimonials** - 3-column cards with ratings
7. **Pricing** - 3-column plans
8. **Final CTA** - Centered conversion section
9. **Footer** - Clean multi-column layout

---

## 🎨 Visual System (Bartix-Matched)

### Gradient Borders (Key Design Element)
Every card uses **colored gradient borders**:
```
- Blue → Cyan
- Purple → Pink
- Emerald → Teal
- Amber → Orange
```

### Card Structure
1. **Outer**: Gradient border (2px)
2. **Middle**: White gap (1px)
3. **Inner**: Glassmorphic content
   - `bg-white/70 dark:bg-gray-900/70`
   - `backdrop-blur-xl`
   - `border border-white/20 dark:border-white/10`

### Colors
- **Light Mode**: White backgrounds, dark text
- **Dark Mode**: Gray-950 backgrounds, white text
- **Gradients**: Blue, Purple, Emerald, Amber primary colors

### Typography
- **Headlines**: 5xl–7xl, bold (600–700)
- **Subheadings**: xl–2xl, semibold
- **Body**: sm–lg, medium weight
- **Overlines**: 11px, semibold, colored

### Spacing
- **Sections**: py-32 (128px)
- **Cards**: p-8 (32px)
- **Grid Gap**: gap-8 to gap-12
- **Vertical spacing**: 4–6px base unit

### Shadows
- Cards: `shadow-lg` (subtle)
- Hover: Enhanced shadows
- Glows: Colored shadows (e.g., `shadow-blue-500/20`)

---

## 📄 Section Details

### 1. Hero Section
**Layout**: 2-column grid with 12–16px gap
- **Left**: Content (headline, subheading, CTAs, social proof)
- **Right**: Product mockup card with gradient border
  - Shows dashboard preview
  - Milestone progress cards inside
  - Task list example

**Visual**:
- Large headline with gradient accent
- Overline badge with icon
- Dual CTAs (primary gradient, secondary outlined)
- Avatar stack showing users

### 2. Features Section  
**Layout**: 2-column grid (not 3-column)
- Each feature has gradient border card
- Icon in top-left
- Title + description below

### 3. Showcase Section
**Layout**: 3-column grid (stat cards)
- Large stat number
- Subtitle (e.g., "Goal achievement")
- Icon in card
- Title + description

### 4. How It Works
**Layout**: 4-column timeline
- Step number (large, faded)
- Emoji icon
- Title + description
- Connector lines between steps (desktop)

### 5. Testimonials
**Layout**: 3-column card grid
- 5-star ratings
- Quote text
- Author avatar (gradient)
- Name + role
- Trust metrics below (1000+, 4.9★, 42 days)

### 6. Pricing
**Layout**: 3-column plan cards
- Plan name + description
- Price display
- Feature checklist
- CTA button (gradient for popular)
- Popular badge above Pro plan

### 7. Final CTA
**Layout**: Centered large card
- Headline with gradient accent
- Subheading
- Dual CTAs
- Social proof section

---

## ✨ Animations (Bartix-Style)

### Scroll Reveal
- Initial: `opacity: 0, y: 20`
- On view: `opacity: 1, y: 0`
- Duration: 600ms
- Viewport margin: -100px (triggers before fully visible)

### Stagger
- Children delay: `index * 0.1` (100ms between each)
- Creates cascading reveal effect

### Hover Effects
- Cards: `y: -4` (lift slightly)
- Icons: `scale: 1.1`
- Buttons: `scale: 1.02`

### Interactive
- Smooth transitions on all states
- No jarring effects
- Transitions: 200–300ms for quick interactions

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Columns | Typography |
|-----------|-------|---------|------------|
| Mobile | < 640px | 1 | Scaled down |
| Tablet | 640–1024px | 1–2 | Adjusted |
| Desktop | > 1024px | 2–3 | Full size |

---

## 🔧 Implementation Notes

### CSS Classes (Tailwind)
```css
/* Gradient border card */
.gradient-border-card {
  @apply relative rounded-2xl overflow-hidden;
}

.gradient-border-card::before {
  @apply absolute inset-0 bg-gradient-to-br rounded-2xl p-[2px];
}

.gradient-border-card > div {
  @apply relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10;
}

/* Glassmorphism */
.glass {
  @apply bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10;
}

/* Premium text */
.premium-text {
  @apply text-6xl lg:text-7xl font-bold leading-tight;
}
```

### React Components
- Use Framer Motion for scroll animations
- `whileInView` for viewport triggers
- `initial/animate` for entrance effects
- Lucide React for icons

---

## ✅ Quality Checklist

- [ ] All sections have gradient borders on cards
- [ ] Spacing matches 32px base unit
- [ ] Typography hierarchy is clear
- [ ] Animations are smooth (60fps)
- [ ] Dark mode is fully supported
- [ ] Mobile responsive layout works
- [ ] Social proof elements visible
- [ ] CTAs are prominent and clear
- [ ] Footer is clean and organized
- [ ] Hover states are subtle but visible

---

## 🎯 Design Goals

1. **Premium Aesthetic**: High-end SaaS feel without clutter
2. **Clarity**: Clear hierarchy and easy navigation
3. **Trust**: Social proof, testimonials, credentials
4. **Conversion**: Multiple CTAs strategically placed
5. **Smooth Experience**: No jarring transitions or animations
6. **Accessibility**: Good contrast, readable text, keyboard navigation

---

**Note**: This design matches Bartix's visual language while maintaining Planora's unique value proposition and content.
