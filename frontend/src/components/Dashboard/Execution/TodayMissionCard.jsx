import React from 'react';
import { motion } from 'framer-motion';

const difficultyStyles = {
    easy: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
    medium: 'bg-amber-400/20 text-amber-100 border-amber-300/40',
    hard: 'bg-rose-400/20 text-rose-100 border-rose-300/40',
};

const MissionSkeleton = () => (
    <div style={{ borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', padding: 32, opacity: 0.6 }}>
        <div style={{ height: 12, width: 112, borderRadius: 4, background: 'var(--el-bg-secondary)', marginBottom: 16 }} />
        <div style={{ height: 32, width: '66%', borderRadius: 4, background: 'var(--el-bg-secondary)', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ height: 28, width: 80, borderRadius: 20, background: 'var(--el-bg-secondary)' }} />
            <div style={{ height: 28, width: 80, borderRadius: 20, background: 'var(--el-bg-secondary)' }} />
        </div>
        <div style={{ height: 80, borderRadius: 12, background: 'var(--el-bg-secondary)', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ height: 40, width: 112, borderRadius: 10, background: 'var(--el-bg-secondary)' }} />
            <div style={{ height: 40, width: 112, borderRadius: 10, background: 'var(--el-bg-secondary)' }} />
        </div>
    </div>
);

const TodayMissionCard = ({ task, loading, onStart, onChangeTask }) => {
    if (loading) {
        return (
            <div style={{ padding: 40, borderRadius: 16, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--el-text-muted)', fontWeight: 600 }}>Calculating strategic mission...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div style={{ padding: 32, borderRadius: 16, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--el-text-muted)' }}>No mission available. Try refreshing or generating one.</p>
            </div>
        );
    }

    const level = (task.difficulty || 'medium').toLowerCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
                borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', 
                padding: 40, boxShadow: 'var(--el-shadow-card)', color: 'var(--el-text)'
            }}
        >
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Active Mission</p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{task.title}</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                <span style={{ 
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, 
                    background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)', border: '1px solid var(--el-border-subtle)'
                }}>{task.estimated_time || '25 min'}</span>
                <span style={{ 
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)', border: '1px solid var(--el-border-subtle)'
                }}>{level}</span>
            </div>

            <div style={{ marginTop: 24, padding: 24, borderRadius: 12, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 8 }}>AI Rationale</p>
                <p style={{ fontSize: 14, color: 'var(--el-text-secondary)', lineHeight: 1.6 }}>{task.reason || 'This mission is specifically generated to target your high-impact areas and ensure consistent progress towards your performance peaks.'}</p>
            </div>

            <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStart}
                    style={{ 
                        padding: '12px 32px', borderRadius: 12, background: 'var(--el-text)', color: 'var(--el-bg)',
                        fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    Start Mission
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onChangeTask}
                    style={{ 
                        padding: '12px 24px', borderRadius: 12, background: 'var(--el-bg)', border: '1px solid var(--el-border)', 
                        color: 'var(--el-text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    New Strategy
                </motion.button>
            </div>
        </motion.div>
    );
};

export default TodayMissionCard;
