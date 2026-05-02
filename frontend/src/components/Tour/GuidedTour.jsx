import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TOUR_STEPS, useTour } from './TourContext';

// Constants
const SPOTLIGHT_PAD = 12;
const TOOLTIP_W = 348;
const TOOLTIP_GAP = 18;

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

// Arrow indicator
function ArrowIndicator({ position }) {
    if (!position || position === 'center') return null;

    const arrowStyles = {
        bottom: { top: -7, left: '50%', transform: 'translateX(-50%)', borderBottom: '7px solid rgba(217,108,74,0.5)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' },
        top: { bottom: -7, left: '50%', transform: 'translateX(-50%) rotate(180deg)', borderBottom: '7px solid rgba(217,108,74,0.5)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' },
        left: { right: -7, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', borderBottom: '7px solid rgba(217,108,74,0.5)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' },
        right: { left: -7, top: '50%', transform: 'translateY(-50%) rotate(90deg)', borderBottom: '7px solid rgba(217,108,74,0.5)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' },
    };

    return <div style={{ position: 'absolute', width: 0, height: 0, ...arrowStyles[position] }} />;
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
            borderRadius: 16,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            boxShadow: `0 0 0 9999px rgba(5,5,5,0.78), 0 0 0 2px rgba(217,108,74,0.85), 0 0 40px rgba(217,108,74,0.3)`,
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
                                background: 'rgba(5,5,5,0.82)',
                                backdropFilter: 'blur(3px)',
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
                            width: TOOLTIP_W,
                            ...tooltipStyle,
                            willChange: 'transform, opacity',
                        }}
                    >
                        {!isCenter && <ArrowIndicator position={currentStep?.position} />}

                        <div style={{
                            background: 'var(--el-bg-secondary)',
                            border: '1px solid rgba(217,108,74,0.35)',
                            borderRadius: 22,
                            overflow: 'hidden',
                            boxShadow: 'var(--el-shadow-card)',
                            backdropFilter: 'blur(4px)',
                        }}>
                            {/* Progress Bar */}
                            <div style={{ height: 2.5, background: 'var(--el-border)' }}>
                                <motion.div
                                    initial={{ width: `${((step) / totalSteps) * 100}%` }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.24, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #c45b3a 0%, #D96C4A 50%, #e8955f 100%)',
                                        boxShadow: '0 0 12px rgba(217,108,74,0.5)',
                                        willChange: 'width',
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px 24px 22px' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(217,108,74,0.85)' }}>
                                        {step + 1} / {totalSteps}
                                    </span>
                                    <button onClick={skip} style={{ fontSize: 11, fontWeight: 500, color: 'var(--el-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, transition: 'color 0.1s' }} onMouseEnter={e => e.target.style.color = 'var(--el-text-secondary)'} onMouseLeave={e => e.target.style.color = 'var(--el-text-muted)'}>
                                        Skip tour ✕
                                    </button>
                                </div>

                                {/* Title + Icon */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                                    <motion.div key={`icon-${step}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.03, duration: 0.14, ease: 'easeOut' }} style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, rgba(217,108,74,0.15) 0%, rgba(217,108,74,0.06) 100%)', border: '1px solid rgba(217,108,74,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                        {currentStep?.icon}
                                    </motion.div>
                                    <motion.div key={`title-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02, duration: 0.14, ease: 'easeOut' }} style={{ paddingTop: 3 }}>
                                        <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: 'var(--el-text)', lineHeight: 1.35, letterSpacing: '-0.015em' }}>
                                            {currentStep?.title}
                                        </h3>
                                    </motion.div>
                                </div>

                                {/* Description */}
                                <motion.p key={`desc-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06, duration: 0.14, ease: 'easeOut' }} style={{ margin: '0 0 20px', fontSize: 13, lineHeight: 1.75, color: 'var(--el-text-secondary)' }}>
                                    {currentStep?.description}
                                </motion.p>

                                {/* Dots */}
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
                                    {TOUR_STEPS.map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ width: i === step ? 24 : 6, background: i === step ? '#D96C4A' : i < step ? 'rgba(217,108,74,0.5)' : 'var(--el-border)', boxShadow: i === step ? '0 0 12px rgba(217,108,74,0.6)' : 'none' }}
                                            transition={{ duration: 0.16, ease: 'easeOut' }}
                                            style={{ height: 6, borderRadius: 3, willChange: 'width, background, box-shadow' }}
                                        />
                                    ))}
                                </div>

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {!isFirst && (
                                        <button onClick={back} style={{ padding: '9px 16px', borderRadius: 11, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--el-border)', background: 'var(--el-bg)', color: 'var(--el-text-secondary)', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--el-bg-secondary)'; e.currentTarget.style.color = 'var(--el-text)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--el-bg)'; e.currentTarget.style.color = 'var(--el-text-secondary)'; }}>
                                            ← Back
                                        </button>
                                    )}

                                    <motion.button
                                        onClick={next}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            padding: '11px 22px',
                                            borderRadius: 12,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #c45b3a 0%, #D96C4A 50%, #e19060 100%)',
                                            color: '#fff',
                                            boxShadow: '0 6px 20px rgba(217,108,74,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                                            transition: 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                                            willChange: 'transform, box-shadow',
                                        }}
                                    >
                                        {isLast ? "Let's go! 🚀" : 'Next →'}
                                    </motion.button>
                                </div>

                                {/* Hint */}
                                <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 10.5, color: 'var(--el-text-muted)', opacity: 0.6 }}>
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
