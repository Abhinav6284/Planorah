// App surfaces: Onboarding, Dashboard, Weekly Planner, Semester, Courses, Chat, AssignmentDetail

// =========================================================
// ONBOARDING — 4 steps: welcome → courses → hours → generating
// =========================================================
const OnboardingPage = ({ setRoute }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(['cs331', 'ma241', 'en210', 'ph220']);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [genProgress, setGenProgress] = useState(0);

  useEffect(() => {
    if (step === 4) {
      const int = setInterval(() => {
        setGenProgress(p => {
          if (p >= 100) { clearInterval(int); setTimeout(() => setRoute('dashboard'), 500); return 100; }
          return p + 4;
        });
      }, 80);
      return () => clearInterval(int);
    }
  }, [step]);

  const toggleCourse = (id) => setSelectedCourses(s =>
    s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, justifyContent: 'center' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 6, height: 6, borderRadius: 3,
              background: i <= step ? 'var(--charcoal)' : 'var(--light-gray)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        {step === 0 && (
          <div className="route-fade" style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'var(--charcoal)', color: 'var(--white)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
            }}><IconSparkle size={24} /></div>
            <h2 style={{ fontSize: 40, marginBottom: 16 }}>Let's plan your semester.</h2>
            <p style={{ fontSize: 16, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              A few quick questions. Planorah builds the rest.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
              <input className="input" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
              <input className="input" placeholder="Your school" value={school} onChange={e => setSchool(e.target.value)} />
            </div>
            <div style={{ marginTop: 28 }}>
              <Button variant="primary" size="lg" onClick={() => setStep(1)}>
                Continue <IconArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="route-fade">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 36, marginBottom: 12 }}>Which courses?</h2>
              <p style={{ fontSize: 15 }}>We'll pre-load their syllabi. You can add more later.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COURSES.map(c => {
                const on = selectedCourses.includes(c.id);
                return (
                  <div key={c.id} onClick={() => toggleCourse(c.id)} style={{
                    padding: '14px 18px',
                    borderRadius: 10,
                    boxShadow: on ? 'rgba(34,42,53,0.2) 0 0 0 2px' : 'var(--shadow-ring)',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', transition: 'box-shadow 0.15s ease',
                    background: on ? 'var(--light-gray)' : 'var(--surface)'
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: on ? 'var(--charcoal)' : 'transparent',
                      boxShadow: on ? 'none' : 'var(--shadow-ring)',
                      color: 'var(--white)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}>{on && <IconCheck size={11} stroke={2.6} />}</div>
                    <Tag color={c.color}>{c.code}</Tag>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--fg-deep)' }}>{c.title}</div>
                    <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{c.credits} cr · {c.prof}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="plain" onClick={() => setStep(0)}>Back</Button>
              <Button variant="primary" onClick={() => setStep(2)} disabled={selectedCourses.length === 0}>
                Continue <IconArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="route-fade">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 36, marginBottom: 12 }}>Your focus hours.</h2>
              <p style={{ fontSize: 15 }}>How many hours can you study per day? Planorah plans around this.</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 600, color: 'var(--fg)' }}>
                  {hoursPerDay}
                  <span style={{ fontSize: 16, color: 'var(--fg-muted)', marginLeft: 4 }}>hours / weekday</span>
                </div>
              </div>
              <input type="range" min={1} max={10} value={hoursPerDay} onChange={e => setHoursPerDay(+e.target.value)}
                     style={{ width: '100%', accentColor: 'var(--charcoal)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                <span>light</span><span>balanced</span><span>heavy</span>
              </div>
              <div style={{ marginTop: 20, padding: 14, background: 'var(--light-gray)', borderRadius: 8, fontSize: 13, color: 'var(--fg-deep)' }}>
                <IconSparkle size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                We'll leave weekends lighter by default. You can adjust in Settings.
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="plain" onClick={() => setStep(1)}>Back</Button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Continue <IconArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="route-fade">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 36, marginBottom: 12 }}>Import a syllabus</h2>
              <p style={{ fontSize: 15 }}>Drop a PDF, link, or paste text. We'll pull the deadlines.</p>
            </div>
            <div style={{
              border: '1.5px dashed var(--border-hairline)',
              borderRadius: 'var(--r-12)',
              padding: '48px 24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--light-gray)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}><IconBookmark size={18} /></div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-deep)', marginBottom: 4 }}>
                Drop your syllabus here
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>PDF, DOCX, TXT · up to 10MB</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--fg-muted)' }}>
              or <span className="link-blue" style={{ cursor: 'pointer' }}>paste text</span> · <span className="link-blue" style={{ cursor: 'pointer' }}>connect Canvas</span>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="plain" onClick={() => setStep(2)}>Back</Button>
              <Button variant="primary" onClick={() => setStep(4)}>Skip for now · Generate plan</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="route-fade" style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: 'var(--charcoal)', color: 'var(--white)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              animation: 'pulse 1.6s ease-in-out infinite'
            }}><IconSparkle size={26} /></div>
            <h2 style={{ fontSize: 32, marginBottom: 12 }}>Building your plan</h2>
            <p style={{ fontSize: 15, marginBottom: 32 }}>
              Reading {selectedCourses.length} syllabi · Finding deadlines · Balancing workload
            </p>
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <div style={{ height: 4, background: 'var(--light-gray)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${genProgress}%`, height: '100%', background: 'var(--charcoal)', transition: 'width 0.1s linear' }} />
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                {genProgress < 40 && 'Parsing syllabi…'}
                {genProgress >= 40 && genProgress < 75 && 'Extracting 14 deadlines…'}
                {genProgress >= 75 && genProgress < 100 && 'Generating week-by-week plan…'}
                {genProgress >= 100 && 'Ready.'}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// =========================================================
// DASHBOARD — Today view
// =========================================================
const DashboardPage = ({ setRoute, setAssignment }) => {
  const todayTasks = [
    { id: 'd1', time: '9:30',  dur: '50m',  course: 'cs331', label: 'Lecture — Dynamic Programming', type: 'class' },
    { id: 'd2', time: '11:00', dur: '1h 30m', course: 'ph220', label: 'Lab report writeup', type: 'work', aId: 'a4' },
    { id: 'd3', time: '1:00',  dur: '1h',   course: null,    label: 'Lunch · Protected break', type: 'break' },
    { id: 'd4', time: '2:00',  dur: '45m',  course: 'ec101', label: 'Reading — Mankiw Ch. 8', type: 'work', aId: 'a5' },
    { id: 'd5', time: '3:00',  dur: '45m',  course: 'cs331', label: 'Discussion section',       type: 'class' },
    { id: 'd6', time: '4:30',  dur: '2h',   course: 'cs331', label: 'PSet 4 — Dynamic Programming', type: 'work', aId: 'a1' },
    { id: 'd7', time: '7:30',  dur: '1h',   course: 'en210', label: 'Essay II — outline',       type: 'work', aId: 'a3' },
  ];
  const [done, setDone] = useState([]);
  const toggle = (id) => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  return (
    <div className="route-fade" style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 32 }}>
        {/* MAIN */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 4 }}>Tuesday · April 22</div>
              <h2 style={{ fontSize: 36 }}>Good morning, Aria.</h2>
            </div>
            <Button variant="ghost" size="sm"><IconPlus size={14} /> Add block</Button>
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            <StatTile label="Planned" value="6h 30m" hint="today" />
            <StatTile label="Done" value={`${done.length}/${todayTasks.length}`} hint="tasks" />
            <StatTile label="Due this week" value="5" hint="assignments" />
            <StatTile label="Streak" value="12 days" hint="keep going" icon={<IconFlame size={14} />} />
          </div>

          {/* Timeline */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: 15, letterSpacing: 0 }}>Today</h4>
              <div style={{ display: 'flex', gap: 6 }}>
                <Pill>Auto-planned</Pill>
                <Button variant="plain" size="sm" onClick={() => setRoute('planner')}>Week view <IconArrowRight size={12} /></Button>
              </div>
            </div>
            <div style={{ padding: 8 }}>
              {todayTasks.map(t => {
                const course = t.course ? COURSES.find(c => c.id === t.course) : null;
                const isDone = done.includes(t.id);
                const isBreak = t.type === 'break';
                const isClass = t.type === 'class';
                return (
                  <div key={t.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 20px 1fr auto',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    borderRadius: 8,
                    cursor: t.aId ? 'pointer' : 'default',
                    transition: 'background 0.15s ease'
                  }}
                  onClick={() => t.aId && setAssignment(t.aId) && setRoute('assignment')}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--light-gray)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{t.time}</div>
                    <div onClick={e => { e.stopPropagation(); toggle(t.id); }} style={{
                      width: 18, height: 18, borderRadius: 5,
                      boxShadow: 'var(--shadow-ring)',
                      background: isDone ? 'var(--charcoal)' : (isBreak ? 'var(--light-gray)' : 'transparent'),
                      color: 'var(--white)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      {isDone && <IconCheck size={12} stroke={2.6} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: 'var(--fg)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.5 : 1
                      }}>{t.label}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                        {course && <Tag color={course.color}>{course.code}</Tag>}
                        {isClass && <Pill style={{ fontSize: 11 }}>Class</Pill>}
                        {isBreak && <Pill style={{ fontSize: 11 }}>Break</Pill>}
                        <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{t.dur}</span>
                      </div>
                    </div>
                    <IconMore size={14} style={{ color: 'var(--fg-muted)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upcoming deadlines */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 15 }}>Upcoming</h4>
              <Button variant="plain" size="sm" onClick={() => setRoute('courses')}>All <IconArrowRight size={12} /></Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ASSIGNMENTS.slice(0, 5).map(a => {
                const course = COURSES.find(c => c.id === a.course);
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 8, borderRadius: 6, cursor: 'pointer'
                  }}
                  onClick={() => { setAssignment(a.id); setRoute('assignment'); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--light-gray)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Tag color={course.color}>{course.code}</Tag>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                        {a.dueIn} · {a.est}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI suggestion */}
          <div className="card" style={{ padding: 20, background: 'var(--charcoal)', color: 'var(--white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, opacity: 0.7 }}>
              <IconSparkle size={13} /> PLANORAH SUGGESTS
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.35, fontWeight: 600, marginBottom: 16 }}>
              Your Thursday is packed. Move 1h of PSet 4 to Wednesday evening?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" style={{ background: 'var(--white)', color: 'var(--charcoal)' }}>
                Accept
              </Button>
              <button className="btn btn-sm" style={{
                background: 'transparent', color: 'var(--white)',
                boxShadow: 'rgba(255,255,255,0.15) 0 0 0 1px'
              }}>Dismiss</button>
            </div>
          </div>

          {/* Course load */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 15, marginBottom: 14 }}>This week's load</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COURSES.slice(0, 4).map(c => {
                const hours = { cs331: 8, ma241: 4, en210: 6, ph220: 5 }[c.id];
                return (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag color={c.color}>{c.code}</Tag>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{hours}h</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--light-gray)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${hours * 10}%`, height: '100%', background: `var(--tag-${c.color})`, opacity: 0.8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ label, value, hint, icon }) => (
  <div style={{
    padding: 16,
    borderRadius: 'var(--r-12)',
    boxShadow: 'var(--shadow-ring)'
  }}>
    <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: 0.08 + 'em', marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon} {value}
    </div>
    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{hint}</div>
  </div>
);

// =========================================================
// WEEKLY PLANNER
// =========================================================
const PlannerPage = ({ setRoute, setAssignment }) => {
  const days = [
    { name: 'Mon', date: 'Apr 21' },
    { name: 'Tue', date: 'Apr 22', today: true },
    { name: 'Wed', date: 'Apr 23' },
    { name: 'Thu', date: 'Apr 24' },
    { name: 'Fri', date: 'Apr 25' },
    { name: 'Sat', date: 'Apr 26' },
    { name: 'Sun', date: 'Apr 27' },
  ];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  const blocks = [
    // Monday
    { day: 0, start: 9, dur: 1,   course: 'ma241', label: 'Lecture',             type: 'class' },
    { day: 0, start: 11, dur: 1.5, course: 'cs331', label: 'PSet 4 · start',      type: 'work', aId: 'a1' },
    { day: 0, start: 14, dur: 1,   course: 'en210', label: 'Essay outline',       type: 'work', aId: 'a3' },
    { day: 0, start: 19, dur: 1,   course: 'ec101', label: 'Reading',             type: 'work', aId: 'a5' },

    // Tuesday (today)
    { day: 1, start: 9.5, dur: 0.83, course: 'cs331', label: 'Lecture · DP',       type: 'class' },
    { day: 1, start: 11,  dur: 1.5,  course: 'ph220', label: 'Lab report writeup', type: 'work', aId: 'a4' },
    { day: 1, start: 14,  dur: 0.75, course: 'ec101', label: 'Reading',            type: 'work', aId: 'a5' },
    { day: 1, start: 15,  dur: 0.75, course: 'cs331', label: 'Discussion',         type: 'class' },
    { day: 1, start: 16.5, dur: 2,   course: 'cs331', label: 'PSet 4',             type: 'work', aId: 'a1' },
    { day: 1, start: 19.5, dur: 1,   course: 'en210', label: 'Essay outline',      type: 'work', aId: 'a3' },

    // Wednesday
    { day: 2, start: 10, dur: 1,   course: 'ph220', label: 'Lab',                 type: 'class' },
    { day: 2, start: 13, dur: 2,   course: 'ph220', label: 'Pendulum writeup',    type: 'work', aId: 'a4' },
    { day: 2, start: 17, dur: 1.5, course: 'cs331', label: 'PSet 4 · continue',   type: 'work', aId: 'a1' },

    // Thursday
    { day: 3, start: 9,  dur: 1,   course: 'ma241', label: 'Lecture',             type: 'class' },
    { day: 3, start: 11, dur: 1.5, course: 'ma241', label: 'Proof writeup',       type: 'work', aId: 'a2' },
    { day: 3, start: 14, dur: 2,   course: 'cs331', label: 'PSet 4 · finish',     type: 'work', aId: 'a1' },
    { day: 3, start: 18, dur: 1.5, course: 'en210', label: 'Essay draft',         type: 'work', aId: 'a3' },

    // Friday
    { day: 4, start: 10, dur: 1,   course: 'cs331', label: 'Lecture',             type: 'class' },
    { day: 4, start: 13, dur: 2,   course: 'en210', label: 'Essay revise',        type: 'work', aId: 'a3' },
    { day: 4, start: 16, dur: 1,   course: 'ps120', label: 'Reading response',    type: 'work', aId: 'a6' },

    // Sat
    { day: 5, start: 10, dur: 2,   course: 'cs331', label: 'Midterm prep',        type: 'work', aId: 'a7' },
    { day: 5, start: 14, dur: 1.5, course: 'ph220', label: 'Problem practice',    type: 'work' },

    // Sun
    { day: 6, start: 11, dur: 1.5, course: 'cs331', label: 'Midterm prep',        type: 'work', aId: 'a7' },
    { day: 6, start: 16, dur: 1,   course: 'ec101', label: 'Review',              type: 'work' },
  ];

  const hourHeight = 44;
  const startHour = 8;
  const totalHours = hours.length;

  return (
    <div className="route-fade" style={{ padding: '24px 0 64px' }}>
      <div className="container">
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 28 }}>Week of April 21</h3>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              18h planned · 3h free · 0 conflicts
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm">← Prev</Button>
            <Button variant="ghost" size="sm">Today</Button>
            <Button variant="ghost" size="sm">Next →</Button>
            <div style={{ width: 8 }} />
            <Button variant="ghost" size="sm"><IconSparkle size={13} /> Auto-balance</Button>
            <Button variant="primary" size="sm"><IconPlus size={13} /> Add block</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            {/* Header row */}
            <div />
            {days.map((d, i) => (
              <div key={i} style={{
                padding: '14px 12px',
                borderLeft: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.name}</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18, fontWeight: 600, marginTop: 4,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%',
                  background: d.today ? 'var(--charcoal)' : 'transparent',
                  color: d.today ? 'var(--white)' : 'var(--fg)'
                }}>{d.date.split(' ')[1]}</div>
              </div>
            ))}

            {/* Hours column + day columns */}
            <div style={{ borderRight: '1px solid var(--border-subtle)' }}>
              {hours.map(h => (
                <div key={h} style={{
                  height: hourHeight,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingRight: 8,
                  paddingTop: 4,
                  fontSize: 10, color: 'var(--fg-muted)',
                  fontFamily: 'var(--font-mono)',
                  borderBottom: '1px dashed var(--border-subtle)'
                }}>
                  {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                </div>
              ))}
            </div>

            {days.map((d, col) => (
              <div key={col} style={{
                position: 'relative',
                borderLeft: '1px solid var(--border-subtle)',
                background: d.today ? 'color-mix(in oklab, var(--light-gray) 50%, transparent)' : 'transparent'
              }}>
                {hours.map(h => (
                  <div key={h} style={{
                    height: hourHeight,
                    borderBottom: '1px dashed var(--border-subtle)'
                  }} />
                ))}
                {/* current time line on today */}
                {d.today && (
                  <div style={{
                    position: 'absolute',
                    top: ((11.3 - startHour) * hourHeight),
                    left: 0, right: 0,
                    height: 2,
                    background: 'var(--link-blue)',
                    zIndex: 2
                  }}>
                    <div style={{
                      position: 'absolute', left: -4, top: -3,
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--link-blue)'
                    }} />
                  </div>
                )}
                {blocks.filter(b => b.day === col).map((b, i) => {
                  const course = COURSES.find(c => c.id === b.course);
                  const top = (b.start - startHour) * hourHeight + 2;
                  const height = b.dur * hourHeight - 4;
                  const isClass = b.type === 'class';
                  return (
                    <div key={i}
                         onClick={() => b.aId && setAssignment(b.aId) && setRoute('assignment')}
                         style={{
                           position: 'absolute',
                           top, left: 4, right: 4, height,
                           background: isClass ? 'var(--surface)' : `var(--tag-${course.color}-bg)`,
                           color: `var(--tag-${course.color})`,
                           borderRadius: 6,
                           padding: '4px 8px',
                           fontSize: 11,
                           overflow: 'hidden',
                           cursor: b.aId ? 'pointer' : 'default',
                           boxShadow: isClass ? 'var(--shadow-ring)' : 'none',
                           borderLeft: isClass ? 'none' : `2px solid var(--tag-${course.color})`
                         }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9, opacity: 0.75,
                        marginBottom: 1
                      }}>{course.code}{isClass && ' · CLASS'}</div>
                      <div style={{ color: 'var(--fg-deep)', fontWeight: 500, fontSize: 11, lineHeight: 1.25 }}>
                        {b.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SEMESTER / CALENDAR
// =========================================================
const SemesterPage = ({ setRoute }) => {
  const weeks = 16;
  const milestones = {
    2: [{ course: 'cs331', label: 'PSet 1' }, { course: 'ma241', label: 'Quiz 1' }],
    3: [{ course: 'en210', label: 'Essay I' }],
    5: [{ course: 'cs331', label: 'Midterm', big: true }, { course: 'ph220', label: 'Lab 2' }],
    6: [{ course: 'ec101', label: 'Midterm', big: true }],
    7: [{ course: 'ma241', label: 'PSet 3' }],
    8: [{ course: 'cs331', label: 'PSet 4' }, { course: 'en210', label: 'Essay II' }, { course: 'ph220', label: 'Lab 4' }],
    9: [{ course: 'ps120', label: 'Paper' }],
    11: [{ course: 'ma241', label: 'Midterm', big: true }],
    12: [{ course: 'cs331', label: 'Project' }],
    14: [{ course: 'en210', label: 'Final Essay', big: true }],
    15: [{ course: 'cs331', label: 'Final Project', big: true }],
    16: [
      { course: 'cs331', label: 'Final', big: true },
      { course: 'ma241', label: 'Final', big: true },
      { course: 'ph220', label: 'Final', big: true },
      { course: 'ec101', label: 'Final', big: true },
    ],
  };

  return (
    <div className="route-fade" style={{ padding: '24px 0 64px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 28 }}>Spring 2026 · Semester</h3>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              Week 6 of 16 · 14 deadlines · 4 exams
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm"><IconCalendar size={13} /> Export to Google</Button>
            <Button variant="ghost" size="sm" onClick={() => setRoute('planner')}>Week view <IconArrowRight size={13} /></Button>
          </div>
        </div>

        {/* Timeline view per course */}
        <div className="card" style={{ padding: 24 }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2 }}>
              {[...Array(weeks)].map((_, i) => (
                <div key={i} style={{
                  fontSize: 10,
                  color: i + 1 === 6 ? 'var(--fg)' : 'var(--fg-muted)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  fontWeight: i + 1 === 6 ? 600 : 400
                }}>{i + 1}</div>
              ))}
            </div>
          </div>

          {COURSES.slice(0, 6).map(c => (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16,
              alignItems: 'center', padding: '12px 0',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <Tag color={c.color}>{c.code}</Tag>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2, position: 'relative' }}>
                {[...Array(weeks)].map((_, i) => {
                  const w = i + 1;
                  const ms = milestones[w]?.filter(m => m.course === c.id) || [];
                  const isCurrent = w === 6;
                  const isPast = w < 6;
                  return (
                    <div key={i} style={{
                      height: 40,
                      background: isCurrent
                        ? 'color-mix(in oklab, var(--charcoal) 8%, transparent)'
                        : (isPast ? 'color-mix(in oklab, var(--light-gray) 50%, transparent)' : 'var(--light-gray)'),
                      opacity: isPast ? 0.6 : 1,
                      borderRadius: 3,
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {ms.map((m, j) => (
                        <div key={j} style={{
                          position: 'absolute',
                          inset: 2,
                          background: `var(--tag-${c.color})`,
                          borderRadius: 3,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 600,
                          color: 'var(--white)',
                          letterSpacing: 0.2,
                          padding: '0 2px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          boxShadow: m.big ? '0 0 0 2px color-mix(in oklab, var(--tag-' + c.color + ') 40%, transparent)' : 'none'
                        }}>{m.label}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Workload chart below */}
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontSize: 15 }}>Projected weekly workload</h4>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>hours</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2, height: 120, alignItems: 'end' }}>
            {[...Array(weeks)].map((_, i) => {
              const w = i + 1;
              const heights = [14, 16, 18, 20, 24, 28, 22, 26, 20, 18, 24, 28, 22, 30, 34, 26];
              const h = heights[i];
              const pct = (h / 40) * 100;
              const isCurrent = w === 6;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%',
                      height: `${pct}%`,
                      background: isCurrent ? 'var(--charcoal)' : (h > 28 ? 'var(--tag-rose)' : 'var(--fg-muted)'),
                      opacity: isCurrent ? 1 : (h > 28 ? 0.5 : 0.3),
                      borderRadius: '3px 3px 0 0'
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--fg-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{w}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 11, color: 'var(--fg-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: 'var(--charcoal)', borderRadius: 2 }} /> Current week
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: 'var(--tag-rose)', borderRadius: 2, opacity: 0.5 }} /> Heavy week (&gt;28h)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// COURSES PAGE
// =========================================================
const CoursesPage = ({ setRoute, setAssignment }) => {
  return (
    <div className="route-fade" style={{ padding: '24px 0 64px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 28 }}>Courses</h3>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {COURSES.length} active · {COURSES.reduce((s, c) => s + c.credits, 0)} credits
            </div>
          </div>
          <Button variant="primary" size="sm"><IconPlus size={13} /> Add course</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {COURSES.map(c => {
            const courseAssignments = ASSIGNMENTS.filter(a => a.course === c.id);
            return (
              <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <Tag color={c.color}>{c.code}</Tag>
                        <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{c.credits} credits · {c.prof}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: 0 }}>
                        {c.title}
                      </div>
                    </div>
                    <IconMore size={16} style={{ color: 'var(--fg-muted)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                    <MiniStat label="Pace" value={c.load === 'heavy' ? '+15%' : c.load === 'light' ? '−10%' : 'on pace'} />
                    <MiniStat label="Upcoming" value={`${courseAssignments.length} items`} />
                    <MiniStat label="Completion" value={`${Math.round(Math.random() * 20 + 55)}%`} />
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  {courseAssignments.length === 0 ? (
                    <div style={{ padding: 16, fontSize: 13, color: 'var(--fg-muted)' }}>No upcoming items.</div>
                  ) : (
                    courseAssignments.map(a => (
                      <div key={a.id}
                           onClick={() => { setAssignment(a.id); setRoute('assignment'); }}
                           style={{
                             padding: '10px 12px', borderRadius: 6,
                             cursor: 'pointer',
                             display: 'flex', alignItems: 'center', gap: 10
                           }}
                           onMouseEnter={e => e.currentTarget.style.background = 'var(--light-gray)'}
                           onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: a.priority === 'high' ? 'var(--tag-rose)' : a.priority === 'medium' ? 'var(--tag-amber)' : 'var(--fg-muted)'
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                            {a.due} · {a.est}
                          </div>
                        </div>
                        <IconArrowRight size={12} style={{ color: 'var(--fg-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-deep)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{value}</div>
  </div>
);

// =========================================================
// ASSIGNMENT DETAIL
// =========================================================
const AssignmentDetailPage = ({ assignmentId, setRoute }) => {
  const a = ASSIGNMENTS.find(x => x.id === assignmentId) || ASSIGNMENTS[0];
  const course = COURSES.find(c => c.id === a.course);
  const subtasks = [
    { id: 's1', label: 'Read problem statement', done: true, est: '15m' },
    { id: 's2', label: 'Sketch recursive solution', done: true, est: '30m' },
    { id: 's3', label: 'Solve Problem 1 — LIS', done: false, est: '45m', current: true },
    { id: 's4', label: 'Solve Problem 2 — Knapsack', done: false, est: '1h' },
    { id: 's5', label: 'Solve Problem 3 — Edit Distance', done: false, est: '1h' },
    { id: 's6', label: 'Write-up & submit', done: false, est: '30m' },
  ];
  const blocks = [
    { when: 'Tue Apr 22 · 4:30–6:30 PM', hours: 2, done: false, current: true },
    { when: 'Wed Apr 23 · 5:00–6:30 PM', hours: 1.5, done: false },
    { when: 'Thu Apr 24 · 2:00–4:00 PM', hours: 2, done: false, final: true },
  ];

  return (
    <div className="route-fade" style={{ padding: '24px 0 64px' }}>
      <div className="container">
        <div style={{ marginBottom: 16 }}>
          <Button variant="plain" size="sm" onClick={() => setRoute('dashboard')}>← Back to today</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Tag color={course.color}>{course.code}</Tag>
              <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{course.title}</span>
            </div>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>{a.title}</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg-muted)', marginBottom: 28 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconCalendar size={14} /> Due {a.due}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconClock size={14} /> Est. {a.est}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tag-rose)' }} />
                High priority
              </span>
            </div>

            {/* Progress */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ fontSize: 15 }}>Progress</h4>
                <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                  {subtasks.filter(s => s.done).length} / {subtasks.length} subtasks · 45m / 4h
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--light-gray)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ width: '30%', height: '100%', background: 'var(--charcoal)' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>30%</div>
            </div>

            {/* Subtasks */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: 15 }}>Subtasks</h4>
              </div>
              <div style={{ padding: 8 }}>
                {subtasks.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 6,
                    background: s.current ? 'var(--light-gray)' : 'transparent'
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      boxShadow: 'var(--shadow-ring)',
                      background: s.done ? 'var(--charcoal)' : 'transparent',
                      color: 'var(--white)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {s.done && <IconCheck size={11} stroke={2.6} />}
                    </div>
                    <div style={{ flex: 1, fontSize: 14,
                                  color: s.done ? 'var(--fg-muted)' : 'var(--fg)',
                                  textDecoration: s.done ? 'line-through' : 'none',
                                  fontWeight: s.current ? 500 : 400 }}>
                      {s.label}
                      {s.current && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: 'var(--link-blue)', textTransform: 'uppercase', letterSpacing: 0.1 + 'em' }}>In focus</span>}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{s.est}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="plain" size="sm"><IconPlus size={12} /> Add subtask</Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Scheduled blocks */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 15, marginBottom: 14 }}>Scheduled work blocks</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {blocks.map((b, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 8,
                    boxShadow: b.current ? 'rgba(0,153,255,0.4) 0 0 0 1.5px' : 'var(--shadow-ring)',
                    background: b.current ? 'var(--tag-blue-bg)' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{b.when}</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{b.hours}h</span>
                    </div>
                    {b.current && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--link-blue)', fontWeight: 500 }}>
                        ▸ Next up
                      </div>
                    )}
                    {b.final && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--fg-muted)' }}>
                        Planned submit window
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                <Button variant="plain" size="sm"><IconPlus size={12} /> Add block</Button>
                <Button variant="plain" size="sm"><IconSparkle size={12} /> Re-schedule</Button>
              </div>
            </div>

            {/* AI tips */}
            <div className="card" style={{ padding: 20, background: 'var(--light-gray)' }}>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconSparkle size={13} /> PLANORAH TIP
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, lineHeight: 1.4, fontWeight: 600, marginBottom: 10 }}>
                DP problems take you 25% longer than the class average.
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.5 }}>
                I've padded the blocks so you're not rushed Thursday. Try writing the recurrence before coding — it's your fastest path on this assignment type.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="primary"><IconClock size={13} /> Start focus session</Button>
              <Button variant="ghost">Mark complete</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// CHAT — full-page AI chat
// =========================================================
const ChatPage = ({ setRoute }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: (
      <>
        Hey Aria — I've got your week here. Ask me anything: "what should I do tonight?",
        "move the essay", or "how ready am I for the CS midterm?"
      </>
    ) },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollTo({ top: endRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text) => {
    const q = text || input;
    if (!q.trim()) return;
    setMessages(m => [...m, { role: 'user', content: q }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { role: 'ai', content: aiReplyFor(q) }]);
    }, 900);
  };

  const suggestions = [
    'What should I do tonight?',
    'How ready am I for the CS 331 midterm?',
    'Move Friday\'s essay to Saturday',
    'What\'s my heaviest week?',
  ];

  return (
    <div className="route-fade" style={{ padding: '24px 0 32px' }}>
      <div className="container-narrow" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--charcoal)', color: 'var(--white)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}><IconSparkle size={18} /></div>
          <div>
            <h4 style={{ fontSize: 18 }}>Ask Planorah</h4>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Grounded in your courses, schedule, and pace</div>
          </div>
        </div>

        <div ref={endRef} style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 4px',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          {messages.map((m, i) => (
            <ChatBubbleFull key={i} role={m.role}>{m.content}</ChatBubbleFull>
          ))}
          {isTyping && (
            <ChatBubbleFull role="ai">
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <Dot /><Dot delay=".15s" /><Dot delay=".3s" />
              </span>
            </ChatBubbleFull>
          )}
        </div>

        {messages.length <= 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {suggestions.map(s => (
              <div key={s} onClick={() => send(s)}
                   style={{
                     padding: '8px 12px',
                     borderRadius: 'var(--r-pill)',
                     boxShadow: 'var(--shadow-ring)',
                     fontSize: 12,
                     color: 'var(--fg-deep)',
                     cursor: 'pointer'
                   }}>
                {s}
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: 8,
          borderRadius: 'var(--r-12)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about your plan…"
            style={{
              flex: 1,
              background: 'transparent',
              padding: '10px 12px',
              fontSize: 14
            }} />
          <Button variant="primary" size="sm" onClick={() => send()}>
            <IconSend size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Dot = ({ delay = '0s' }) => (
  <span style={{
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--fg-muted)',
    animation: `bounce 1s infinite`,
    animationDelay: delay,
    display: 'inline-block'
  }}>
    <style>{`@keyframes bounce { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }`}</style>
  </span>
);

const ChatBubbleFull = ({ role, children }) => (
  <div style={{
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '82%',
    background: role === 'user' ? 'var(--charcoal)' : 'var(--light-gray)',
    color: role === 'user' ? 'var(--white)' : 'var(--fg-deep)',
    padding: '12px 16px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.55
  }}>{children}</div>
);

function aiReplyFor(q) {
  const qq = q.toLowerCase();
  if (qq.includes('tonight')) return (
    <>
      You've got <b>3 hours free after 7pm</b>. Given tomorrow's lab is due:
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <InlineTask color="violet" code="PH 220" label="Pendulum lab writeup" dur="90m" />
        <InlineTask color="blue" code="CS 331" label="PSet 4 — Problem 1" dur="60m" />
        <InlineTask color="teal" code="EC 101" label="Mankiw Ch. 8" dur="30m" />
      </div>
    </>
  );
  if (qq.includes('midterm') || qq.includes('cs 331') || qq.includes('cs331')) return (
    <>
      Based on your pace: you've covered <b>4 of 6</b> topics. I'd estimate <b>~8 more hours</b> to feel ready. There's a natural 3h block Saturday morning and 2h Sunday — want me to protect those as review blocks?
    </>
  );
  if (qq.includes('move') || qq.includes('essay')) return (
    <>Done. Moved <b>Essay II draft</b> from Fri 4pm → <b>Sat 10am–1pm</b>. The week is still balanced.</>
  );
  if (qq.includes('heavy') || qq.includes('heaviest')) return (
    <>Your heaviest week is <b>Week 15 (May 4)</b> at 34h projected — the CS final project overlaps with the EN final essay. Want to start the essay a week earlier?</>
  );
  return (
    <>
      Looking at your plan… you're tracking well this week. Anything specific I can help move, plan, or break down?
    </>
  );
}

Object.assign(window, {
  OnboardingPage, DashboardPage, PlannerPage, SemesterPage, CoursesPage,
  AssignmentDetailPage, ChatPage,
});
