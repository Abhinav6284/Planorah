import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('.reveal,.reveal-fade,.reveal-left,.reveal-right,.reveal-scale,.hero-line')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Icons ────────────────────────────────────────────────
const Ico = ({ d, size = 16, stroke = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const IconArrowRight = ({ size = 14 }) => (
  <Ico size={size} d={<path d="M5 12h14M13 5l7 7-7 7" />} />
);
const IconCheck = ({ size = 14, stroke = 1.5 }) => (
  <Ico size={size} stroke={stroke} d={<path d="M5 12l4 4L19 7" />} />
);
const IconSparkle = ({ size = 16 }) => (
  <Ico size={size} d={<>
    <path d="M12 3l1.8 4.8L18.6 9.6l-4.8 1.8L12 16.2l-1.8-4.8L5.4 9.6l4.8-1.8z"/>
    <path d="M19 15l.7 1.9L21.6 17.6l-1.9.7L19 20.2l-.7-1.9L16.4 17.6l1.9-.7z"/>
  </>} />
);
const IconCalendar = ({ size = 16 }) => (
  <Ico size={size} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>} />
);
const IconBookmark = ({ size = 16 }) => (
  <Ico size={size} d={<path d="M6 3h12v18l-6-4-6 4z"/>} />
);
const IconZap = ({ size = 16 }) => (
  <Ico size={size} d={<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>} />
);
const IconShield = ({ size = 16 }) => (
  <Ico size={size} d={<path d="M12 2l8 3v7c0 5-3 8-8 10-5-2-8-5-8-10V5z"/>} />
);
const IconFlame = ({ size = 16 }) => (
  <Ico size={size} d={<><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 2-3 2-5 0 0 2 1 2-3z"/><path d="M7 16a5 5 0 0 0 10 0c0 3-2 5-5 5s-5-2-5-5z"/></>} />
);
const IconClock = ({ size = 16 }) => (
  <Ico size={size} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />
);
const IconBell = ({ size = 16 }) => (
  <Ico size={size} d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>} />
);

// ─── Shared atoms ─────────────────────────────────────────
const LpTag = ({ color, children }) => (
  <span className={`tag tag-${color}`}>
    <span className="tag-dot" />
    {children}
  </span>
);

const BulletLine = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-deep)' }}>
    <span style={{
      width: 18, height: 18, borderRadius: '50%',
      background: 'var(--light-gray)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <IconCheck size={11} stroke={2.2} />
    </span>
    {text}
  </div>
);

const SmallFeature = ({ icon, title, body }) => (
  <div style={{
    padding: 20, borderRadius: 12,
    boxShadow: 'var(--shadow-ring)'
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'var(--light-gray)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14, color: 'var(--fg-deep)'
    }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{body}</div>
  </div>
);

// ─── Feature demo components ──────────────────────────────
const SyllabusPreview = () => (
  <div className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    <div style={{
      background: 'var(--light-gray)', borderRadius: 8, padding: 16,
      fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.6,
      color: 'var(--fg-muted)', minHeight: 280
    }}>
      <div style={{ color: 'var(--fg-deep)', fontWeight: 600, marginBottom: 8 }}>CS 331 — Syllabus.pdf</div>
      Week 1: Intro, big-O<br/>
      Week 2: Greedy algorithms<br/>
      Week 3: Divide &amp; conquer<br/>
      <span className="tag tag-blue" style={{ display: 'inline', padding: '1px 6px', borderRadius: 3 }}>Week 4: PSet 1 due Apr 3</span><br/>
      Week 5: Dynamic programming<br/>
      <span className="tag tag-amber" style={{ display: 'inline', padding: '1px 6px', borderRadius: 3 }}>Week 6: Midterm · Apr 17</span><br/>
      Week 7: Graph algorithms<br/>
      <span className="tag tag-blue" style={{ display: 'inline', padding: '1px 6px', borderRadius: 3 }}>Week 8: PSet 4 due Apr 24</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4 }}>Extracted →</div>
      {[
        { c: 'blue',  l: 'PSet 1',      d: 'Apr 3'  },
        { c: 'amber', l: 'Midterm',     d: 'Apr 17' },
        { c: 'blue',  l: 'PSet 4',      d: 'Apr 24' },
        { c: 'blue',  l: 'Final Proj',  d: 'May 15' },
        { c: 'amber', l: 'Final Exam',  d: 'May 22' },
      ].map((x, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: 6, boxShadow: 'var(--shadow-ring)', fontSize: 12
        }}>
          <LpTag color={x.c}>{x.l}</LpTag>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{x.d}</span>
        </div>
      ))}
    </div>
  </div>
);

const PaceDemo = () => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16 }}>
      Your average over the last 4 weeks
    </div>
    {[
      { code: 'CS 331', color: 'blue',   est: 4, actual: 5.2 },
      { code: 'MA 241', color: 'green',  est: 2, actual: 1.6 },
      { code: 'EN 210', color: 'amber',  est: 3, actual: 4.1 },
      { code: 'PH 220', color: 'violet', est: 3, actual: 2.8 },
    ].map((r, i) => (
      <div key={i} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LpTag color={r.color}>{r.code}</LpTag>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>per assignment</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-deep)' }}>
            {r.actual}h <span style={{ color: 'var(--fg-muted)' }}>/ est. {r.est}h</span>
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--light-gray)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(r.actual/6*100,100)}%`, height: '100%',
            background: `var(--tag-${r.color})`, opacity: 0.8
          }} />
        </div>
      </div>
    ))}
    <div style={{ marginTop: 20, padding: 12, background: 'var(--light-gray)', borderRadius: 8, fontSize: 13, color: 'var(--fg-deep)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <IconSparkle size={13} /> <b>Adjustment:</b> CS blocks +30% next week, MA blocks −20%.
      </span>
    </div>
  </div>
);

const ChatBubble = ({ role, children }) => (
  <div style={{
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '85%',
    background: role === 'user' ? 'var(--fg-deep)' : 'var(--light-gray)',
    color: role === 'user' ? 'var(--bg)' : 'var(--fg-deep)',
    padding: '10px 14px', borderRadius: 12,
    fontSize: 13, lineHeight: 1.5
  }}>{children}</div>
);

const InlineTask = ({ color, code, label, dur }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 8px', background: 'var(--surface)',
    borderRadius: 6, boxShadow: 'var(--shadow-ring)'
  }}>
    <LpTag color={color}>{code}</LpTag>
    <span style={{ flex: 1, color: 'var(--fg-deep)', fontSize: 12 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{dur}</span>
  </div>
);

const ChatDemo = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: 'var(--fg-deep)', color: 'var(--bg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <IconSparkle size={13} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)',
        fontFamily: 'var(--font-display)' }}>Planorah Chat</div>
    </div>
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChatBubble role="user">What should I work on tonight?</ChatBubble>
      <ChatBubble role="ai">
        <div style={{ marginBottom: 8 }}>
          You've got <b>3 hours free after 7pm</b>. Given tomorrow's lab report is due, I'd suggest:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <InlineTask color="violet" code="PH 220" label="Pendulum lab writeup" dur="90m" />
          <InlineTask color="blue"   code="CS 331" label="PSet 4 — start Problem 1" dur="60m" />
          <InlineTask color="teal"   code="EC 101" label="Finish Mankiw Ch. 8 reading" dur="30m" />
        </div>
      </ChatBubble>
      <ChatBubble role="user">Move the essay to Saturday</ChatBubble>
      <ChatBubble role="ai">
        Done. Moved <b>Essay II draft</b> from Fri 4pm → <b>Sat 10am–1pm</b>. Week still balanced.
      </ChatBubble>
    </div>
  </div>
);

// ─── Feature row ──────────────────────────────────────────
const FeatureRow = ({ eyebrow, title, body, bullets, demo, reverse }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: 64, alignItems: 'center',
    direction: reverse ? 'rtl' : 'ltr'
  }}>
    <div className={reverse ? 'reveal-right' : 'reveal-left'} style={{ direction: 'ltr' }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
      <h3 style={{ fontSize: 32, lineHeight: 1.15, marginBottom: 16 }}>{title}</h3>
      <p style={{ fontSize: 16, marginBottom: 24 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-deep)' }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'var(--light-gray)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <IconCheck size={11} stroke={2.2} />
            </span>
            {b}
          </div>
        ))}
      </div>
    </div>
    <div className={reverse ? 'reveal-left' : 'reveal-right'} style={{ direction: 'ltr' }}>
      {demo}
    </div>
  </div>
);

// ─── CTA ─────────────────────────────────────────────────
const HomeCTA = ({ navigate }) => (
  <section style={{ padding: '24px 0 96px' }}>
    <div className="container-narrow">
      <div style={{
        background: 'var(--fg-deep)', color: 'var(--bg)',
        borderRadius: 16, padding: '56px 48px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 32
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
            lineHeight: 1.15, marginBottom: 8 }}>
            Start your semester, not your stress.
          </div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 15 }}>
            Free forever for up to 4 courses. No card.
          </div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/register')}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Try Planorah <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  </section>
);

// ─── Main export ──────────────────────────────────────────
export default function FeaturesPage() {
  useScrollReveal();
  const navigate = useNavigate();

  const smallFeatures = [
    { icon: <IconCalendar size={16}/>, title: 'Calendar sync',      body: 'Google & Outlook two-way.'          },
    { icon: <IconBookmark size={16}/>, title: 'Reading library',     body: 'Auto-extracted from syllabi.'       },
    { icon: <IconZap size={16}/>,      title: 'Quick rescheduling',  body: 'Drag a block. Everything updates.'  },
    { icon: <IconShield size={16}/>,   title: 'Private by default',  body: 'Your syllabi never train models.'   },
    { icon: <IconFlame size={16}/>,    title: 'Streaks',             body: 'Gentle, skippable, off by default.' },
    { icon: <IconClock size={16}/>,    title: 'Pomodoro timer',      body: 'Built in. Starts from any block.'   },
    { icon: <IconCheck size={16}/>,    title: 'Offline mode',        body: 'Works in lecture halls, too.'       },
    { icon: <IconBell size={16}/>,     title: 'Smart nudges',        body: 'Only when it actually helps.'       },
  ];

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Features</div>
          <h1 className="reveal reveal-delay-1" style={{ marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
            A planner that does the planning.
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Three capabilities, built for the actual rhythm of a semester — not a generic to-do app with a calendar view bolted on.
          </p>
        </div>
      </section>

      {/* Feature rows */}
      <section className="section-sm">
        <div className="container">
          <FeatureRow
            eyebrow="AI SCHEDULES"
            title="Your syllabus in, your plan out."
            body="Paste a PDF or link. Planorah reads the due dates, exam dates, and reading load, then generates a week-by-week schedule that fits the hours you've said are free."
            bullets={[
              'Reads syllabi in PDF, DOCX, HTML, or plain paste',
              'Breaks large assignments into multiple work blocks',
              'Respects your declared focus windows and classes',
              'Re-plans automatically when a due date changes',
            ]}
            demo={<SyllabusPreview />}
            reverse={false}
          />
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <FeatureRow
            eyebrow="PERSONAL PACE"
            title="Learns how fast you actually work."
            body="Most planners ask you to estimate everything. Planorah watches how long assignments actually take you, by course and type, and adjusts block lengths so the week stays realistic."
            bullets={[
              'Course-by-course velocity after two weeks of use',
              'Separate estimates for readings, problem sets, essays',
              'Burnout protection: flags weeks over your declared max',
              'Clear view of where you are ahead or behind',
            ]}
            demo={<PaceDemo />}
            reverse={true}
          />
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <FeatureRow
            eyebrow="ASK AI"
            title="An AI that knows your workload."
            body="The chat is context-aware. It can see your courses, your schedule, and what's due — so 'what should I do tonight?' gets a real answer, not a lecture."
            bullets={[
              'Grounded in your real plan, not hallucinated',
              'Can move, split, or defer blocks from the chat',
              'Suggests study strategies by course type',
              'Explains why it chose a particular plan',
            ]}
            demo={<ChatDemo />}
            reverse={false}
          />
        </div>
      </section>

      {/* Small features grid */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 16 }}>And the small things,<br/>done right.</h2>
            <p style={{ fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
              The details that make a daily-use tool feel like yours.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {smallFeatures.map((sf, i) => (
              <div key={i} className={`reveal reveal-delay-${(i % 4) + 1}`}>
                <SmallFeature {...sf} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
