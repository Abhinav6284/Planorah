import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const IconArrowRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const IconCheck = ({ size = 14, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l4 4L19 7" />
  </svg>
);

const StepSection = ({ stepNum, title, headline, desc, list, reverse, children }) => (
  <section className="section" style={{ padding: '64px 0' }}>
    <div className="container" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 64,
      alignItems: 'center',
    }}>
      <div className={`reveal-${reverse ? 'right' : 'left'}`} style={{ order: reverse ? 2 : 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--fg-deep)', fontWeight: 600,
          marginBottom: 16, letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Step {stepNum} — {title}
        </div>
        <h2 style={{ fontSize: 32, marginBottom: 20, color: 'var(--fg-deep)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {headline}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: list ? 24 : 0 }}>
          {desc}
        </p>
        {list && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-deep)' }}>
                <IconCheck size={14} stroke={2} />
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={`reveal-${reverse ? 'left' : 'right'}`} style={{ order: reverse ? 1 : 2 }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          aspectRatio: '4/3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {children}
        </div>
      </div>
    </div>
  </section>
);

export default function HowItWorksPage() {
  useScrollReveal();
  const navigate = useNavigate();

  return (
    <main>
      {/* SECTION 1 — HERO */}
      <section style={{ padding: '96px 0 64px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>HOW IT WORKS</div>
          <h1 className="reveal reveal-delay-1" style={{ marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
            From raw goals to a system<br />that runs every day.
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Planorah doesn't give you another empty planner. It builds the roadmap, decides the next tasks, and keeps adjusting as real life happens.
          </p>

          <div className="reveal-scale reveal-delay-3" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 24,
            height: 400,
            maxWidth: 960,
            margin: '0 auto',
            boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>
              [ Large composite mockup placeholder ]
            </div>
          </div>

          <div className="reveal" style={{
            display: 'flex',
            justifyContent: 'space-between',
            maxWidth: 600,
            margin: '48px auto 0',
            position: 'relative',
            color: 'var(--fg-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600
          }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border-subtle)', zIndex: -1 }}></div>
            {['1', '2', '3', '4', '5'].map(num => (
              <div key={num} style={{ background: 'var(--bg)', padding: '0 8px' }}>Step {num}</div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — STEP 1 */}
      <StepSection
        stepNum="1"
        title="Tell Planorah what you're building"
        headline="Start with what is real — not what sounds ambitious."
        desc="Planorah builds your roadmap based on reality. Provide your actual constraints and goals, not just empty aspirations."
        list={[
          'Syllabus upload',
          'Exam target dates',
          'Subject list breakdown',
          'Learning goals',
          'Available hours (be honest)',
        ]}
      >
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[ Onboarding Screenshot ]</div>
      </StepSection>

      {/* SECTION 3 — STEP 2 */}
      <StepSection
        stepNum="2"
        reverse
        title="AI builds the semester roadmap"
        headline="Your semester gets broken into survivable weeks."
        desc="No manual timetable creation. Planorah parses your inputs and creates a structured roadmap with weeks, milestones, deadlines, and subject chunks automatically."
      >
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[ Roadmap Generation UI ]</div>
      </StepSection>

      {/* SECTION 4 — STEP 3 */}
      <StepSection
        stepNum="3"
        title="Every morning already has a plan"
        headline="You stop deciding what to study every night."
        desc="Your daily execution dashboard auto-prioritizes tasks from your roadmap. Wake up, look at your dashboard, and execute."
      >
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[ Daily Execution Dashboard ]</div>
      </StepSection>

      {/* SECTION 5 — STEP 4 */}
      <StepSection
        stepNum="4"
        reverse
        title="Focus mode runs the work"
        headline="The work session starts from the task itself."
        desc="Launch a Pomodoro attached to your tasks. Auto-logging tracks your progress, and rescheduling handles the overflow if time is blown."
      >
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[ Pomodoro / Focus UI ]</div>
      </StepSection>

      {/* SECTION 6 — STEP 5 */}
      <StepSection
        stepNum="5"
        title="The system watches consistency"
        headline="Missing a day doesn't break the semester anymore."
        desc="Weekly scores, slipping alerts, and adaptive replanning ensure you stay on track even when life happens."
      >
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[ Weekly Score / Adaptive UI ]</div>
      </StepSection>

      {/* SECTION 7 — WHAT CHANGES AFTER WEEK ONE */}
      <section className="section" style={{ padding: '96px 0', background: 'var(--surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal" style={{ marginBottom: 16 }}>THE RESULT</div>
          <h2 className="reveal" style={{ fontSize: 36, marginBottom: 48, color: 'var(--fg-deep)', letterSpacing: '-0.02em' }}>
            What changes after week one
          </h2>

          <div className="reveal" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 1000,
            margin: '0 auto'
          }}>
            {[
              { title: 'Less nightly confusion', desc: 'No more figuring out what to do next.' },
              { title: 'Less guilt planning', desc: 'Missed tasks just shift, they don\'t pile up and crash.' },
              { title: 'Visible momentum', desc: 'See your weekly score and streaks grow.' },
              { title: 'One connected loop', desc: 'From syllabus to daily Pomodoros seamlessly.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 24, background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
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
            <div className="eyebrow" style={{ marginBottom: 24 }}>START TODAY</div>
            <h2 style={{ fontSize: 48, color: 'var(--fg-deep)', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 20, maxWidth: 560, margin: '0 auto 20px' }}>
              Build the roadmap<br />that keeps moving.
            </h2>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 600, borderRadius: 10,
                background: 'var(--fg-deep)', color: 'var(--bg)', border: 'none',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s', marginTop: 12
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Start your roadmap <IconArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
