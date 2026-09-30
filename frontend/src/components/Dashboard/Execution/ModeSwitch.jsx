import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

const MODES = [
    { id: 'learning', label: 'Learning', Icon: BookOpen,      desc: 'Roadmap-driven skill building' },
    { id: 'exam',     label: 'Exam',     Icon: GraduationCap, desc: 'Structured exam preparation'  },
];

const ModeSwitch = ({ mode, onChange }) => (
    <div style={{ display: 'flex', gap: 6 }}>
        {MODES.map(({ id, label, Icon, desc }) => {
            const active = mode === id;
            return (
                <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '11px 13px',
                        borderRadius: 10,
                        border: active
                            ? '1px solid var(--el-text)'
                            : '1px solid var(--el-border)',
                        background: active ? 'var(--el-text)' : 'var(--el-bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    <Icon style={{
                        width: 14, height: 14,
                        color: active ? 'var(--el-bg)' : 'var(--el-text-muted)',
                        transition: 'color 0.15s',
                    }} />
                    <div>
                        <p style={{
                            fontSize: 12, fontWeight: 600, margin: 0,
                            letterSpacing: '-0.01em',
                            color: active ? 'var(--el-bg)' : 'var(--el-text-secondary)',
                        }}>
                            {label}
                        </p>
                        <p style={{
                            fontSize: 10, margin: '2px 0 0', lineHeight: 1.4,
                            color: active ? 'rgba(255,255,255,0.55)' : 'var(--el-text-muted)',
                        }}>
                            {desc}
                        </p>
                    </div>
                </button>
            );
        })}
    </div>
);

export default React.memo(ModeSwitch);
