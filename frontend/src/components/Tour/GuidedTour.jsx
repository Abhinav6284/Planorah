import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TOUR_STEPS, useTour } from './TourContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SPOTLIGHT_PAD = 12;  // px around target element
const TOOLTIP_W = 348;     // tooltip card width in px
const TOOLTIP_GAP = 18;    // gap between spotlight box and tooltip

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getTargetRect(selector) {
    if (!selector) return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
}

function computeTooltipStyle(rect, position, vw, vh) {
    if (!rect || position === 'center') {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        };
    }

    const sTop    = rect.top    - SPOTLIGHT_PAD;
    const sLeft   = rect.left   - SPOTLIGHT_PAD;
    const sRight  = rect.right  + SPOTLIGHT_PAD;
    const sBottom = rect.bottom + SPOTLIGHT_PAD;
    const sCenterX = sLeft + (sRight - sLeft) / 2;
    const sCenterY = sTop  + (sBottom - sTop)  / 2;

    const TOOLTIP_H_EST = 260; // estimated height for boundary checks

    if (position === 'bottom') {
        const top  = sBottom + TOOLTIP_GAP;
        const left = clamp(sCenterX - TOOLTIP_W / 2, 16, vw - TOOLTIP_W - 16);
        if (top + TOOLTIP_H_EST > vh - 16) {
            // flip to above
            return { top: Math.max(16, sTop - TOOLTIP_H_EST - TOOLTIP_GAP), left };
        }
        return { top, left };
    }

    if (position === 'top') {
        const top  = Math.max(16, sTop - TOOLTIP_H_EST - TOOLTIP_GAP);
        const left = clamp(sCenterX - TOOLTIP_W / 2, 16, vw - TOOLTIP_W - 16);
        if (top < 16) {
            return { top: sBottom + TOOLTIP_GAP, left };
        }
        return { top, left };
    }

    if (position === 'left') {
        const left = Math.max(16, sLeft - TOOLTIP_W - TOOLTIP_GAP);
        const top  = clamp(sCenterY - TOOLTIP_H_EST / 2, 16, vh - TOOLTIP_H_EST - 16);
        if (left < 16) {
            // flip to right
            return { top, left: Math.min(sRight + TOOLTIP_GAP, vw - TOOLTIP_W - 16) };
        }
        return { top, left };
    }

    if (position === 'right') {
        const left = Math.min(sRight + TOOLTIP_GAP, vw - TOOLTIP_W - 16);
        const top  = clamp(sCenterY - TOOLTIP_H_EST / 2, 16, vh - TOOLTIP_H_EST - 16);
        return { top, left };
    }

    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
}

// ---------------------------------------------------------------------------
// Tooltip arrow direction indicator (small terracotta triangle)
// ---------------------------------------------------------------------------
function ArrowIndicator({ position }) {
    if (!position || position === 'center') return null;

    const arrowStyles = {
        bottom: {
            top: -7,
            left: '50%',
            transform: 'translateX(-50%) rotate(0deg)',
            borderBottom: '7px solid rgba(217,108,74,0.5)',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
        },
        top: {
            bottom: -7,
            left: '50%',
            transform: 'translateX(-50%) rotate(180deg)',
            borderBottom: '7px solid rgba(217,108,74,0.5)',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
        },
        left: {
            right: -7,
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            borderBottom: '7px solid rgba(217,108,74,0.5)',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
        },
        right: {
            left: -7,
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            borderBottom: '7px solid rgba(217,108,74,0.5)',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
        },
    };

    return (
        <div
            style={{
                position: 'absolute',
                width: 0,
                height: 0,
                ...arrowStyles[position],
            }}
        />
    );
}

// ---------------------------------------------------------------------------
// Main GuidedTour Component
// ---------------------------------------------------------------------------
export default function GuidedTour() {
    const { active, step, next, back, skip, totalSteps } = useTour();
    const [rect, setRect] = useState(null);
    const [vSize, setVSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    const currentStep = TOUR_STEPS[step];

    // Recompute target rect whenever step or active changes
    useEffect(() => {
        if (!active) return;

        const recompute = () => {
            setVSize({ w: window.innerWidth, h: window.innerHeight });
            setRect(getTargetRect(currentStep?.target));
        };

        if (currentStep?.target) {
            const el = document.querySelector(currentStep.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Wait for scroll animation, then measure
                const t = setTimeout(recompute, 450);
                return () => clearTimeout(t);
            }
        }
        recompute();
    }, [active, step, currentStep]);

    useEffect(() => {
        const onResize = () => {
            setVSize({ w: window.innerWidth, h: window.innerHeight });
            setRect(getTargetRect(currentStep?.target));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [currentStep]);

    // Keyboard navigation
    useEffect(() => {
        if (!active) return;
        const handler = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') next();
            if (e.key === 'ArrowLeft') back();
            if (e.key === 'Escape') skip();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [active, next, back, skip]);

    if (!active) return null;

    const isCenter   = !currentStep?.target || currentStep?.position === 'center';
    const isFirst    = step === 0;
    const isLast     = step === totalSteps - 1;
    const progressPct = ((step + 1) / totalSteps) * 100;
    const tooltipStyle = computeTooltipStyle(rect, currentStep?.position, vSize.w, vSize.h);

    // Spotlight box dimensions (only when there's a target and rect was found)
    const spotlightStyle = rect && !isCenter
        ? {
            position: 'fixed',
            top:    rect.top    - SPOTLIGHT_PAD,
            left:   rect.left   - SPOTLIGHT_PAD,
            width:  rect.width  + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            zIndex: 9993,
            borderRadius: 16,
            pointerEvents: 'none',
            boxShadow: [
                `0 0 0 9999px rgba(5,5,5,0.78)`,
                `0 0 0 2px rgba(217,108,74,0.85)`,
                `0 0 40px rgba(217,108,74,0.3)`,
                `inset 0 0 0 1px rgba(255,255,255,0.04)`,
            ].join(', '),
        }
        : null;

    return (
        <AnimatePresence>
            {active && (
                <>
                    {/* ── Dark backdrop (behind spotlight div, which punches the hole) ── */}
                    {isCenter && (
                        <motion.div
                            key="tour-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={skip}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9990,
                                background: 'rgba(5,5,5,0.82)',
                                backdropFilter: 'blur(3px)',
                            }}
                        />
                    )}

                    {/* ── Spotlight highlight box (box-shadow does the heavy lifting) ── */}
                    {spotlightStyle && (
                        <motion.div
                            key={`spot-${step}`}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            style={spotlightStyle}
                        />
                    )}

                    {/* ── Tooltip Card ── */}
                    <motion.div
                        key={`tip-${step}`}
                        initial={{ opacity: 0, y: isCenter ? 28 : 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isCenter ? -12 : -6, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            zIndex: 9999,
                            width: TOOLTIP_W,
                            ...tooltipStyle,
                        }}
                    >
                        {/* Arrow indicator (not for center cards) */}
                        {!isCenter && <ArrowIndicator position={currentStep?.position} />}

                        {/* ── Card shell ── */}
                        <div
                            style={{
                                background: 'linear-gradient(160deg, #1e1e1e 0%, #141414 55%, #111111 100%)',
                                border: '1px solid rgba(217,108,74,0.3)',
                                borderRadius: 20,
                                overflow: 'hidden',
                                boxShadow: [
                                    '0 40px 80px rgba(0,0,0,0.65)',
                                    '0 0 0 1px rgba(255,255,255,0.04)',
                                    'inset 0 1px 0 rgba(255,255,255,0.07)',
                                    '0 0 60px rgba(217,108,74,0.08)',
                                ].join(', '),
                            }}
                        >
                            {/* Progress bar */}
                            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div
                                    initial={{ width: `${((step) / totalSteps) * 100}%` }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.45, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #c45b3a, #D96C4A, #e8855e)',
                                        borderRadius: '0 1px 1px 0',
                                    }}
                                />
                            </div>

                            {/* Body */}
                            <div style={{ padding: '20px 24px 22px' }}>

                                {/* Top row: step count + skip */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(217,108,74,0.85)',
                                        fontFamily: 'system-ui, sans-serif',
                                    }}>
                                        {step + 1} / {totalSteps}
                                    </span>
                                    <button
                                        onClick={skip}
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 500,
                                            color: 'rgba(255,255,255,0.28)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '3px 8px',
                                            borderRadius: 6,
                                            letterSpacing: '0.02em',
                                            transition: 'color 0.15s',
                                            fontFamily: 'system-ui, sans-serif',
                                        }}
                                        onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.55)'; }}
                                        onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.28)'; }}
                                    >
                                        Skip tour ✕
                                    </button>
                                </div>

                                {/* Icon + Title row */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                                    <motion.div
                                        key={`icon-${step}`}
                                        initial={{ scale: 0.7, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.08, duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 13,
                                            background: 'linear-gradient(135deg, rgba(217,108,74,0.15) 0%, rgba(217,108,74,0.06) 100%)',
                                            border: '1px solid rgba(217,108,74,0.22)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 20,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {currentStep?.icon}
                                    </motion.div>

                                    <div style={{ paddingTop: 3 }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: 15.5,
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            lineHeight: 1.3,
                                            letterSpacing: '-0.015em',
                                            fontFamily: 'system-ui, -apple-system, sans-serif',
                                        }}>
                                            {currentStep?.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{
                                    margin: '0 0 20px',
                                    fontSize: 13,
                                    lineHeight: 1.7,
                                    color: 'rgba(255,255,255,0.5)',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                }}>
                                    {currentStep?.description}
                                </p>

                                {/* Step dot indicators */}
                                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 20 }}>
                                    {TOUR_STEPS.map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                width:      i === step ? 22 : 6,
                                                background: i === step
                                                    ? '#D96C4A'
                                                    : i < step
                                                        ? 'rgba(217,108,74,0.4)'
                                                        : 'rgba(255,255,255,0.13)',
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            style={{ height: 6, borderRadius: 3 }}
                                        />
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {!isFirst && (
                                        <button
                                            onClick={back}
                                            style={{
                                                padding: '9px 16px',
                                                borderRadius: 11,
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.04)',
                                                color: 'rgba(255,255,255,0.5)',
                                                transition: 'all 0.15s',
                                                fontFamily: 'system-ui, sans-serif',
                                                letterSpacing: '0.01em',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                            }}
                                        >
                                            ← Back
                                        </button>
                                    )}

                                    <button
                                        onClick={next}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            borderRadius: 11,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #c45b3a 0%, #D96C4A 50%, #e0785a 100%)',
                                            color: '#fff',
                                            boxShadow: '0 4px 18px rgba(217,108,74,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                                            transition: 'all 0.18s ease',
                                            fontFamily: 'system-ui, sans-serif',
                                            letterSpacing: '0.01em',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(217,108,74,0.6), inset 0 1px 0 rgba(255,255,255,0.15)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 18px rgba(217,108,74,0.45), inset 0 1px 0 rgba(255,255,255,0.15)';
                                        }}
                                    >
                                        {isLast ? "Let's go! 🚀" : 'Next →'}
                                    </button>
                                </div>

                                {/* Keyboard hint */}
                                <p style={{
                                    margin: '12px 0 0',
                                    textAlign: 'center',
                                    fontSize: 10.5,
                                    color: 'rgba(255,255,255,0.2)',
                                    fontFamily: 'system-ui, sans-serif',
                                }}>
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
