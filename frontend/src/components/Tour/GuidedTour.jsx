import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TOUR_STEPS, useTour } from './TourContext';

// Constants
const SPOTLIGHT_PAD = 6;
const TOOLTIP_W = 352;
const TOOLTIP_GAP = 18;

const INTRO_POINTS = [
    {
        title: 'Where to start',
        description: 'The dashboard points to the next thing that matters.',
        icon: '1',
    },
    {
        title: 'What needs attention',
        description: 'Scan progress and spot pressure at a glance.',
        icon: '2',
    },
    {
        title: 'How to act',
        description: 'Open the coach or switch modes when you need a move.',
        icon: '3',
    },
];

const TOUR_THEME = {
    panel: 'var(--el-core-panel)',
    panelBorder: 'var(--el-border)',
    panelShadow: '0 18px 48px rgba(0, 0, 0, 0.18), var(--el-shadow-card)',
    accent: 'var(--orange)',
    accentDeep: 'var(--orange-deep)',
    accentSoft: 'color-mix(in srgb, var(--orange) 14%, transparent)',
    text: 'var(--el-text)',
    textSecondary: 'var(--el-text-secondary)',
    textMuted: 'var(--el-text-muted)',
    outline: 'color-mix(in srgb, var(--orange) 28%, transparent)',
    subtleBorder: 'var(--el-border-subtle)',
    softPanel: 'var(--el-bg-secondary)',
    overlay: 'rgba(10, 10, 12, 0.58)',
};

// Get target element rect
function getTargetRect(selector) {
    if (!selector) return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
}

// Clamp value
function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
}

// Compute tooltip position
function computeTooltipStyle(rect, position, vw, vh) {
    if (!rect || position === 'center') {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const sTop = rect.top - SPOTLIGHT_PAD;
    const sLeft = rect.left - SPOTLIGHT_PAD;
    const sRight = rect.right + SPOTLIGHT_PAD;
    const sBottom = rect.bottom + SPOTLIGHT_PAD;
    const sCenterX = sLeft + (sRight - sLeft) / 2;
    const sCenterY = sTop + (sBottom - sTop) / 2;
    const TOOLTIP_H_EST = 260;

    if (position === 'bottom') {
        const top = sBottom + TOOLTIP_GAP;
        const left = clamp(sCenterX - TOOLTIP_W / 2, 16, vw - TOOLTIP_W - 16);
        if (top + TOOLTIP_H_EST > vh - 16) {
            return { top: Math.max(16, sTop - TOOLTIP_H_EST - TOOLTIP_GAP), left };
        }
        return { top, left };
    }

    if (position === 'top') {
        const top = Math.max(16, sTop - TOOLTIP_H_EST - TOOLTIP_GAP);
        const left = clamp(sCenterX - TOOLTIP_W / 2, 16, vw - TOOLTIP_W - 16);
        return top < 16 ? { top: sBottom + TOOLTIP_GAP, left } : { top, left };
    }

    if (position === 'left') {
        const left = Math.max(16, sLeft - TOOLTIP_W - TOOLTIP_GAP);
        const top = clamp(sCenterY - TOOLTIP_H_EST / 2, 16, vh - TOOLTIP_H_EST - 16);
        return left < 16 ? { top, left: Math.min(sRight + TOOLTIP_GAP, vw - TOOLTIP_W - 16) } : { top, left };
    }

    if (position === 'right') {
        const left = Math.min(sRight + TOOLTIP_GAP, vw - TOOLTIP_W - 16);
        const top = clamp(sCenterY - TOOLTIP_H_EST / 2, 16, vh - TOOLTIP_H_EST - 16);
        return { top, left };
    }

    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
}

export default function GuidedTour() {
    const { active, step, next, back, skip, totalSteps } = useTour();
    const [rect, setRect] = useState(null);
    const [vSize, setVSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    const currentStep = TOUR_STEPS[step];

    // Fast rect computation
    useEffect(() => {
        if (!active || !currentStep) return;

        const measure = () => {
            if (currentStep.target) {
                const el = document.querySelector(currentStep.target);
                if (el) {
                    el.scrollIntoView({ behavior: 'auto', block: 'center' });
                    setRect(el.getBoundingClientRect());
                    return;
                }
            }
            setRect(null);
        };

        measure();

        const raf = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(raf);
    }, [active, step, currentStep]);

    // Throttled resize handler
    useEffect(() => {
        let timeout;
        const onResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setVSize({ w: window.innerWidth, h: window.innerHeight });
                setRect(prev => prev ? getTargetRect(currentStep?.target) : null);
            }, 100);
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(timeout);
        };
    }, [currentStep]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!active) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') next();
            else if (e.key === 'ArrowLeft') back();
            else if (e.key === 'Escape') skip();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [active, next, back, skip]);

    if (!active) return null;

    const isCenter = !currentStep?.target || currentStep?.position === 'center';
    const isFirst = step === 0;
    const isLast = step === totalSteps - 1;
    const isWelcomeStep = currentStep?.id === 'welcome';
    const progressPct = ((step + 1) / totalSteps) * 100;
    const tooltipStyle = computeTooltipStyle(rect, currentStep?.position, vSize.w, vSize.h);

    const spotlightStyle = rect && !isCenter
        ? {
            position: 'fixed',
            top: rect.top - SPOTLIGHT_PAD,
            left: rect.left - SPOTLIGHT_PAD,
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            zIndex: 9993,
            borderRadius: Math.min(18, Math.max(12, rect.height / 3)),
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            boxShadow: `0 0 0 9999px ${TOUR_THEME.overlay}, 0 0 0 1px ${TOUR_THEME.outline}, 0 10px 28px color-mix(in srgb, var(--orange) 20%, transparent)`,
        }
        : null;

    return (
        <AnimatePresence mode="wait">
            {active && (
                <>
                    {/* Dark Backdrop */}
                    {isCenter && (
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            onClick={skip}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9990,
                                background: TOUR_THEME.overlay,
                                backdropFilter: 'blur(8px)',
                            }}
                        />
                    )}

                    {/* Spotlight */}
                    {spotlightStyle && (
                        <motion.div
                            key={`spot-${step}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                            style={spotlightStyle}
                        />
                    )}

                    {/* Tooltip Card */}
                    <motion.div
                        key={`tip-${step}`}
                        initial={{ opacity: 0, y: isCenter ? 20 : 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isCenter ? -10 : -6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            zIndex: 9999,
                            width: `min(${TOOLTIP_W}px, calc(100vw - 32px))`,
                            maxHeight: 'calc(100vh - 32px)',
                            ...tooltipStyle,
                            willChange: 'transform, opacity',
                        }}
                    >
                        <div style={{
                            background: TOUR_THEME.panel,
                            border: `1px solid ${TOUR_THEME.panelBorder}`,
                            borderRadius: 20,
                            overflow: 'hidden',
                            boxShadow: TOUR_THEME.panelShadow,
                            backdropFilter: 'blur(20px)',
                            maxHeight: 'calc(100vh - 32px)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Progress Bar */}
                            <div style={{ height: 3, background: TOUR_THEME.softPanel }}>
                                <motion.div
                                    initial={{ width: `${((step) / totalSteps) * 100}%` }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.24, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--orange-deep) 0%, var(--orange) 55%, color-mix(in srgb, var(--orange) 72%, white) 100%)',
                                        boxShadow: '0 0 14px color-mix(in srgb, var(--orange) 35%, transparent)',
                                        willChange: 'width',
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, border: `1px solid ${TOUR_THEME.subtleBorder}`, background: 'var(--el-bg-secondary)', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: TOUR_THEME.textMuted, whiteSpace: 'nowrap' }}>
                                            {isWelcomeStep ? 'Student overview guide' : 'Overview step'}
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: TOUR_THEME.textMuted, whiteSpace: 'nowrap' }}>
                                            {step + 1} of {totalSteps}
                                        </span>
                                    </div>

                                    <button
                                        onClick={skip}
                                        style={{ fontSize: 11, fontWeight: 600, color: TOUR_THEME.textMuted, background: 'transparent', border: `1px solid ${TOUR_THEME.subtleBorder}`, cursor: 'pointer', padding: '5px 10px', borderRadius: 999, transition: 'all 0.14s ease', whiteSpace: 'nowrap', flexShrink: 0 }}
                                        onMouseEnter={e => { e.currentTarget.style.color = TOUR_THEME.text; e.currentTarget.style.borderColor = TOUR_THEME.panelBorder; e.currentTarget.style.background = 'var(--el-bg-secondary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = TOUR_THEME.textMuted; e.currentTarget.style.borderColor = TOUR_THEME.subtleBorder; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        Skip tour ✕
                                    </button>
                                </div>

                                {/* Title + Icon */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <motion.div key={`icon-${step}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.03, duration: 0.14, ease: 'easeOut' }} style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${TOUR_THEME.accentSoft} 0%, var(--el-bg-secondary) 100%)`, border: `1px solid color-mix(in srgb, var(--orange) 16%, var(--el-border) 84%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                        {currentStep?.icon}
                                    </motion.div>
                                    <motion.div key={`title-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02, duration: 0.14, ease: 'easeOut' }} style={{ display: 'flex', alignItems: 'center', minHeight: 42 }}>
                                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: TOUR_THEME.text, lineHeight: 1.32, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                                            {currentStep?.title}
                                        </h3>
                                    </motion.div>
                                </div>

                                {/* Description */}
                                <motion.p key={`desc-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06, duration: 0.14, ease: 'easeOut' }} style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.7, color: TOUR_THEME.textSecondary }}>
                                    {currentStep?.description}
                                </motion.p>

                                {isWelcomeStep && (
                                    <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                                        {INTRO_POINTS.map((point) => (
                                            <div key={point.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 14, background: 'var(--el-bg-secondary)', border: `1px solid ${TOUR_THEME.subtleBorder}` }}>
                                                <div style={{ width: 22, height: 22, borderRadius: 999, background: TOUR_THEME.accentSoft, color: TOUR_THEME.accentDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10.5, fontWeight: 800 }}>
                                                    {point.icon}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 750, color: TOUR_THEME.text, marginBottom: 2 }}>
                                                        {point.title}
                                                    </div>
                                                    <div style={{ fontSize: 11.5, lineHeight: 1.45, color: TOUR_THEME.textSecondary }}>
                                                        {point.description}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isWelcomeStep && (
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                                        {TOUR_STEPS.map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ width: i === step ? 24 : 6, background: i === step ? TOUR_THEME.accent : i < step ? 'color-mix(in srgb, var(--orange) 40%, transparent)' : TOUR_THEME.softPanel, boxShadow: i === step ? '0 0 12px color-mix(in srgb, var(--orange) 40%, transparent)' : 'none' }}
                                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                                style={{ height: 6, borderRadius: 3, willChange: 'width, background, box-shadow' }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {!isFirst && (
                                        <button onClick={back} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: `1px solid ${TOUR_THEME.subtleBorder}`, background: TOUR_THEME.softPanel, color: TOUR_THEME.textSecondary, transition: 'all 0.12s', boxShadow: 'var(--el-shadow-button)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--el-bg)'; e.currentTarget.style.color = TOUR_THEME.text; e.currentTarget.style.borderColor = TOUR_THEME.panelBorder; }} onMouseLeave={e => { e.currentTarget.style.background = TOUR_THEME.softPanel; e.currentTarget.style.color = TOUR_THEME.textSecondary; e.currentTarget.style.borderColor = TOUR_THEME.subtleBorder; }}>
                                            ← Back
                                        </button>
                                    )}

                                    <motion.button
                                        onClick={next}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            padding: '12px 22px',
                                            borderRadius: 14,
                                            fontSize: 13,
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            border: '1px solid color-mix(in srgb, var(--orange) 38%, transparent)',
                                            background: 'linear-gradient(135deg, var(--orange-deep) 0%, var(--orange) 52%, color-mix(in srgb, var(--orange) 70%, white) 100%)',
                                            color: '#fff',
                                            boxShadow: '0 10px 24px color-mix(in srgb, var(--orange) 22%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)',
                                            transition: 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                                            willChange: 'transform, box-shadow',
                                            fontFamily: 'var(--font-display)',
                                        }}
                                    >
                                        {isLast ? "Start exploring" : isFirst ? 'Begin the overview →' : 'Next →'}
                                    </motion.button>
                                </div>

                                {/* Hint */}
                                <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 10.5, color: TOUR_THEME.textMuted, flexShrink: 0 }}>
                                    ← → arrow keys to navigate · Esc to exit
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
