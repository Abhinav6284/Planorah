import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal,.reveal-fade,.reveal-scale').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l4 4L19 7" />
  </svg>
);

const features = {
  'ai-roadmap': {
    eyebrow: 'AI Roadmap',
    title: 'Your syllabus in,\nyour plan out.',
    subtitle: 'Upload a PDF, paste a link, or describe your goal. Planorah reads it and generates a complete week-by-week study roadmap.',
    bullets: [
      'Reads syllabi in PDF, DOCX, HTML, or plain text',
      'Breaks large assignments into daily work blocks',
      'Respects your declared free hours and existing classes',
      'Re-plans automatically when deadlines change',
      'Generates prep schedules for competitive exams',
    ],
  },
  'daily-planner': {
    eyebrow: 'Daily Planner',
    title: 'Every morning,\nyour tasks are ready.',
    subtitle: 'No more deciding what to study. Planorah schedules your day based on your roadmap, deadlines, and energy patterns.',
    bullets: [
      'Auto-generated daily task timeline',
      'Drag to reschedule — everything rebalances',
      'Integrates with Google Calendar',
      'Smart time blocking based on task type',
      'Morning briefing with top priorities',
    ],
  },
  'focus-mode': {
    eyebrow: 'Focus Mode',
    title: 'Built-in focus.\nZero distractions.',
    subtitle: 'A Pomodoro timer that starts from any task block. Track real study time per subject and build streaks.',
    bullets: [
      'One-click Pomodoro from any scheduled task',
      'Customizable focus and break intervals',
      'Per-subject time tracking',
      'Streak counter with gentle nudges',
      'Ambient sounds and distraction blocking',
    ],
  },
  'progress-analytics': {
    eyebrow: 'Progress Analytics',
    title: 'See where you stand.\nEvery week.',
    subtitle: 'Streaks, velocity scores, burnout flags, and course-level progress — all in one dashboard.',
    bullets: [
      'Weekly consistency score',
      'Per-course velocity tracking',
      'Burnout prediction and flagging',
      'Visual progress charts',
      'Exportable weekly reports',
    ],
  },
};

export default function FeatureDetailPage() {
  useScrollReveal();
  const navigate = useNavigate();
  const { slug } = useParams();
  const data = features[slug];

  if (!data) {
    return (
      <main>
        <section style={{ padding: '120px 0', textAlign: 'center' }}>
          <div className="container">
            <h1>Feature not found</h1>
            <p style={{ marginTop: 16 }}>This feature page doesn't exist yet.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container">
          <div style={{ maxWidth: 680 }}>
            <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>{data.eyebrow}</div>
            <h1 className="reveal" style={{ marginBottom: 20, whiteSpace: 'pre-line' }}>{data.title}</h1>
            <p className="reveal" style={{ fontSize: 18, maxWidth: 520 }}>{data.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'start' }}>
            <div>
              <h3 className="reveal" style={{ marginBottom: 24, color: 'var(--fg-deep)' }}>Key capabilities</h3>
              <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.bullets.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--fg-deep)' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--orange-soft)', color: 'var(--orange)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}><IconCheck size={11} /></span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal" style={{
              width: '100%', aspectRatio: '4/3', borderRadius: 16,
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)'
            }}>
              Product screenshot
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 0 96px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, marginBottom: 16, color: 'var(--fg-deep)' }}>Try {data.eyebrow} free.</h2>
          <p style={{ fontSize: 16, marginBottom: 32 }}>No credit card required.</p>
          <button className="btn-orange" style={{ padding: '16px 32px', fontSize: 16 }} onClick={() => navigate('/register')}>
            Start free now
          </button>
        </div>
      </section>
    </main>
  );
}
