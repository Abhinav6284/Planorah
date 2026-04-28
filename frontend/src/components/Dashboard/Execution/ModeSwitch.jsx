import React from 'react';

const ModeSwitch = ({ mode, onChange }) => {
    return (
        <div style={{ 
            display: 'inline-flex', alignItems: 'center', borderRadius: 12, 
            border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)', padding: 4
        }}>
            {['learning', 'exam'].map((item) => {
                const active = mode === item;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        style={{
                            padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                            background: active ? 'var(--el-text)' : 'transparent',
                            color: active ? '#fff' : 'var(--el-text-secondary)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
};

export default React.memo(ModeSwitch);
