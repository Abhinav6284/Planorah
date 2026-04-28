import { useEffect } from 'react';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('.reveal,.reveal-fade,.reveal-left,.reveal-right,.reveal-scale')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}


const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l4 4L19 7" />
  </svg>
);

// ─── Pain Card ────────────────────────────────────────────
const PainCard = ({ title, body }) => (
  <div style={{
    padding: '28px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  }}>
    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{body}</div>
  </div>
);

// ─── Bullet ───────────────────────────────────────────────
const Bullet = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--fg-deep)' }}>
    <span style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
      background: 'var(--light-gray)',
      color: 'var(--fg-deep)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <IconCheck size={11} />
    </span>
    {text}
  </div>
);

// ─── Main export ──────────────────────────────────────────
export default function StudentsPage() {
  useScrollReveal();
  const pains = [
    { title: 'Generic tools, generic results', body: 'Notion, Todoist, and Google Calendar were built for project managers — not for someone juggling 5 courses, a part-time job, and career prep.' },
    { title: 'Planning fatigue is real', body: 'You spend 30 minutes every evening deciding what to study. By the time you start, it\'s already late.' },
    { title: 'No system = no consistency', body: 'Motivation fades. What students need isn\'t another app — it\'s an execution system that removes friction from showing up daily.' },
  ];

  const whyBuilt = [
    'AI that understands academic calendars, not just due dates',
    'Focus mode designed for study sessions, not corporate meetings',
    'Roadmaps tailored to exam prep, skill-building, and competitive goals',
    'Progress tracking that flags burnout before it happens',
    'Built by students who lived this exact problem',
    'Free forever for students — no credit card tricks',
  ];

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container">
          <div style={{ maxWidth: 720 }}>
            <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>For students</div>
            <h1 className="reveal reveal-delay-1" style={{ marginBottom: 20 }}>
              Built specifically<br />for students.
            </h1>
            <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 560 }}>
              Not adapted from a corporate tool. Not a repainted to-do app. Planorah was designed from day one around the way students actually work.
            </p>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
            <div>
              <h2 className="reveal" style={{ fontSize: 36, marginBottom: 24, color: 'var(--fg-deep)' }}>
                Why existing tools fail students.
              </h2>
              <div className="reveal reveal-delay-1" style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 16, overflow: 'hidden',
                background: 'var(--surface)'
              }}>
                {pains.map((p, i) => <PainCard key={i} {...p} />)}
              </div>
            </div>

            <div>
              <h2 className="reveal" style={{ fontSize: 36, marginBottom: 24, color: 'var(--fg-deep)' }}>
                Why Planorah exists.
              </h2>
              <div className="reveal reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {whyBuilt.map((text, i) => <Bullet key={i} text={text} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
