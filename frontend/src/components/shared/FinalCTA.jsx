import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight } from './Icons';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '96px 0 120px' }}>
      <div className="container-narrow reveal-scale" style={{
        textAlign: 'center',
        padding: '72px 48px',
        background: 'var(--surface)', borderRadius: 24,
        border: '1px solid rgba(128,128,128,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Start today</div>
          <h2 style={{ fontSize: 48, color: 'var(--fg-deep)', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 20, maxWidth: 560, margin: '0 auto 20px' }}>
            You don't need another planner.<br />You need a system that keeps moving.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fg-muted)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Free to start. Under two minutes to set up.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 32px', fontSize: 15, fontWeight: 600, borderRadius: 10,
              background: 'var(--fg-deep)', color: 'var(--bg)', border: 'none',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            Start your roadmap <IconArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
