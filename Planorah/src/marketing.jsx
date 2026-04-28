// Marketing surfaces: Home, Features, Pricing

// =========================================================
// HOME / LANDING
// =========================================================
const HomePage = ({ setRoute, setInApp }) => {
  return (
    <div className="route-fade">
      {/* HERO — split layout: text left, product card right */}
      <section style={{ padding: '88px 0 64px' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: 72,
          alignItems: 'center'
        }}>
          <div>
            <div className="reveal-fade" data-reveal-once="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Pill>
                <span style={{ color: 'var(--fg-muted)' }}>Live</span>
                <span style={{ color: 'var(--fg-deep)' }}>planorah.me — AI academic planner for students</span>
                <IconArrowRight size={12} />
              </Pill>
            </div>
            <h1 style={{ marginBottom: 24, maxWidth: 580 }}>
              <span className="hero-line" data-reveal-once="true"><span>Master your time.</span></span>
              <span className="hero-line hero-line-2" data-reveal-once="true"><span>Maximize your learning.</span></span>
            </h1>
            <p className="reveal reveal-delay-2" data-reveal-once="true" style={{ fontSize: 18, maxWidth: 500, lineHeight: 1.55 }}>
              Planorah reads your syllabi, generates a personal study schedule, and adapts as deadlines shift — with an adaptive Pomodoro timer, weekly focus score, and an AI study assistant built in.
            </p>
            <div className="reveal reveal-delay-3" data-reveal-once="true" style={{ display: 'flex', gap: 10, marginTop: 32 }}>
              <Button variant="primary" size="lg" onClick={() => { setInApp(true); setRoute('onboarding'); }}>
                Start for free <IconArrowRight size={14} />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setRoute('features')}>
                How it works
              </Button>
            </div>
            <div className="reveal reveal-delay-4" data-reveal-once="true" style={{
              display: 'flex', gap: 20, marginTop: 40,
              color: 'var(--fg-muted)', fontSize: 13
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconCheck size={14} /> Free for students
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconCheck size={14} /> Imports your syllabus
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconCheck size={14} /> No credit card
              </span>
            </div>
          </div>
          <div className="reveal-scale reveal-delay-2" data-reveal-once="true"><HeroProductCard /></div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ padding: '32px 0 72px' }}>
        <div className="container">
          <div className="reveal reveal-fade" data-reveal-once="true" style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--fg-muted)',
            marginBottom: 24
          }}>Used by students at</div>
          <div className="drift-mask">
            <div className="drift-track" style={{
              opacity: 0.55,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: '-0.01em',
              color: 'var(--fg-deep)'
            }}>
              {[...['Berkeley', 'MIT', 'NYU', 'Toronto', 'Imperial', 'McGill', 'ETH', 'UChicago', 'Stanford', 'Oxford', 'Cambridge', 'Yale'], ...['Berkeley', 'MIT', 'NYU', 'Toronto', 'Imperial', 'McGill', 'ETH', 'UChicago', 'Stanford', 'Oxford', 'Cambridge', 'Yale']].map((u, i) => (
                <span key={i}>{u}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FEATURES OVERVIEW */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ maxWidth: 680, marginBottom: 64 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>How it works</div>
            <h2 style={{ marginBottom: 20 }}>Three things,<br />done well.</h2>
            <p style={{ fontSize: 17 }}>
              Planorah isn't trying to replace your university. It does three specific things — scheduling, pacing, answering — so well that you stop thinking about them.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20
          }}>
            <div className="reveal reveal-delay-1"><FeatureTile
              icon={<IconSparkle size={18} />}
              title="AI study schedules"
              body="Point it at your syllabus. Get a week-by-week plan shaped around your deadlines, exams, and real free time." /></div>
            <div className="reveal reveal-delay-2"><FeatureTile
              icon={<IconTrend size={18} />}
              title="Personal pace"
              body="Planorah learns how fast you actually work — not how fast you think you do — and re-plans as the term moves." /></div>
            <div className="reveal reveal-delay-3"><FeatureTile
              icon={<IconChat size={18} />}
              title="Ask anything"
              body="An AI planner that knows your workload. Ask 'what should I do tonight?' or 'move Friday's essay' in plain English." /></div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE — planner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 64,
            alignItems: 'center'
          }}>
            <div className="reveal-left">
              <div className="eyebrow" style={{ marginBottom: 16 }}>Weekly view</div>
              <h3 style={{ marginBottom: 16, fontSize: 32, lineHeight: 1.15 }}>
                Your week, already planned.
              </h3>
              <p style={{ fontSize: 16, marginBottom: 24 }}>
                Every assignment broken into work blocks. Every block fits the hours you actually have free. If a class gets moved, Planorah redraws the week in seconds.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <BulletLine text="Blocks sized to match how long you usually take" />
                <BulletLine text="Protects declared focus hours and sleep" />
                <BulletLine text="Syncs to Google Calendar and Outlook" />
              </div>
            </div>
            <div className="reveal-right"><PlannerMiniPreview /></div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding: '40px 0 96px' }}>
        <div className="container-narrow">
          <div className="reveal-scale" style={{
            textAlign: 'center',
            padding: '48px 24px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1.25, color: 'var(--fg-deep)', marginBottom: 24 }}>
              "I stopped keeping a bullet journal. Planorah does the hard part — deciding what to work on — so I can just work."
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'var(--fg-muted)', fontSize: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--light-gray)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)'
              }}>MS</div>
              Maya S.
              <span>·</span>
              <span>Junior, Comp Sci — UC Berkeley</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section style={{ padding: '24px 0 96px' }}>
        <div className="container-narrow">
          <div className="reveal reveal-scale" style={{
            background: 'var(--charcoal)',
            color: 'var(--white)',
            borderRadius: 'var(--r-16)',
            padding: '56px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32, fontWeight: 600, lineHeight: 1.15, marginBottom: 8
              }}>
                Import your syllabus. Get your semester.
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
                Takes about 30 seconds. Free for students.
              </div>
            </div>
            <Button variant="ghost" size="lg"
                    onClick={() => { setInApp(true); setRoute('onboarding'); }}
                    style={{ background: 'var(--white)', color: 'var(--charcoal)' }}>
              Try Planorah <IconArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const BulletLine = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-deep)' }}>
    <span style={{
      width: 18, height: 18, borderRadius: '50%',
      background: 'var(--light-gray)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--fg-deep)'
    }}>
      <IconCheck size={11} stroke={2.2} />
    </span>
    {text}
  </div>
);

const FeatureTile = ({ icon, title, body }) => (
  <div className="card" style={{ padding: 28 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'var(--light-gray)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, color: 'var(--fg-deep)'
    }}>{icon}</div>
    <h4 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h4>
    <p style={{ fontSize: 14, lineHeight: 1.55 }}>{body}</p>
  </div>
);

// =========================================================
// HERO PRODUCT CARD — a little product "screenshot" of today's plan
// =========================================================
const HeroProductCard = () => {
  const [done, setDone] = useState(['h1']);
  const toggle = (id) => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  const items = [
    { id: 'h1', time: '9:30',  dur: '50m',  course: 'cs331', label: 'Lecture — Dynamic Programming' },
    { id: 'h2', time: '11:00', dur: '1h 30m', course: 'ph220', label: 'Lab prep — Pendulum writeup' },
    { id: 'h3', time: '2:00',  dur: '45m',  course: 'ec101', label: 'Reading — Mankiw Ch. 8' },
    { id: 'h4', time: '4:30',  dur: '2h',   course: 'cs331', label: 'PSet 4 — DP solutions' },
    { id: 'h5', time: '7:30',  dur: '1h',   course: 'en210', label: 'Essay outline' },
  ];
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'var(--light-gray)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}><IconSparkle size={13} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)' }}>Today · Tuesday Apr 22</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>6h 5m planned</div>
      </div>
      <div style={{ padding: 8 }}>
        {items.map(it => {
          const course = COURSES.find(c => c.id === it.course);
          const isDone = done.includes(it.id);
          return (
            <div key={it.id}
                 onClick={() => toggle(it.id)}
                 style={{
                   display: 'grid',
                   gridTemplateColumns: '56px 18px 1fr auto',
                   alignItems: 'center',
                   gap: 12,
                   padding: '10px 10px',
                   borderRadius: 8,
                   cursor: 'pointer',
                   transition: 'background 0.15s ease'
                 }}
                 onMouseEnter={e => e.currentTarget.style.background = 'var(--light-gray)'}
                 onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{it.time}</div>
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                boxShadow: 'var(--shadow-ring)',
                background: isDone ? 'var(--charcoal)' : 'transparent',
                color: 'var(--white)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
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
              <IconMore size={14} style={{ color: 'var(--fg-muted)' }} />
            </div>
          );
        })}
      </div>
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--fg-muted)'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconFlame size={12} /> 12-day streak
        </span>
        <span>1 of {items.length} complete</span>
      </div>
    </div>
  );
};

// =========================================================
// MINI PLANNER PREVIEW (for the split feature section)
// =========================================================
const PlannerMiniPreview = () => {
  const blocks = [
    { day: 0, row: 1, span: 2, course: 'cs331', label: 'Algo lecture' },
    { day: 0, row: 4, span: 2, course: 'ph220', label: 'Lab' },
    { day: 1, row: 2, span: 3, course: 'ma241', label: 'Problem set' },
    { day: 2, row: 1, span: 2, course: 'en210', label: 'Essay draft' },
    { day: 2, row: 4, span: 2, course: 'cs331', label: 'PSet 4' },
    { day: 3, row: 3, span: 2, course: 'ec101', label: 'Reading' },
    { day: 4, row: 1, span: 3, course: 'ph220', label: 'Study block' },
    { day: 4, row: 5, span: 1, course: 'ps120', label: 'Response' },
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Week of Apr 21</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>18h planned · 3h buffer</div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        position: 'relative'
      }}>
        {days.map(d => (
          <div key={d} style={{ fontSize: 11, color: 'var(--fg-muted)', textAlign: 'center', marginBottom: 4 }}>{d}</div>
        ))}
        {days.map((_, col) => (
          <div key={col} style={{
            gridColumn: col + 1,
            gridRow: '2 / span 6',
            display: 'grid',
            gridTemplateRows: 'repeat(6, 32px)',
            gap: 4,
            position: 'relative'
          }}>
            {[...Array(6)].map((_, r) => (
              <div key={r} style={{
                background: 'var(--light-gray)',
                borderRadius: 4,
                opacity: 0.5
              }} />
            ))}
            {blocks.filter(b => b.day === col).map((b, i) => {
              const course = COURSES.find(c => c.id === b.course);
              const top = (b.row - 1) * 36;
              const height = b.span * 32 + (b.span - 1) * 4;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  top, left: 0, right: 0, height,
                  background: `var(--tag-${course.color}-bg)`,
                  color: `var(--tag-${course.color})`,
                  borderRadius: 4,
                  padding: '4px 6px',
                  fontSize: 10,
                  fontWeight: 500,
                  overflow: 'hidden'
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, opacity: 0.8 }}>{course.code}</div>
                  <div style={{ color: 'var(--fg-deep)', fontSize: 10, marginTop: 2, lineHeight: 1.2 }}>{b.label}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// FEATURES PAGE
// =========================================================
const FeaturesPage = ({ setRoute, setInApp }) => (
  <div className="route-fade">
    <section style={{ padding: '96px 0 48px' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Features</div>
        <h1 className="reveal reveal-delay-1" style={{ fontSize: 56, marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
          A planner that does the planning.
        </h1>
        <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Three capabilities, built for the actual rhythm of a semester — not a generic to-do app with a calendar view bolted on.
        </p>
      </div>
    </section>

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

    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ marginBottom: 16 }}>And the small things,<br />done right.</h2>
          <p style={{ fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
            The details that make a daily-use tool feel like yours.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div className="reveal reveal-delay-1"><SmallFeature icon={<IconCalendar size={16} />} title="Calendar sync" body="Google & Outlook two-way." /></div>
          <div className="reveal reveal-delay-2"><SmallFeature icon={<IconBookmark size={16} />} title="Reading library" body="Auto-extracted from syllabi." /></div>
          <div className="reveal reveal-delay-3"><SmallFeature icon={<IconZap size={16} />} title="Quick rescheduling" body="Drag a block. Everything updates." /></div>
          <div className="reveal reveal-delay-4"><SmallFeature icon={<IconShield size={16} />} title="Private by default" body="Your syllabi never train models." /></div>
          <div className="reveal reveal-delay-1"><SmallFeature icon={<IconFlame size={16} />} title="Streaks" body="Gentle, skippable, off by default." /></div>
          <div className="reveal reveal-delay-2"><SmallFeature icon={<IconClock size={16} />} title="Pomodoro timer" body="Built in. Starts from any block." /></div>
          <div className="reveal reveal-delay-3"><SmallFeature icon={<IconCheck size={16} />} title="Offline mode" body="Works in lecture halls, too." /></div>
          <div className="reveal reveal-delay-4"><SmallFeature icon={<IconBell size={16} />} title="Smart nudges" body="Only when it actually helps." /></div>
        </div>
      </div>
    </section>

    <HomeCTA setRoute={setRoute} setInApp={setInApp} />
  </div>
);

const FeatureRow = ({ eyebrow, title, body, bullets, demo, reverse }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: 64,
    alignItems: 'center',
    direction: reverse ? 'rtl' : 'ltr'
  }}>
    <div className={reverse ? 'reveal-right' : 'reveal-left'} style={{ direction: 'ltr' }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
      <h3 style={{ fontSize: 32, lineHeight: 1.15, marginBottom: 16 }}>{title}</h3>
      <p style={{ fontSize: 16, marginBottom: 24 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bullets.map((b, i) => <BulletLine key={i} text={b} />)}
      </div>
    </div>
    <div className={reverse ? 'reveal-left' : 'reveal-right'} style={{ direction: 'ltr' }}>{demo}</div>
  </div>
);

const SmallFeature = ({ icon, title, body }) => (
  <div style={{
    padding: 20,
    borderRadius: 'var(--r-12)',
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

const SyllabusPreview = () => (
  <div className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
    <div style={{
      background: 'var(--light-gray)',
      borderRadius: 8,
      padding: 16,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      lineHeight: 1.6,
      color: 'var(--fg-muted)',
      minHeight: 280
    }}>
      <div style={{ color: 'var(--fg-deep)', fontWeight: 600, marginBottom: 8 }}>CS 331 — Syllabus.pdf</div>
      Week 1: Intro, big-O<br />
      Week 2: Greedy algorithms<br />
      Week 3: Divide &amp; conquer<br />
      <span style={{ background: 'var(--tag-blue-bg)', color: 'var(--tag-blue)', padding: '1px 4px', borderRadius: 3 }}>Week 4: PSet 1 due Apr 3</span><br />
      Week 5: Dynamic programming<br />
      <span style={{ background: 'var(--tag-amber-bg)', color: 'var(--tag-amber)', padding: '1px 4px', borderRadius: 3 }}>Week 6: Midterm · Apr 17</span><br />
      Week 7: Graph algorithms<br />
      <span style={{ background: 'var(--tag-blue-bg)', color: 'var(--tag-blue)', padding: '1px 4px', borderRadius: 3 }}>Week 8: PSet 4 due Apr 24</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4 }}>Extracted →</div>
      {[
        { c: 'blue', l: 'PSet 1', d: 'Apr 3' },
        { c: 'amber', l: 'Midterm', d: 'Apr 17' },
        { c: 'blue', l: 'PSet 4', d: 'Apr 24' },
        { c: 'blue', l: 'Final Project', d: 'May 15' },
        { c: 'amber', l: 'Final Exam', d: 'May 22' },
      ].map((x, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: 6, boxShadow: 'var(--shadow-ring)', fontSize: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={x.c}>{x.l}</Tag>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{x.d}</span>
        </div>
      ))}
    </div>
  </div>
);

const PaceDemo = () => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16 }}>Your average over the last 4 weeks</div>
    {[
      { code: 'CS 331', color: 'blue',   est: '4h', actual: 5.2 },
      { code: 'MA 241', color: 'green',  est: '2h', actual: 1.6 },
      { code: 'EN 210', color: 'amber',  est: '3h', actual: 4.1 },
      { code: 'PH 220', color: 'violet', est: '3h', actual: 2.8 },
    ].map((r, i) => {
      const pct = Math.min(r.actual / 6 * 100, 100);
      const overEst = r.actual > parseFloat(r.est);
      return (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={r.color}>{r.code}</Tag>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>per assignment</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-deep)' }}>
              {r.actual}h <span style={{ color: 'var(--fg-muted)' }}>/ est. {r.est}</span>
            </span>
          </div>
          <div style={{
            height: 6,
            background: 'var(--light-gray)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${pct}%`,
              height: '100%',
              background: `var(--tag-${r.color})`,
              opacity: 0.8
            }} />
          </div>
        </div>
      );
    })}
    <div style={{ marginTop: 20, padding: 12, background: 'var(--light-gray)', borderRadius: 8, fontSize: 13, color: 'var(--fg-deep)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <IconSparkle size={13} /> <b>Adjustment:</b> CS blocks +30% next week, MA blocks −20%.
      </span>
    </div>
  </div>
);

const ChatDemo = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: 'var(--charcoal)', color: 'var(--white)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <IconSparkle size={13} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Planorah Chat</div>
    </div>
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChatBubble role="user">What should I work on tonight?</ChatBubble>
      <ChatBubble role="ai">
        <div style={{ marginBottom: 8 }}>
          You've got <b>3 hours free after 7pm</b>. Given tomorrow's lab report is due, I'd suggest:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <InlineTask color="violet" code="PH 220" label="Pendulum lab writeup" dur="90m" />
          <InlineTask color="blue" code="CS 331" label="PSet 4 — start Problem 1" dur="60m" />
          <InlineTask color="teal" code="EC 101" label="Finish Mankiw Ch. 8 reading" dur="30m" />
        </div>
      </ChatBubble>
      <ChatBubble role="user">Move the essay to Saturday</ChatBubble>
      <ChatBubble role="ai">
        Done. Moved <b>Essay II draft</b> from Fri 4pm → <b>Sat 10am–1pm</b>. Week still balanced.
      </ChatBubble>
    </div>
  </div>
);

const ChatBubble = ({ role, children }) => (
  <div style={{
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '85%',
    background: role === 'user' ? 'var(--charcoal)' : 'var(--light-gray)',
    color: role === 'user' ? 'var(--white)' : 'var(--fg-deep)',
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.5
  }}>{children}</div>
);

const InlineTask = ({ color, code, label, dur }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 8px', background: 'var(--surface)', borderRadius: 6,
    boxShadow: 'var(--shadow-ring)'
  }}>
    <Tag color={color}>{code}</Tag>
    <span style={{ flex: 1, color: 'var(--fg-deep)', fontSize: 12 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{dur}</span>
  </div>
);

// =========================================================
// PRICING PAGE
// =========================================================
const PricingPage = ({ setRoute, setInApp }) => {
  const [yearly, setYearly] = useState(true);
  return (
    <div className="route-fade">
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontSize: 56, marginBottom: 20 }}>Free for students.<br />Fairer for everyone.</h1>
          <p style={{ fontSize: 18, maxWidth: 560, margin: '0 auto 32px' }}>
            One plan covers 95% of students. Upgrade if you want unlimited AI or calendar sync across devices.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: 4, boxShadow: 'var(--shadow-ring)', borderRadius: 'var(--r-pill)'
          }}>
            <BillingPill active={!yearly} onClick={() => setYearly(false)}>Monthly</BillingPill>
            <BillingPill active={yearly} onClick={() => setYearly(true)}>
              Yearly <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>Save 30%</span>
            </BillingPill>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 24 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            alignItems: 'stretch'
          }}>
            <PriceCard
              name="Free"
              price="$0"
              sub="Forever, for students"
              features={[
                'Up to 4 courses',
                'AI schedule generation (50/mo)',
                'Weekly planner + semester view',
                'Google Calendar one-way sync',
              ]}
              cta="Start free"
              onCta={() => { setInApp(true); setRoute('onboarding'); }}
            />
            <PriceCard
              highlight
              name="Student Pro"
              price={yearly ? '$4' : '$6'}
              priceSuffix={yearly ? '/mo, billed yearly' : '/mo'}
              sub="For full-course-load semesters"
              features={[
                'Unlimited courses',
                'Unlimited AI + context-aware chat',
                'Two-way Google + Outlook sync',
                'Personal pace learning',
                'Offline mode',
                'Priority support',
              ]}
              cta="Start 14-day trial"
              onCta={() => { setInApp(true); setRoute('onboarding'); }}
            />
            <PriceCard
              name="University"
              price="Talk to us"
              sub="Site licenses for schools"
              features={[
                'Everything in Pro',
                'SSO / SAML integration',
                'LMS syllabus import (Canvas, Blackboard)',
                'Aggregate workload analytics for advisors',
                'Dedicated success manager',
              ]}
              cta="Contact sales"
              ctaVariant="ghost"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <h3 style={{ fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Common questions</h3>
          <FAQ items={[
            ['Is Planorah really free for students?',
              'Yes. If you have a .edu email, Free gives you 4 courses and 50 AI schedule generations a month — enough for most semesters. You can upgrade to Pro if you want unlimited.'],
            ['What happens to my syllabi and coursework?',
              "Your uploaded documents are stored encrypted and used only to generate your schedule. They're never used to train AI models. You can delete everything at any time from Settings."],
            ['Can I import from Canvas, Blackboard, or Moodle?',
              'Yes, from Pro. The University plan unlocks bulk import and SSO for the whole institution.'],
            ['Do I need to use the AI features?',
              "No. Planorah works as a conventional planner if you'd rather schedule blocks manually. The AI only runs when you ask it to."],
            ['What if my professor posts a new assignment mid-semester?',
              'Add it from the planner, the chat, or forward the email to your Planorah inbox. The rest of the schedule re-balances automatically.'],
          ]} />
        </div>
      </section>

      <HomeCTA setRoute={setRoute} setInApp={setInApp} />
    </div>
  );
};

const BillingPill = ({ active, onClick, children }) => (
  <div onClick={onClick} style={{
    padding: '8px 16px',
    borderRadius: 'var(--r-pill)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: active ? 'var(--charcoal)' : 'transparent',
    color: active ? 'var(--white)' : 'var(--fg-deep)',
    transition: 'all 0.15s ease'
  }}>{children}</div>
);

const PriceCard = ({ name, price, priceSuffix, sub, features, cta, ctaVariant, highlight, onCta }) => (
  <div className="card" style={{
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    ...(highlight ? {
      background: 'var(--charcoal)',
      color: 'var(--white)',
      boxShadow: 'rgba(19,19,22,0.3) 0 10px 30px -10px, rgba(34,42,53,0.15) 0 0 0 1px'
    } : {})
  }}>
    {highlight && (
      <div style={{
        position: 'absolute', top: 16, right: 16,
        fontSize: 11, fontWeight: 600,
        background: 'rgba(255,255,255,0.12)',
        color: 'var(--white)',
        padding: '4px 8px', borderRadius: 'var(--r-pill)',
        letterSpacing: 0.4, textTransform: 'uppercase'
      }}>Most popular</div>
    )}
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: 20, fontWeight: 600,
      color: highlight ? 'var(--white)' : 'var(--fg)',
      marginBottom: 8,
      letterSpacing: 0.2
    }}>{name}</div>
    <div style={{
      fontSize: 14,
      color: highlight ? 'rgba(255,255,255,0.6)' : 'var(--fg-muted)',
      marginBottom: 20
    }}>{sub}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 48, fontWeight: 600,
        color: highlight ? 'var(--white)' : 'var(--fg)'
      }}>{price}</span>
      {priceSuffix && (
        <span style={{ fontSize: 13, color: highlight ? 'rgba(255,255,255,0.6)' : 'var(--fg-muted)' }}>{priceSuffix}</span>
      )}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
      {features.map((f, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13,
          color: highlight ? 'rgba(255,255,255,0.85)' : 'var(--fg-deep)'
        }}>
          <IconCheck size={14} stroke={2.2} /> {f}
        </div>
      ))}
    </div>
    <Button
      variant={ctaVariant || (highlight ? 'ghost' : 'primary')}
      onClick={onCta}
      style={highlight ? { background: 'var(--white)', color: 'var(--charcoal)' } : {}}>
      {cta} <IconArrowRight size={14} />
    </Button>
  </div>
);

const FAQ = ({ items }) => {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(([q, a], i) => (
        <div key={i} style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '20px 0'
        }}>
          <div onClick={() => setOpen(open === i ? -1 : i)} style={{
            display: 'flex', justifyContent: 'space-between', cursor: 'pointer'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, letterSpacing: 0.2 }}>{q}</div>
            <div style={{ fontSize: 20, color: 'var(--fg-muted)', transform: open === i ? 'rotate(45deg)' : '', transition: 'transform 0.2s ease' }}>+</div>
          </div>
          {open === i && (
            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, maxWidth: 700 }}>{a}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const HomeCTA = ({ setRoute, setInApp }) => (
  <section style={{ padding: '24px 0 96px' }}>
    <div className="container-narrow">
      <div style={{
        background: 'var(--charcoal)', color: 'var(--white)',
        borderRadius: 'var(--r-16)', padding: '56px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, lineHeight: 1.15, marginBottom: 8 }}>
            Start your semester, not your stress.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Free forever for up to 4 courses. No card.
          </div>
        </div>
        <Button variant="ghost" size="lg"
                onClick={() => { setInApp(true); setRoute('onboarding'); }}
                style={{ background: 'var(--white)', color: 'var(--charcoal)' }}>
          Try Planorah <IconArrowRight size={14} />
        </Button>
      </div>
    </div>
  </section>
);

Object.assign(window, { HomePage, FeaturesPage, PricingPage });
