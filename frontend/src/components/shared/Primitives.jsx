import React from 'react';

export const Logo = ({ onClick, style }) => (
  <div className="logo" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
    <img 
      src="/planorah_logo.png" 
      alt="Planorah" 
      style={{ 
        width: 28, 
        height: 28, 
        objectFit: 'contain',
        filter: 'var(--logo-invert)'
      }} 
    />
    <span>Planorah</span>
  </div>
);

export const Tag = ({ color, children, dot = true, style }) => (
  <span className={`tag tag-${color || ''}`} style={style}>
    {dot && <span className="tag-dot" />}
    {children}
  </span>
);

export const Button = ({ variant = 'primary', size, children, onClick, style, type, ...rest }) => {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}${size === 'lg' ? ' btn-lg' : ''}`;
  return <button type={type || 'button'} className={cls} onClick={onClick} style={style} {...rest}>{children}</button>;
};

export const Pill = ({ children, style }) => (
  <span className="tag" style={{
    background: 'var(--light-gray)',
    color: 'var(--fg-deep)',
    boxShadow: 'var(--shadow-ring)',
    ...style
  }}>{children}</span>
);

export const Placeholder = ({ label, height = 360, style }) => (
  <div style={{
    width: '100%',
    height,
    borderRadius: 'var(--r-12)',
    background: `repeating-linear-gradient(135deg,
      var(--light-gray) 0 10px,
      color-mix(in oklab, var(--light-gray) 70%, var(--bg)) 10px 20px)`,
    boxShadow: 'var(--shadow-ring)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--fg-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: 0.2,
    ...style
  }}>{label}</div>
);
