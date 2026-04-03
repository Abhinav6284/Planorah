# Planora Landing Page - Bartix-Inspired Design Guide

## 🎨 Design Philosophy

This landing page is **strictly inspired by Bartix** (https://bartix.framer.website/) with Planora's content. Every visual element, spacing, typography, and interaction is designed to match Bartix's premium, minimal aesthetic.

**Key Principle**: Same UI skeleton, same aesthetics, different content.

---

## 🎨 Visual Style

### Color Palette
- **Primary**: Solid gray/black (gray-950 / white)
- **Backgrounds**: 
  - Light: White (#FFFFFF)
  - Dark: Slate-950 (#020617)
  - Section alt: Gray-50 / Slate-900
- **Borders**: Subtle gray borders (gray-200/50, white/[0.08])
- **Text**: Black/white with gray accents for secondary text

### No Heavy Gradients
Unlike modern SaaS designs, Bartix uses:
- Simple solid colors
- Minimal gradient usage
- Emphasis on whitespace over visual effects

### Typography
- **Headings**: Large, bold sans-serif (6xl–7xl)
- **Font**: Inter, 600–700 weight
- **Subheadings**: 2xl, medium weight
- **Body**: 16–18px, regular weight
- **Secondary**: 14px, gray-600 color

### Spacing System
- Section padding: `py-32` (128px top/bottom)
- Container max-width: `max-w-7xl`
- Card padding: `p-8` (32px)
- Grid gap: `gap-8` to `gap-12` (32–48px)
- Large heading to subheading gap: 24–32px

### Borders & Shadows
- **Card borders**: `border border-gray-200 dark:border-white/[0.08]`
- **Subtle shadows**: `shadow-sm` or none
- **Rounded**: `rounded-2xl` (16px) for cards, `rounded-full` for buttons
- **No excessive effects**: Keep it minimal and clean

---

## 📄 Landing Page Sections

### **1. Navbar** (Fixed, Sticky)
- **Max width**: `max-w-6xl`
- **Padding**: `px-6 py-3 rounded-full`
- **Glassmorphism**: Subtle backdrop blur on scroll
- **Content**:
  - Logo/Brand name (left)
  - Navigation links (center): Features, How it works, Pricing
  - Actions (right): Theme toggle, Sign in, Get started button
- **Mobile**: Hamburger menu with full-screen overlay
- **Transition**: Smooth border/shadow change on scroll at `window.scrollY > 50`

### **2. Hero Section**
- **Layout**: Full viewport height with centered text
- **Alignment**: Left-aligned content, max-width constraint
- **Content Stack**:
  1. Headline: Large (6xl–8xl), bold, black/white
  2. Subheading: 2xl, gray-600 color, max-width 2xl
  3. CTA buttons: Primary (solid bg) + Secondary (outline)
  4. Social proof: "1000+ students" + "4.9/5 rating"
- **Spacing**: 32px gaps between elements
- **No mockup/image**: Clean text-focused hero (like Bartix)

### **3. Features Section** (ID: #features)
- **Background**: White / Slate-950
- **Header**:
  - Headline: 5xl–6xl, bold
  - Subheading: xl, gray-600
  - Max-width: 2xl for text
- **Layout**: **4-column grid** (responsive: 2 → 1 on mobile)
- **Cards** (4 total, NO fancy styling):
  - Icon: Simple line icon, 8x8, gray-950/white
  - Title: lg, bold
  - Description: base, gray-600
  - **No hover effects, no gradients, no borders**
- **Spacing**: `gap-8` between cards, `space-y-4` inside

### **4. How It Works** (ID: #how-it-works)
- **Background**: Gray-50 / Slate-900 (alt background)
- **Header**: Same as Features (headline + subheading)
- **Layout**: **2x2 grid** (4 steps total)
- **Step Card Content**:
  - Number: Large (5xl), light opacity
  - Icon/Emoji: Large text (3xl–4xl)
  - Title: 2xl–3xl, bold
  - Description: lg, gray-600
- **Spacing**: `gap-12 lg:gap-16`
- **CTA at bottom**: Button + separator line above

### **5. Testimonials Section**
- **Background**: White / Slate-950
- **Header**: Same pattern (5xl headline + subheading)
- **Layout**: **3-column grid**
- **Cards**:
  - 5-star rating (simple stars, no color)
  - Quote in quotes: lg, gray-700
  - Author section: Initials avatar (12x12) + name/role
  - Border: `border border-gray-200 dark:border-white/[0.08]`
  - Background: `bg-gray-50 dark:bg-gray-900/50`
  - Padding: `p-8`
  - **No gradient borders, no hover effects**

### **6. Pricing Section** (ID: #pricing)
- **Background**: Gray-50 / Slate-900
- **Header**: 5xl headline, xl subheading
- **Layout**: **3-column grid**
- **Cards**:
  - Popular plan: `border-2 border-gray-950` + `ring-1 ring-gray-950/5`
  - Other plans: `border border-gray-200`
  - Badge: "Most Popular" at top (-top-4)
  - Content: Name, description, price, features list, CTA button
  - Features: Check icon + text, no colors
  - Button: Solid for popular, outline for others
- **Enterprise note**: Below cards, small gray text with mailto link

### **7. Final CTA Section**
- **Background**: White / Slate-950
- **Content**:
  - Large headline: 5xl–7xl
  - Subheading: xl, gray-600
  - 2 CTAs: Primary + Secondary
  - Trust indicators: "✓ No credit card required" + dividers
- **Alignment**: Centered text, max-width constraint
- **Spacing**: 32px between elements

### **8. Footer**
- **Border**: Top border, subtle gray
- **Layout**: 4-column grid
  - Brand column: Logo, tagline, social icons
  - 3 Link columns: Product, Resources, Company
- **Bottom section**: Copyright + legal links, small gray text
- **Spacing**: `py-16` main, `py-8` bottom
- **Social icons**: Hover effect (slight bg color change)

---

## ✨ Animation Approach

### Scroll Animations
- **`whileInView`**: Fade in + slide up (y: 20)
- **Viewport margin**: `-100px` (trigger slightly before visible)
- **Stagger**: `delay: idx * 0.1` for list items
- **Duration**: `0.6–0.8s` for all animations

### No Interactive Animations
- **No hover effects on cards** (Bartix doesn't have them)
- **Simple button hover**: Just background color change
- **No parallax, no complex effects**

### Transitions
- **Color/shadow changes**: `transition-colors`, `transition-all`
- **Duration**: `300ms` default for hovers

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (1 column grids)
- **Tablet**: 640–1024px (2 column grids)
- **Desktop**: > 1024px (3–4 column grids)

### Adjustments
- Hero headline: 5xl (mobile) → 7xl (desktop)
- Feature grid: 1 col → 2 col → 4 col
- Section padding: `py-16` (mobile) → `py-32` (desktop)

---

## 🎯 Key Design Principles (Bartix Style)

1. **Minimal & Clean**: Maximum whitespace, no unnecessary elements
2. **Premium Feel**: Solid colors, subtle borders, clean typography
3. **No Flashiness**: Simple animations, no gradients, no glow effects
4. **Content First**: Let the words do the talking
5. **Consistent Spacing**: Every section follows the same rhythm
6. **Semantic Colors**: Black/white for hierarchy, gray for secondary
7. **Simple Interactions**: Subtle hover states only
8. **Dark Mode Ready**: Every color has a dark variant

---

## 🔧 Technical Details

### Tailwind Classes Used
- `bg-white dark:bg-slate-950`
- `border border-gray-200 dark:border-white/[0.08]`
- `rounded-2xl rounded-full`
- `py-32 px-4 sm:px-6 lg:px-8`
- `gap-8 gap-12` (between items)
- `text-5xl text-6xl font-bold`
- `max-w-7xl mx-auto w-full`
- `hover:bg-gray-900 transition-colors`

### Animations
- Framer Motion: `motion.div`, `whileInView`, `initial`, `animate`
- Duration: 0.6–0.8 seconds
- No spring physics, simple easing

### Mobile Menu
- Full-screen overlay on mobile
- AnimatePresence for smooth exit
- Simple fade + slide animation

---

## 🌙 Dark Mode

All sections have dark mode variants:
- Text: `text-gray-950 dark:text-white`
- Borders: `border-gray-200/50 dark:border-white/[0.08]`
- Backgrounds: `bg-white dark:bg-slate-950`
- Hover: `hover:bg-gray-50 dark:hover:bg-white/[0.05]`

---

## ✅ Checklist for Consistency

- [ ] No heavy gradients (only solid colors)
- [ ] No shadow glows or colored shadows
- [ ] Spacing follows `py-32` / `gap-8` rhythm
- [ ] All grids are 1 → 2 → 3/4 columns
- [ ] Buttons are rounded-full with no icons or simple icons
- [ ] Cards are minimal with no hover lift effects
- [ ] Typography is large, bold, and clean
- [ ] No animations on scroll (except simple fade-in)
- [ ] Dark mode works everywhere
- [ ] Mobile menu is simple overlay, not sidebar

---

## 📐 Size Reference

```
Hero Headline:     5xl (mobile) → 7xl (desktop)
Section Headline:  5xl → 6xl
Subheading:        xl → 2xl
Body Text:         16px → 18px
Button Padding:    py-3 (mobile) → py-4 (desktop)
Section Padding:   py-16 (mobile) → py-32 (desktop)
Card Padding:      p-8 (consistent)
Grid Gap:          gap-8 → gap-12 (consistent)
Max Width:         max-w-7xl (all sections)
```

---

## 🚀 Reference: Bartix Website

Visit https://bartix.framer.website/ to compare:
- Overall spacing rhythm
- Typography hierarchy
- Card styling (minimal, no shadows)
- Button styling (rounded-full, simple)
- Section transitions (fade-in, no parallax)
- Dark mode implementation
- Mobile responsiveness

**This design is a faithful Planora adaptation of the Bartix aesthetic.**

