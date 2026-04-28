import { useEffect } from 'react';

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

const templates = [
  { title: 'Weekly Study Planner', desc: 'A structured weekly template with time blocks for each subject.', tag: 'PDF' },
  { title: 'Exam Countdown Tracker', desc: 'Day-by-day countdown with revision checkpoints built in.', tag: 'PDF' },
  { title: 'Semester Goal Setter', desc: 'Set course-level goals and break them into monthly milestones.', tag: 'PDF' },
  { title: 'Pomodoro Log Sheet', desc: 'Track your daily focus sessions and see patterns over time.', tag: 'PDF' },
  { title: 'Subject Velocity Tracker', desc: 'Monitor how fast you cover topics across different subjects.', tag: 'Spreadsheet' },
  { title: 'Burnout Prevention Checklist', desc: 'Weekly self-check to flag overwork before it hits.', tag: 'PDF' },
];

export default function TemplatesPage() {
  useScrollReveal();

  return (
    <main>
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Free resources</div>
          <h1 className="reveal" style={{ marginBottom: 20 }}>
            Templates & checklists.
          </h1>
          <p className="reveal" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            Free downloadable tools to help you plan, execute, and stay consistent — even without Planorah.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {templates.map((t, i) => (
              <div key={i} className={`reveal reveal-delay-${(i % 3) + 1}`} style={{
                padding: '32px 28px', background: 'var(--surface)',
                border: '1px solid var(--border-subtle)', borderRadius: 16,
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--fg-deep)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16
                }}>{t.tag}</div>
                <h4 style={{ marginBottom: 10, color: 'var(--fg-deep)' }}>{t.title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{t.desc}</p>
                <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                  Download free
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
