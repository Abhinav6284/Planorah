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
const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Comparison data ──────────────────────────────────────
const comparisons = {
  'notion-vs-planorah': {
    competitor: 'Notion',
    tagline: 'Notion is a powerful workspace. Planorah is a student execution system.',
    rows: [
      ['AI-generated study roadmap', true, false],
      ['Daily task scheduling from syllabus', true, false],
      ['Built-in Pomodoro focus mode', true, false],
      ['Adaptive rescheduling', true, false],
      ['Progress analytics & streaks', true, false],
      ['Free for students', true, true],
      ['Offline mode', true, true],
      ['Flexible workspace / docs', false, true],
      ['Team collaboration', false, true],
    ],
  },
  'google-calendar-vs-planorah': {
    competitor: 'Google Calendar',
    tagline: 'Google Calendar shows your time. Planorah plans it for you.',
    rows: [
      ['AI-generated study roadmap', true, false],
      ['Automatic task scheduling', true, false],
      ['Reads syllabi & deadlines', true, false],
      ['Focus mode & Pomodoro', true, false],
      ['Study streak tracking', true, false],
      ['Calendar sync', true, true],
      ['Free to use', true, true],
      ['Shared calendars', false, true],
      ['Email integration', false, true],
    ],
  },
  'todoist-vs-planorah': {
    competitor: 'Todoist',
    tagline: 'Todoist manages tasks. Planorah builds the system behind them.',
    rows: [
      ['AI-generated roadmap', true, false],
      ['Syllabus-aware scheduling', true, false],
      ['Focus mode built in', true, false],
      ['Adaptive replanning', true, false],
      ['Student-specific analytics', true, false],
      ['Free tier', true, true],
      ['Cross-platform', true, true],
      ['Natural language input', false, true],
      ['Project-based organization', false, true],
    ],
  },
};

// ─── Main export ──────────────────────────────────────────
export default function ComparisonPage() {
  useScrollReveal();
  const navigate = useNavigate();
  const { slug } = useParams();
  const data = comparisons[slug];

  if (!data) {
    return (
      <main>
        <section style={{ padding: '120px 0', textAlign: 'center' }}>
          <div className="container">
            <h1>Comparison not found</h1>
            <p style={{ marginTop: 16 }}>This comparison page doesn't exist yet.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Compare</div>
          <h1 className="reveal" style={{ marginBottom: 20 }}>
            Planorah vs {data.competitor}
          </h1>
          <p className="reveal" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            {data.tagline}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container-narrow">
          <div className="reveal" style={{
            border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden',
            background: 'var(--surface)'
          }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
              padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
              fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <div>Feature</div>
              <div style={{ textAlign: 'center' }}>Planorah</div>
              <div style={{ textAlign: 'center' }}>{data.competitor}</div>
            </div>

            {/* Rows */}
            {data.rows.map(([feature, planorah, competitor], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
                padding: '14px 24px',
                borderBottom: i < data.rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                fontSize: 14, color: 'var(--fg-deep)'
              }}>
                <div>{feature}</div>
                <div style={{ textAlign: 'center', color: planorah ? 'var(--orange)' : 'var(--fg-muted)' }}>
                  {planorah ? <IconCheck size={16} /> : <IconX size={16} />}
                </div>
                <div style={{ textAlign: 'center', color: competitor ? 'var(--orange)' : 'var(--fg-muted)' }}>
                  {competitor ? <IconCheck size={16} /> : <IconX size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 0 96px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, marginBottom: 16, color: 'var(--fg-deep)' }}>Ready to switch?</h2>
          <p style={{ fontSize: 16, marginBottom: 32 }}>Free for students. No credit card.</p>
          <button className="btn-orange" style={{ padding: '16px 32px', fontSize: 16 }} onClick={() => navigate('/register')}>
            Start free now
          </button>
        </div>
      </section>
    </main>
  );
}
