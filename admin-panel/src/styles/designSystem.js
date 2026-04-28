/**
 * Cal.com-inspired Design System
 * Reusable styling constants and class patterns for consistent UI
 */

// ─── Color Palette ────────────────────────────────────────────────────────────
export const colors = {
    // Primary palette
    charcoal: '#242424',
    midnight: '#111111',
    midGray: '#898989',
    white: '#ffffff',

    // Accent & interactive
    linkBlue: '#0099ff',
    focusBlue: 'rgba(59, 130, 246, 0.5)',

    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
}

// ─── Typography Classes ──────────────────────────────────────────────────────
export const typography = {
    // Headlines - Cal Sans
    h1: 'font-cal-sans font-semibold text-4xl text-charcoal tracking-tight',
    h2: 'font-cal-sans font-semibold text-3xl text-charcoal tracking-tight',
    h3: 'font-cal-sans font-semibold text-2xl text-charcoal tracking-tight',
    h4: 'font-cal-sans font-semibold text-xl text-charcoal',

    // Body text - Inter
    body: 'font-inter text-base text-charcoal leading-relaxed',
    bodySm: 'font-inter text-sm text-charcoal',
    bodyXs: 'font-inter text-xs text-charcoal',

    // Secondary text
    secondary: 'font-inter text-sm text-mid-gray',
    secondarySm: 'font-inter text-xs text-mid-gray',

    // Labels & captions
    label: 'font-inter text-sm font-semibold text-charcoal',
    caption: 'font-inter text-xs text-mid-gray',

    // Muted
    muted: 'font-inter text-xs text-mid-gray',
}

// ─── Spacing Scale (8px base unit) ────────────────────────────────────────────
export const spacing = {
    xs: '1px',
    sm: '2px',
    md: '4px',
    base: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',
    '3xl': '24px',
    '4xl': '28px',
    section: '80px',
}

// ─── Spacing Classes ────────────────────────────────────────────────────────
export const spacingClasses = {
    // Cards
    cardPadding: 'p-6',
    cardCompactPadding: 'p-4',
    cardLargePadding: 'p-8',

    // Sections
    sectionSpacing: 'mb-12',
    sectionCompact: 'mb-6',
    sectionLarge: 'mb-16',

    // Grid gaps
    gridGap: 'gap-6',
    gridCompactGap: 'gap-4',
    gridLargeGap: 'gap-8',
}

// ─── Shadow System (Cal.com multi-layered) ────────────────────────────────────
export const shadows = {
    // Level 1 - Inset (pressed/recessed)
    inset: 'shadow-level-1-inset',

    // Level 2 - Card (primary)
    card: 'shadow-level-2-card',
    cardAlt: 'shadow-level-2-alt',

    // Level 3 - Soft ambient
    soft: 'shadow-level-3-soft',

    // Level 4 - Highlight
    highlight: 'shadow-level-4-highlight',

    // Quick shortcuts
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
}

// ─── Border & Radius ──────────────────────────────────────────────────────────
export const borders = {
    radius: {
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        pill: 'rounded-pill',
    },
    border: 'border border-border-gray',
    borderSubtle: 'border border-gray-100',
    borderNone: 'border-0',
}

// ─── Component Classes ────────────────────────────────────────────────────────
export const components = {
    // Card base
    card: `bg-white ${shadows.card} ${borders.border} rounded-lg`,
    cardCompact: `bg-white ${shadows.card} ${borders.border} rounded-lg p-4`,
    cardStandard: `bg-white ${shadows.card} ${borders.border} rounded-lg p-6`,
    cardLarge: `bg-white ${shadows.card} ${borders.border} rounded-lg p-8`,

    // Button base
    buttonPrimary: 'bg-charcoal text-white font-inter text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors hover:bg-midnight',
    buttonSecondary: 'bg-white text-charcoal font-inter text-sm font-semibold px-4 py-2.5 rounded-lg border border-border-gray transition-colors hover:bg-gray-50',
    buttonGhost: 'text-charcoal font-inter text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-50',

    // Input base
    input: 'w-full bg-white border border-border-gray rounded-lg px-4 py-2.5 font-inter text-sm text-charcoal placeholder-mid-gray transition-colors focus:outline-none focus:border-charcoal',

    // Badge/Tag
    badge: 'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-charcoal',
    badgePrimary: 'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-charcoal text-white',
}

// ─── Layout Classes ──────────────────────────────────────────────────────────
export const layouts = {
    // Grid
    gridAuto2: 'grid grid-cols-2 lg:grid-cols-4 gap-6',
    gridAuto3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',

    // Flexbox
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',
    flexStart: 'flex items-start',

    // Page container
    pageContainer: 'max-w-7xl mx-auto px-8 py-8',
}

// ─── Hover & Interactive States ───────────────────────────────────────────────
export const interactive = {
    hoverDark: 'hover:bg-gray-50 transition-colors',
    hoverBorder: 'hover:border-charcoal transition-colors',
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
}

// ─── Animation Defaults ────────────────────────────────────────────────────────
export const animations = {
    transitionFast: 'transition-all duration-150',
    transitionNormal: 'transition-all duration-300',
    transitionSlow: 'transition-all duration-500',
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Create a card with given padding size
 */
export const createCard = (size = 'standard') => {
    return components[`card${size.charAt(0).toUpperCase() + size.slice(1)}`]
        || components.cardStandard
}

/**
 * Combine multiple class sets
 */
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ')
}

/**
 * Theme-aware color getter
 */
export const getColor = (colorName) => {
    return colors[colorName] || colors.charcoal
}

export default {
    colors,
    typography,
    spacing,
    spacingClasses,
    shadows,
    borders,
    components,
    layouts,
    interactive,
    animations,
    createCard,
    cn,
    getColor,
}
