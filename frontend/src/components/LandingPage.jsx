import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconArrowRight, IconCheck, IconSparkle, IconMore, IconFlame, 
  IconTrend, IconZap,
  IconPlanning, IconPhone, IconCompass, IconHourglass
} from './shared/Icons';
import { Button } from './shared/Primitives';
import { motion } from 'framer-motion';
// ─── Scroll reveal ────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = () => document.querySelectorAll(
      '.reveal,.reveal-fade,.reveal-left,.reveal-right,.reveal-scale,.hero-line'
    );
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.10 }
    );
    // Wire immediately-visible elements on mount
    const wire = () => {
      els().forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('in');
        obs.observe(el);
      });
    };
    wire();
    return () => obs.disconnect();
  }, []);
}

// ─── Shared atoms ─────────────────────────────────────────
const Tag = ({ color, children }) => (
  <span className={`tag${color ? ` tag-${color}` : ''}`}>
    <span className="tag-dot" />
    {children}
  </span>
);

// ─── Course data ──────────────────────────────────────────
const COURSES = [
  { id: 'cs331', code: 'CS 331', color: 'blue'   },
  { id: 'ph220', code: 'PH 220', color: 'violet' },
  { id: 'ec101', code: 'EC 101', color: 'teal'   },
  { id: 'en210', code: 'EN 210', color: 'amber'  },
  { id: 'ma241', code: 'MA 241', color: 'green'  },
];

// ─── Hero Product Card ────────────────────────────────────
function HeroProductCard() {
  const [done, setDone] = useState(['h1']);
  const toggle = id => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  const items = [
    { id: 'h1', time: 'Mon', dur: '2h',     course: 'cs331', label: 'Master DP state transitions' },
    { id: 'h2', time: 'Tue', dur: '1h 30m', course: 'ph220', label: 'Draft Pendulum lab data analysis'   },
    { id: 'h3', time: 'Wed', dur: '1h',    course: 'en210', label: 'Synthesize sources for essay'        },
    { id: 'h4', time: 'Thu', dur: '2h',     course: 'cs331', label: 'Complete PSet 4 (5 problems)'         },
    { id: 'h5', time: 'Fri', dur: '1h 30m',     course: 'ec101', label: 'Review Mankiw Ch.8 concepts'                 },
  ];
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, background: 'var(--light-gray)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-deep)'
          }}><IconSparkle size={13} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)',
            fontFamily: 'var(--font-display)' }}>AI Roadmap · Apr 22–26</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>18h planned</div>
      </div>
      <div style={{ padding: 8 }}>
        {items.map(it => {
          const course = COURSES.find(c => c.id === it.course);
          const isDone = done.includes(it.id);
          return (
            <div key={it.id} onClick={() => toggle(it.id)}
              style={{
                display: 'grid', gridTemplateColumns: '40px 18px 1fr auto',
                alignItems: 'center', gap: 12, padding: '10px 10px',
                borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--light-gray)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{it.time}</div>
              <div style={{
                width: 16, height: 16, borderRadius: 4, boxShadow: 'var(--shadow-ring)',
                background: isDone ? 'var(--charcoal)' : 'transparent',
                color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isDone && <IconCheck size={11} stroke={2.6} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--fg)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  opacity: isDone ? 0.5 : 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{it.label}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tag color={course.color}>{course.code}</Tag>
                  <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{it.dur}</span>
                </div>
              </div>
              <IconMore size={14} />
            </div>
          );
        })}
      </div>
      <div style={{
        borderTop: '1px solid var(--border-subtle)', padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--fg-muted)'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconFlame size={12} /> 12-day streak
        </span>
        <span>{done.length} of {items.length} complete</span>
      </div>
    </div>
  );
}

// ─── Float chip ───────────────────────────────────────────
function FloatChip({ top, bottom, left, right, icon, label, tone }) {
  const bgMap = { orange: 'var(--orange-soft)', green: 'var(--tag-green-bg)', default: 'var(--light-gray)' };
  const colorMap = { orange: 'var(--orange-deep)', green: 'var(--tag-green)', default: 'var(--fg-deep)' };
  const delay = tone === 'green' ? '-2s' : tone === 'orange' ? '0s' : '-4s';
  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
      borderRadius: 999, padding: '6px 12px',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 12, fontWeight: 500, color: 'var(--fg-deep)',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: delay,
      willChange: 'transform',
      zIndex: 2
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        background: bgMap[tone] || bgMap.default,
        color: colorMap[tone] || colorMap.default,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>{icon}</span>
      {label}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTIONS
// ══════════════════════════════════════════════════════════

// 1. HERO
function HeroSection({ navigate }) {
  return (
    <section style={{ padding: '96px 0 64px', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 72, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <div className="reveal-fade" style={{ marginBottom: 22 }}>
            <span className="tag" style={{ boxShadow: 'var(--shadow-ring)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block' }} />
              <span style={{ color: 'var(--fg-muted)', marginLeft: 6 }}>Live at</span>
              <span style={{ color: 'var(--fg-deep)', fontWeight: 500, marginLeft: 4 }}>planorah.me</span>
            </span>
          </div>

          <h1 style={{ marginBottom: 22, maxWidth: 600 }}>
            <span className="hero-line"><span>Master your time.</span></span>
            <span className="hero-line hero-line-2"><span>Turn confusion into</span></span>
            <span className="hero-line hero-line-2"><span>a clear roadmap.</span></span>
          </h1>

          <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 520, lineHeight: 1.55 }}>
            Planorah builds your personalized study roadmap, tracks your progress, and keeps you consistent — powered by AI.
          </p>

          <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn-orange" onClick={() => navigate('/register')}>
              Start free now <IconArrowRight size={14} />
            </button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/features')}>
              ▶ Watch demo
            </Button>
          </div>

          <div className="reveal reveal-delay-4" style={{
            display: 'flex', gap: 20, marginTop: 32, color: 'var(--fg-muted)', fontSize: 13, flexWrap: 'wrap'
          }}>
            {['Free for students', 'No credit card', 'Under 2 minutes'].map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconCheck size={14} /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="reveal-scale reveal-delay-2" style={{ position: 'relative' }}>
          <HeroProductCard />
          <FloatChip top={-16} right={-12} icon={<IconFlame size={13} />} label="12-day streak" tone="orange" />
          <FloatChip bottom={80} left={-20} icon={<IconTrend size={13} />} label="On track" tone="green" />
          <FloatChip bottom={-14} right={40} icon={<IconCheck size={13} />} label="6 tasks done today" tone="default" />
        </div>
      </div>
    </section>
  );
}

// 2. TRUST BAR
function TrustBar() {
  const goals = ['Google prep', 'IIT prep', 'Study Abroad', 'Government Exams', 'MBA entrance', 'Freelancing', 'AI Careers'];
  const doubled = [...goals, ...goals, ...goals]; // Tripled to ensure smooth scrolling
  return (
    <section style={{ padding: '32px 0 72px' }}>
      <div className="container">
        <div className="reveal-fade" style={{ textAlign: 'center', fontSize: 13,
          color: 'var(--fg-muted)', marginBottom: 24 }}>
          Used for goals like
        </div>
        <div className="drift-mask">
          <div className="drift-track" style={{
            opacity: 0.55, fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--fg-deep)'
          }}>
            {doubled.map((g, i) => <span key={i}>{g}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// 3. PROBLEM
function ProblemSection({ navigate }) {
  const pains = [
    { icon: <IconPlanning size={44} stroke={1} />, title: 'I keep planning fresh starts', body: 'New timetable every Monday. Forgotten by Wednesday. Repeat.' },
    { icon: <IconPhone size={44} stroke={1} />, title: 'My phone keeps winning', body: 'One notification turns into an evening you didn\'t mean to lose.' },
    { icon: <IconCompass size={44} stroke={1} />, title: 'I don\'t know what to do next', body: "20 minutes deciding what to study. Then it's 11pm and you've done nothing." },
    { icon: <IconHourglass size={44} stroke={1} />, title: 'Deadlines become panic mode', body: 'The deadline stayed visible. The panic still arrived last night.' },
  ];
  return (
    <section className="section" style={{ background: 'var(--bg)', padding: '80px 0 56px' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>The reality</div>
          <h2 style={{ color: 'var(--fg-deep)', marginBottom: 16 }}>Be honest… this is<br />your reality right now.</h2>
          <p style={{ fontSize: 17, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            You want to do better. Somehow the same week keeps repeating.
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          borderTop: '1px solid rgba(128,128,128,0.15)',
          borderBottom: '1px solid rgba(128,128,128,0.15)'
        }}>
          {pains.map((p, i) => (
            <motion.div 
              key={i} 
              onClick={() => navigate('/register?problem=' + i)}
              className={`reveal reveal-delay-${i + 1}`} 
              whileHover={{ backgroundColor: 'rgba(128,128,128,0.04)' }}
              style={{
                padding: '28px 24px 24px',
                borderRight: i < 3 ? '1px solid rgba(128,128,128,0.15)' : 'none',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                minHeight: '270px',
                transition: 'background-color 0.3s ease'
              }}
            >
              {/* Icon in faint glass circle */}
              <div style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                margin: '0 0 auto 0', flex: 1, paddingTop: 4
              }}>
                <motion.div 
                  whileHover={{ scale: 1.06, opacity: 1 }}
                  style={{ 
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid rgba(128,128,128,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--fg-muted)', opacity: 0.85,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {p.icon}
                </motion.div>
              </div>

              {/* Bottom text */}
              <div style={{ transition: 'opacity 0.3s ease' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 10, lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{p.body}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition line */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 28 }}>
          <p style={{ 
            fontSize: 17, fontWeight: 500, color: 'var(--fg-deep)', 
            fontStyle: 'italic', letterSpacing: '-0.01em', opacity: 0.7,
            maxWidth: 520, margin: '0 auto'
          }}>
            This isn't a motivation problem. It's a planning system problem.
          </p>
        </div>
      </div>
    </section>
  );
}

// 4. SOLUTION
function SolutionSection({ navigate }) {
  const callouts = [
    { label: 'Knows what to study', body: 'Your syllabus turns into a realistic roadmap.', icon: <IconSparkle size={16} /> },
    { label: 'Knows what matters today', body: 'Daily tasks appear already prioritized.', icon: <IconZap size={16} /> },
    { label: 'Knows when you\'re slipping', body: 'Progress scoring and adaptive replanning keep you on pace.', icon: <IconTrend size={16} /> },
  ];

  // ── inline dashboard mockup ───────────────────────────
  const DashboardMockup = () => (
    <div style={{
      width: '100%', borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card-lg)',
      background: 'var(--surface)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,90,90,0.6)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,190,0,0.6)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(40,200,90,0.5)' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          planorah.me/dashboard
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 180px', minHeight: 340 }}>

        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '20px 0' }}>
          <div style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Roadmap</div>
            {[
              { label: 'DSA Fundamentals', done: true },
              { label: 'System Design Basics', done: true },
              { label: 'Mock Interviews', done: false, active: true },
              { label: 'Behavioural Prep', done: false },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6, marginBottom: 2,
                background: item.active ? 'var(--light-gray)' : 'transparent'
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: item.done ? 'none' : '1.5px solid rgba(128,128,128,0.3)',
                  background: item.done ? 'var(--tag-blue)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.done && <span style={{ color: '#fff', fontSize: 8, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: item.active ? 'var(--fg-deep)' : 'var(--fg-muted)', fontWeight: item.active ? 600 : 400 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 0 16px' }} />

          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Today's focus</div>
            {['Practice 3 LeetCode mediums', 'Review system design notes', 'Mock call — 45 min'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid rgba(128,128,128,0.3)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-deep)', marginBottom: 4 }}>Today — Tuesday</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>3 tasks · 2h 45m planned</div>
            </div>
            {/* Pomodoro widget */}
            <div style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '2px solid var(--tag-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '4px 0 4px 7px', borderColor: 'transparent transparent transparent var(--tag-violet)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>24:00</div>
                <div style={{ fontSize: 10, color: 'var(--fg-muted)' }}>focus</div>
              </div>
            </div>
          </div>

          {/* Task blocks */}
          {[
            { time: '09:00', label: 'Practice 3 LeetCode mediums', tag: 'DSA', dur: '60m', active: true, color: 'var(--tag-blue)', colorBg: 'var(--tag-blue-bg)' },
            { time: '10:15', label: 'Review system design notes', tag: 'Design', dur: '45m', active: false, color: 'var(--tag-teal)', colorBg: 'var(--tag-teal-bg)' },
            { time: '11:30', label: 'Mock interview call', tag: 'Interview', dur: '45m', active: false, color: 'var(--tag-violet)', colorBg: 'var(--tag-violet-bg)' },
          ].map((task, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px', borderRadius: 8, marginBottom: 8,
              border: task.active ? '1px solid var(--tag-blue)' : '1px solid var(--border-subtle)',
              background: task.active ? 'var(--tag-blue-bg)' : 'transparent'
            }}>
              <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 38 }}>{task.time}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: task.active ? 600 : 400, color: task.active ? 'var(--fg-deep)' : 'var(--fg-muted)' }}>{task.label}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: task.color, background: task.colorBg, padding: '2px 7px', borderRadius: 4 }}>{task.tag}</span>
              <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{task.dur}</span>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ borderLeft: '1px solid var(--border-subtle)', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Weekly score</div>

          {/* Score ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 8 }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={32} fill="none" stroke="var(--light-gray)" strokeWidth={6} />
                <circle cx={40} cy={40} r={32} fill="none" stroke="var(--tag-blue)" strokeWidth={6}
                  strokeDasharray={`${2 * Math.PI * 32 * 0.78} ${2 * Math.PI * 32}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-deep)' }}>78</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>consistency</div>
          </div>

          {/* Streak */}
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--light-gray)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-deep)' }}>11 days</div>
                <div style={{ fontSize: 10, color: 'var(--fg-muted)' }}>streak</div>
              </div>
            </div>
          </div>

          {/* Pace bars */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Pace</div>
          {[{ label: 'DSA', pct: 82, color: 'var(--tag-blue)' }, { label: 'System Design', pct: 55, color: 'var(--tag-teal)' }, { label: 'Interview', pct: 40, color: 'var(--tag-violet)' }].map((b, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{b.label}</span>
                <span style={{ color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>{b.pct}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--light-gray)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 2, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>The fix</div>
          <h2 style={{ marginBottom: 20, color: 'var(--fg-deep)', letterSpacing: '-0.02em' }}>
            Meet the system that plans,<br />prioritizes, and keeps you moving.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
            One student-focused operating system that knows what to do, when to do it, and how you're actually progressing.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="reveal reveal-scale" style={{ marginBottom: 48 }}>
          <DashboardMockup />
        </div>

        {/* 3 callouts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {callouts.map((c, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{
              padding: '24px 20px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              display: 'flex', flexDirection: 'column', gap: 6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: 'var(--fg-deep)' }}>
                {c.icon}
                <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal" style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', fontSize: 15 }}
          >
            Start your roadmap free <IconArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// 5. HOW IT WORKS
function HowItWorksSection({ navigate }) {
  const steps = [
    { n: '01', title: 'Enter your goal or course load', body: 'PDF, exam target, subject list, or pasted notes.' },
    { n: '02', title: 'AI builds your roadmap',         body: 'Week-by-week milestones, sized to your time.' },
    { n: '03', title: 'Get your daily plan',            body: 'One focused list each morning. No blank-page.' },
    { n: '04', title: 'Run focus sessions',             body: 'Pomodoro from any task, one click.' },
    { n: '05', title: 'Track your progress',            body: 'Score, streaks, per-goal velocity.' },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const itemVars = {
    hidden: { opacity: 0, x: -20, y: 10 },
    show: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <section style={{ background: 'var(--bg-subtle)', padding: '96px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>How it works</div>
          <h2 style={{ fontSize: 36, color: 'var(--fg-deep)', letterSpacing: '-0.02em', margin: 0 }}>
            Goal in. Roadmap built. Daily focus.
          </h2>
        </motion.div>

        {/* Vertical Roadmap */}
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto 56px', paddingLeft: 64 }}>
          {/* Animated vertical track */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 'calc(100% - 40px)' }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 16, left: 16, width: 2,
              background: 'linear-gradient(to bottom, var(--fg-deep) 0%, var(--border-subtle) 100%)',
              zIndex: 0
            }}
          />

          <motion.div
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10%' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
          >
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={itemVars}
                style={{ position: 'relative' }}
              >
                {/* Number node on the line */}
                <motion.div 
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--fg-deep)', color: 'var(--bg)', borderColor: 'var(--fg-deep)' }}
                  style={{
                    position: 'absolute', left: -64, top: 0,
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--bg-subtle)', border: '2px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)',
                    zIndex: 2, transition: 'all 0.2s', cursor: 'default'
                  }}
                >
                  {s.n}
                </motion.div>

                {/* Content card */}
                <motion.div
                  whileHover={{ x: 6, backgroundColor: 'var(--bg)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', borderColor: 'var(--fg-muted)' }}
                  style={{
                    padding: '24px 28px',
                    background: 'var(--surface)',
                    borderRadius: 16,
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</div>
                  <div style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{s.body}</div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          style={{ textAlign: 'center' }}
        >
          <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 28px', fontSize: 15 }}>
            Start your roadmap &rarr;
          </button>
        </motion.div>
      </div>
    </section>
  );
}


// 6. THREE LAYERS
function ThreeLayersSection({ navigate }) {
  const [active, setActive] = React.useState(0);

  const ChromeBar = ({ url }) => (
    <div style={{ padding: '10px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {['rgba(255,95,86,0.6)','rgba(255,189,46,0.5)','rgba(39,201,63,0.45)'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
      </div>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{url}</div>
    </div>
  );

  const RoadmapPanel = () => (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
      <ChromeBar url="planorah.me / roadmap" />
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', minHeight: 300 }}>
        <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '14px 0', background: 'var(--bg-subtle)' }}>
          <div style={{ padding: '0 12px', marginBottom: 10, fontSize: 10, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Courses</div>
          {[{ code: 'CS 331', c: 'var(--tag-blue)', bg: 'var(--tag-blue-bg)', on: true }, { code: 'PH 220', c: 'var(--tag-violet)', bg: 'var(--tag-violet-bg)' }, { code: 'EC 101', c: 'var(--tag-teal)', bg: 'var(--tag-teal-bg)' }].map((x, i) => (
            <div key={i} style={{ padding: '7px 12px', background: x.on ? x.bg : 'transparent', borderLeft: x.on ? `2px solid ${x.c}` : '2px solid transparent' }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: x.on ? x.c : 'var(--fg-muted)', fontWeight: 600 }}>{x.code}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }} />
          <div style={{ padding: '0 12px' }}>
            {[{ l: 'Week 3 of 8', v: 38 }, { l: 'Tasks done', v: 62 }].map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{s.l}</span>
                  <span style={{ color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>{s.v}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--light-gray)', borderRadius: 2 }}>
                  <div style={{ width: `${s.v}%`, height: '100%', background: 'var(--tag-blue)', borderRadius: 2, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-deep)', marginBottom: 3 }}>DSA Fundamentals — Roadmap</div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 14 }}>AI-generated · 8 weeks · 3 exams</div>
          {[
            { week: 'Week 1–2', label: 'Foundations + Big-O notation', tasks: 6, done: true },
            { week: 'Week 3–4', label: 'Trees, Graphs & Traversals', tasks: 8, done: true },
            { week: 'Week 5–6', label: 'Dynamic Programming', tasks: 10, active: true },
            { week: 'Week 7–8', label: 'Mock Exams + Review', tasks: 5 },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 5, background: r.active ? 'rgba(56,189,248,0.06)' : 'transparent', border: r.active ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent', opacity: r.done || r.active ? 1 : 0.4 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: r.done ? 'var(--tag-blue)' : 'transparent', border: r.done ? 'none' : `1.5px solid ${r.active ? 'var(--tag-blue)' : 'rgba(128,128,128,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {r.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                {r.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tag-blue)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: r.active ? 600 : 400, color: r.active ? 'var(--fg-deep)' : 'var(--fg-muted)' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 1 }}>{r.week} · {r.tasks} tasks</div>
              </div>
              {r.active && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: 'var(--tag-blue-bg)', color: 'var(--tag-blue)', fontWeight: 700 }}>NOW</span>}
              {r.done && <span style={{ fontSize: 9, color: 'var(--fg-muted)' }}>Done</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ExecutionPanel = () => (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
      <ChromeBar url="planorah.me / today" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', minHeight: 300 }}>
        <div style={{ padding: '14px 0' }}>
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-deep)' }}>Today — Wednesday</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>4 tasks · 4h 15m planned</div>
          </div>
          {[
            { time: '09:00', dur: '90m', label: 'Graph traversal problems', tag: 'DSA', tc: 'var(--tag-blue)', tb: 'var(--tag-blue-bg)', active: true },
            { time: '11:00', dur: '45m', label: 'Read chapter 5 notes', tag: 'Theory', tc: 'var(--tag-teal)', tb: 'var(--tag-teal-bg)' },
            { time: '14:00', dur: '60m', label: 'Revision flashcards', tag: 'Review', tc: 'var(--tag-violet)', tb: 'var(--tag-violet-bg)' },
            { time: '15:30', dur: '45m', label: 'Practice problems set 4', tag: 'DSA', tc: 'var(--tag-blue)', tb: 'var(--tag-blue-bg)' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: t.active ? 'rgba(128,128,128,0.05)' : 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid rgba(128,128,128,0.3)', flexShrink: 0, background: t.active ? 'var(--fg-deep)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.active && <span style={{ color: 'var(--bg)', fontSize: 8 }}>▶</span>}
              </div>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', minWidth: 46, flexShrink: 0 }}>{t.time}</span>
              <span style={{ fontSize: 11, color: t.active ? 'var(--fg-deep)' : 'var(--fg-muted)', flex: 1, fontWeight: t.active ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: t.tb, color: t.tc, fontWeight: 600, flexShrink: 0 }}>{t.tag}</span>
              <span style={{ fontSize: 9, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 28 }}>{t.dur}</span>
            </div>
          ))}
        </div>
        <div style={{ borderLeft: '1px solid var(--border-subtle)', padding: '14px 10px', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Focus</div>
          <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 8 }}>
            <svg width={72} height={72} viewBox="0 0 72 72">
              <circle cx={36} cy={36} r={28} fill="none" stroke="var(--border-subtle)" strokeWidth={5} />
              <circle cx={36} cy={36} r={28} fill="none" stroke="var(--fg-muted)" strokeWidth={5}
                strokeDasharray={`${2 * Math.PI * 28 * 0.62} ${2 * Math.PI * 28}`}
                strokeLinecap="round" transform="rotate(-90 36 36)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>15:23</div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--fg-deep)', fontWeight: 600, marginBottom: 8, textAlign: 'center', lineHeight: 1.3 }}>Graph traversal</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: 'var(--fg-deep)', color: 'var(--bg)', fontWeight: 600 }}>Pause</div>
            <div style={{ fontSize: 9, padding: '3px 6px', borderRadius: 4, background: 'var(--light-gray)', color: 'var(--fg-muted)' }}>Skip</div>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', width: '100%', margin: '12px 0' }} />
          {[{ l: '2h 15m', sub: 'focused' }, { l: '3 / 4', sub: 'tasks done' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>{s.l}</div>
              <div style={{ fontSize: 9, color: 'var(--fg-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AnalyticsPanel = () => (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
      <ChromeBar url="planorah.me / analytics" />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4 }}>Week 5 focus score</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg-deep)', lineHeight: 1 }}>82<span style={{ fontSize: 17, color: 'var(--fg-muted)' }}>/100</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
            <div style={{ padding: '3px 9px', borderRadius: 99, background: 'var(--tag-teal-bg)', color: 'var(--tag-teal)', fontSize: 11, fontWeight: 600 }}>+12 vs last week</div>
            <div style={{ padding: '3px 9px', borderRadius: 99, background: 'var(--light-gray)', color: 'var(--fg-muted)', fontSize: 11 }}>🔥 11 day streak</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, alignItems: 'end', height: 52, marginBottom: 5 }}>
          {[42, 65, 50, 88, 72, 82, 58].map((v, i) => (
            <div key={i} style={{ height: `${v}%`, background: i === 5 ? 'var(--fg-deep)' : 'var(--light-gray)', borderRadius: '3px 3px 0 0', opacity: i === 5 ? 1 : 0.55 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
          {['M','T','W','T','F','S','S'].map((d,i) => <span key={i}>{d}</span>)}
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Course velocity</div>
          {[{ l: 'DSA', pct: 88, c: 'var(--tag-blue)' }, { l: 'Physics', pct: 62, c: 'var(--tag-violet)' }, { l: 'Economics', pct: 40, c: 'var(--tag-teal)' }].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, fontSize: 12 }}>
              <span style={{ width: 72, color: 'var(--fg-muted)', flexShrink: 0 }}>{b.l}</span>
              <div style={{ flex: 1, height: 5, background: 'var(--light-gray)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${b.pct}%`, height: '100%', background: b.c, borderRadius: 3, opacity: 0.85 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-deep)', width: 30, textAlign: 'right' }}>{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const layers = [
    { num: '01', label: 'AI Planning', tag: 'Structured intelligence', headline: 'Syllabus in. Study system out.', body: 'Upload any course material. Planorah reads your deadlines and available hours, then builds a full week-by-week roadmap automatically. You configure nothing.', proof: ['Adapts when you miss a day', 'Milestone-aware, not just task-aware'], panel: <RoadmapPanel /> },
    { num: '02', label: 'Daily Execution', tag: 'Built-in focus engine', headline: 'Your day is already decided.', body: 'Wake up to a single focused list sized to your actual hours. Start a Pomodoro from any task. Planorah logs the time and reschedules tomorrow if you overrun.', proof: ['One-click Pomodoro per task', 'Auto-reschedules if you overrun'], panel: <ExecutionPanel /> },
    { num: '03', label: 'Adaptive Intelligence', tag: 'Learns as you go', headline: "Knows when you're falling behind.", body: "Weekly focus score, per-course velocity, and a burnout flag when you're overloaded. Planorah sees problems before you feel them — and reschedules proactively.", proof: ['Per-course velocity tracking', 'Burnout flag before it\'s too late'], panel: <AnalyticsPanel /> },
  ];

  const cur = layers[active];

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>The system</div>
          <h2 style={{ marginBottom: 16, color: 'var(--fg-deep)', letterSpacing: '-0.01em' }}>One system. Three layers.</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6 }}>Most tools only do one of these. Planorah does all three — connected.</p>
        </div>

        {/* Tabs */}
        <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 56 }}>
          {layers.map((l, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: active === i ? 'var(--fg-deep)' : 'transparent',
              color: active === i ? 'var(--bg)' : 'var(--fg-muted)',
              border: active === i ? '1px solid transparent' : '1px solid var(--border-subtle)',
              transition: 'all 0.18s ease',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.55, marginRight: 7 }}>{l.num}</span>
              {l.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.55fr', gap: 72, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{cur.tag}</div>
            <h3 style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 18, color: 'var(--fg-deep)' }}>{cur.headline}</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--fg-muted)', marginBottom: 28 }}>{cur.body}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cur.proof.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-deep)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheck size={11} stroke={2.5} />
                  </span>
                  {p}
                </div>
              ))}
            </div>
          </div>
          {/* Right: animated */}
          <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
            {cur.panel}
          </motion.div>
        </div>

        {/* CTA */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 64 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/features')} style={{ fontSize: 14, gap: 6, padding: '10px 22px' }}>
            Explore all features <IconArrowRight size={13} />
          </button>
        </div>

      </div>
    </section>
  );
}

// 10. SOCIAL PROOF
function SocialProof() {
  const learnings = [
    {
      headline: 'Students weren\'t missing motivation — they were missing clarity.',
      detail: 'Every interview surfaced the same gap: they knew they needed to study, but not what, not when, not for how long.',
    },
    {
      headline: 'Every planner they tried created plans. None created follow-through.',
      detail: 'Notion, paper, spreadsheets — all required maintenance. The moment life disrupted the plan, the plan was abandoned.',
    },
    {
      headline: 'Consistency only clicked when daily decisions were removed.',
      detail: 'The students who stayed consistent shared one thing: they woke up already knowing what to do.',
    },
  ];

  const reactions = [
    '"It stopped the nightly what-do-I-study delay."',
    '"First planner that didn\'t need babysitting."',
    '"The weekly score quietly kept me honest."',
  ];

  return (
    <section className="section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="container">

        {/* Centred header */}
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 64px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Early student signals</div>
          <h2 style={{ color: 'var(--fg-deep)', letterSpacing: '-0.01em', marginBottom: 14 }}>
            Built from what students kept telling us.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.65 }}>
            Before writing a feature, we ran three rounds of student interviews. The same problems surfaced every time.
          </p>
        </div>

        {/* Two-column: learnings list | quote stack */}
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* Left — interview learnings, vertical list with accent line */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>
              What 14 interviews told us
            </div>
            {learnings.map((l, i) => (
              <div key={i} style={{
                borderLeft: '2px solid var(--border-subtle)',
                paddingLeft: 20,
                paddingBottom: i < learnings.length - 1 ? 32 : 0,
                position: 'relative',
              }}>
                {/* Dot on the line */}
                <div style={{
                  position: 'absolute', left: -5, top: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--fg-deep)', border: '2px solid var(--bg-subtle)',
                }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-deep)', lineHeight: 1.45, marginBottom: 8 }}>
                  {l.headline}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  {l.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Right — quote cards stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Early beta reactions
            </div>
            {reactions.map((r, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{
                padding: '20px 22px',
                background: 'var(--surface)',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 15, color: 'var(--fg-deep)', lineHeight: 1.55, marginBottom: 12 }}>{r}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>— Early beta tester</div>
              </div>
            ))}

            {/* Quiet footnote inside right column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fg-muted)', opacity: 0.35, flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                Closed beta · Names withheld · 3 cohorts
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}



// 11. STACK COMPARISON
function StackComparison() {
  const before = [
    { label: 'Notion doc',         sub: 'Rewritten every semester, then abandoned.' },
    { label: 'Google Calendar',    sub: 'Great for events. Useless for study rhythm.' },
    { label: 'Separate Pomodoro app', sub: 'Not connected to what you should be doing.' },
    { label: 'Manual weekly timetable', sub: 'Falls apart the moment one thing shifts.' },
    { label: 'Mental guilt tracking', sub: '"I know I should study but don\'t know where to start."' },
    { label: 'Random reminders',   sub: 'Snoozed. Ignored. Forgotten.' },
  ];

  const after = [
    { label: 'AI roadmap from your goal', sub: 'Built in minutes. Rebuilt when life changes.' },
    { label: 'Daily prioritised task list', sub: 'Wake up already knowing what to do.' },
    { label: 'Built-in focus timer',       sub: 'Start a session from any task, one click.' },
    { label: 'Adaptive replanning',        sub: 'Miss a day? System adjusts, not you.' },
    { label: 'Visible consistency score',  sub: 'Progress you can actually see and trust.' },
    { label: 'One connected workflow',     sub: 'Goal → roadmap → today → session → score.' },
  ];

  const XIcon = () => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx={7} cy={7} r={6.5} stroke="rgba(255,255,255,0.15)" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="rgba(255,255,255,0.3)" strokeWidth={1.4} strokeLinecap="round"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx={7} cy={7} r={6.5} stroke="rgba(255,255,255,0.4)" />
      <path d="M4 7l2.2 2.2L10 4.5" stroke="var(--fg-deep)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <section className="section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="container">

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>How we're different</div>
          <h2 style={{ color: 'var(--fg-deep)', letterSpacing: '-0.01em', marginBottom: 14 }}>
            Stop juggling. Start flowing.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.65 }}>
            Most students aren't unproductive. They're operating five tools that were never designed to talk to each other.
          </p>
        </div>

        {/* Two-column comparison */}
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 960, margin: '0 auto' }}>

          {/* Left — The Usual Stack */}
          <div style={{
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--border-subtle)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                The usual student stack
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {before.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '14px 24px',
                  borderBottom: i < before.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  opacity: 0.65,
                }}>
                  <XIcon />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-deep)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Planorah */}
          <div style={{
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--fg-deep)', overflow: 'hidden',
            boxShadow: '0 0 0 1px var(--fg-deep)',
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-deep)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                Planorah — one connected system
              </div>
            </div>
            <div style={{ padding: '8px 0', position: 'relative' }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute', left: 31, top: 20, bottom: 20,
                width: 1, background: 'var(--border-subtle)', zIndex: 0,
              }} />
              {after.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '14px 24px',
                  borderBottom: i < after.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  position: 'relative', zIndex: 1,
                }}>
                  <CheckIcon />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer nudge */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 36 }}>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
            Everything on the right was previously five separate apps.
          </p>
        </div>

      </div>
    </section>
  );
}


// 12. ONBOARDING PREVIEW
function OnboardingPreview() {
  const [pick, setPick] = useState(1);
  const opts = [
    { emoji: '🔒', label: 'Locked in mode',        sub: 'I know what I\'m doing. Just make it sharper.' },
    { emoji: '🌀', label: 'Trying but inconsistent', sub: 'Good weeks, bad weeks. Need a rhythm.' },
    { emoji: '⏳', label: 'Delay master',            sub: 'I will do it tomorrow. I promise.' },
    { emoji: '📱', label: 'Scrolling champion',      sub: 'The phone keeps winning. Help.' },
  ];
  return (
    <section className="section">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>

        {/* Left — sharper copy, pinned to top */}
        <div className="reveal-left" style={{ paddingTop: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Honest onboarding</div>
          <h2 style={{ marginBottom: 18 }}>
            The roadmap only works if it starts from your real habits.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--fg-muted)', marginBottom: 16 }}>
            Planorah begins with a few brutally honest questions about your consistency, distractions, and current pace — then shapes the system around that reality.
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-deep)' }}>
            So two students never get the same plan.
          </p>
        </div>

        {/* Right — mockup with progress bar + glowing selection */}
        <div className="reveal-right card" style={{ padding: 28 }}>

          {/* Step indicator + progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Step 1 of 4</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>25%</div>
            </div>
            <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '25%', height: '100%', background: 'var(--fg-deep)', borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-deep)', marginBottom: 18, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
            Be honest… which one feels like you lately?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opts.map((o, i) => {
              const isActive = pick === i;
              return (
                <motion.div key={i} onClick={() => setPick(i)}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: isActive ? 'var(--bg-subtle)' : 'transparent',
                    border: isActive ? '1.5px solid var(--fg-deep)' : '1px solid var(--border-subtle)',
                    boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.06)' : 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    opacity: !isActive ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{o.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)' }}>{o.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{o.sub}</div>
                  </div>
                  {isActive && (
                    <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: 'var(--fg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width={9} height={9} viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="var(--bg)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}


// 13. FOUNDER
function FounderSection() {
  return (
    <section style={{ padding: '56px 0', background: 'var(--bg)' }}>
      <div className="container-narrow reveal">
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 20,
          padding: '28px 32px', background: 'var(--surface)',
          borderRadius: 16, border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'var(--light-gray)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
            color: 'var(--fg-deep)', border: '1px solid var(--border-subtle)', flexShrink: 0
          }}>AG</div>
          <div>
            <div style={{ fontSize: 15, color: 'var(--fg-deep)', lineHeight: 1.65, marginBottom: 10 }}>
              "I had Notion, Todoist, and Google Calendar — and still opened Instagram at 11pm instead of studying.
              Planorah is what I needed instead: structure that shows up every morning without me having to rebuild it."
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
              <span style={{ color: 'var(--fg-deep)', fontWeight: 600 }}>Abhinav Goyal</span> · Founder, MCA student
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 16. FAQ

function FAQSection() {
  const items = [
    { q: 'Is Planorah really free?', a: 'Yes — the Free plan is free forever. You can import a syllabus, get a roadmap, and use the daily planner without paying. Pro adds unlimited Pomodoros, advanced analytics, and calendar sync.' },
    { q: 'How does the AI actually work?', a: 'We parse your syllabus (dates, deliverables, reading loads) and use a language model to turn it into structured tasks, sized against your declared free time. Your data isn\'t used to train third-party models.' },
    { q: 'Can I edit the AI roadmap?', a: 'Every task is editable. Drag to reschedule, split, merge, or delete. Planorah propagates the change across the rest of the semester automatically.' },
    { q: 'Does it work for all subjects?', a: 'Yes — CS, humanities, sciences, pre-med, law. Anything with a syllabus or a goal works. It\'s especially strong for courses with regular problem sets or deliverables.' },
    { q: 'What if I fall behind?', a: 'Planorah reshapes the remaining plan around your new reality. No red text, no guilt — just a recalibrated week.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section">
      <div className="container-narrow">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>FAQ</div>
          <h2>Questions, answered.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, i) => (
            <motion.div key={i} className="reveal" 
              whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
              style={{
                background: 'var(--surface)', borderRadius: 16,
                border: '1px solid rgba(128,128,128,0.1)',
                transition: 'all 0.2s ease', overflow: 'hidden'
            }}>
              <div onClick={() => setOpen(open === i ? -1 : i)} style={{
                padding: '24px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-deep)' }}>{it.q}</div>
                <div style={{ fontSize: 18, color: 'var(--fg-muted)', transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</div>
              </div>
              {open === i && (
                <div style={{ padding: '0 24px 24px', fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{it.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 17. FINAL CTA
function FinalCTA({ navigate }) {
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
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Start free now <IconArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

// Main Page
const LandingPage = () => {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="route-fade">
      <HeroSection navigate={navigate} />
      <TrustBar />
      <ProblemSection navigate={navigate} />
      <SolutionSection navigate={navigate} />
      <HowItWorksSection navigate={navigate} />
      <ThreeLayersSection navigate={navigate} />
      <SocialProof />
      <OnboardingPreview />
      <StackComparison />

      <FounderSection />
      <FAQSection />
      <FinalCTA navigate={navigate} />
    </div>
  );
};

export default LandingPage;
