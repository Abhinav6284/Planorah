// Shared UI atoms, icons, sample data
// Attaches everything to window for cross-file access.

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// =========================================================
// ICONS — minimal line icons, 1.5 stroke
// =========================================================
const Icon = ({ d, size = 16, stroke = 1.5, fill = 'none', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

const IconSparkle = (p) => <Icon {...p} d={
  <>
    <path d="M12 3l1.8 4.8L18.6 9.6l-4.8 1.8L12 16.2l-1.8-4.8L5.4 9.6l4.8-1.8z" />
    <path d="M19 15l.7 1.9L21.6 17.6l-1.9.7L19 20.2l-.7-1.9L16.4 17.6l1.9-.7z" />
  </>
}/>;
const IconCalendar = (p) => <Icon {...p} d={
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </>
}/>;
const IconList = (p) => <Icon {...p} d={
  <>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </>
}/>;
const IconHome = (p) => <Icon {...p} d={
  <>
    <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" />
  </>
}/>;
const IconChat = (p) => <Icon {...p} d={
  <>
    <path d="M4 5h16v11H8l-4 4z" />
  </>
}/>;
const IconBook = (p) => <Icon {...p} d={
  <>
    <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
    <path d="M4 4v12a4 4 0 0 0 4 4" />
  </>
}/>;
const IconCheck = (p) => <Icon {...p} d={<path d="M5 12l4 4L19 7" />}/>;
const IconArrowRight = (p) => <Icon {...p} d={<path d="M5 12h14M13 5l7 7-7 7" />}/>;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}/>;
const IconPlus = (p) => <Icon {...p} d={<path d="M12 5v14M5 12h14" />}/>;
const IconSettings = (p) => <Icon {...p} d={
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.6l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>
}/>;
const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>}/>;
const IconBell = (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></>}/>;
const IconMoon = (p) => <Icon {...p} d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}/>;
const IconSun = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}/>;
const IconSend = (p) => <Icon {...p} d={<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />}/>;
const IconMore = (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>}/>;
const IconFlame = (p) => <Icon {...p} d={<path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 2-3 2-5 0 0 2 1 2-3z M7 16a5 5 0 0 0 10 0c0 3-2 5-5 5s-5-2-5-5z" />}/>;
const IconTrend = (p) => <Icon {...p} d={<path d="M3 17l6-6 4 4 8-8M14 7h7v7" />}/>;
const IconZap = (p) => <Icon {...p} d={<path d="M13 2L3 14h7l-1 8 10-12h-7z" />}/>;
const IconShield = (p) => <Icon {...p} d={<path d="M12 2l8 3v7c0 5-3 8-8 10-5-2-8-5-8-10V5z" />}/>;
const IconBookmark = (p) => <Icon {...p} d={<path d="M6 3h12v18l-6-4-6 4z" />}/>;

// =========================================================
// LOGO
// =========================================================
const Logo = ({ onClick }) => (
  <div className="logo" onClick={onClick}>
    <span className="logo-mark">P</span>
    <span>Planorah</span>
  </div>
);

// =========================================================
// SAMPLE DATA — realistic course/assignment fabric
// =========================================================
const COURSES = [
  { id: 'cs331', code: 'CS 331', title: 'Algorithms',            color: 'blue',   credits: 4, prof: 'Dr. Li',       load: 'heavy'  },
  { id: 'ma241', code: 'MA 241', title: 'Linear Algebra',        color: 'green',  credits: 3, prof: 'Prof. Iqbal',  load: 'medium' },
  { id: 'en210', code: 'EN 210', title: 'Rhetoric & Composition',color: 'amber',  credits: 3, prof: 'Dr. Montero',  load: 'light'  },
  { id: 'ph220', code: 'PH 220', title: 'Classical Mechanics',   color: 'violet', credits: 4, prof: 'Dr. Okafor',   load: 'heavy'  },
  { id: 'ec101', code: 'EC 101', title: 'Intro Microeconomics',  color: 'teal',   credits: 3, prof: 'Prof. Chen',   load: 'medium' },
  { id: 'ps120', code: 'PS 120', title: 'Political Theory',      color: 'rose',   credits: 3, prof: 'Dr. Novak',    load: 'light'  },
];

const ASSIGNMENTS = [
  { id: 'a1', course: 'cs331', title: 'Problem Set 4 — Dynamic Programming', due: 'Thu Apr 24', dueIn: 'in 2 days',  est: '4h',   status: 'in-progress', priority: 'high'   },
  { id: 'a2', course: 'ma241', title: 'Eigenvector Proof Writeup',           due: 'Fri Apr 25', dueIn: 'in 3 days',  est: '2h',   status: 'not-started', priority: 'medium' },
  { id: 'a3', course: 'en210', title: 'Essay II — Argument Draft',           due: 'Mon Apr 28', dueIn: 'in 6 days',  est: '5h',   status: 'not-started', priority: 'high'   },
  { id: 'a4', course: 'ph220', title: 'Lab Report: Pendulum',                due: 'Wed Apr 23', dueIn: 'tomorrow',   est: '3h',   status: 'in-progress', priority: 'high'   },
  { id: 'a5', course: 'ec101', title: 'Reading: Mankiw Ch. 8–9',             due: 'Tue Apr 22', dueIn: 'today',      est: '1.5h', status: 'in-progress', priority: 'medium' },
  { id: 'a6', course: 'ps120', title: 'Reading Response — Rawls',            due: 'Wed Apr 30', dueIn: 'in 8 days',  est: '2h',   status: 'not-started', priority: 'low'    },
  { id: 'a7', course: 'cs331', title: 'Midterm Exam',                         due: 'Tue May 6',  dueIn: 'in 14 days', est: '—',    status: 'exam',        priority: 'high'   },
];

// =========================================================
// SMALL ATOMS
// =========================================================
const Tag = ({ color, children, dot = true }) => (
  <span className={`tag tag-${color || ''}`}>
    {dot && <span className="tag-dot" />}
    {children}
  </span>
);

const Button = ({ variant = 'primary', size, children, onClick, style, type, ...rest }) => {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}${size === 'lg' ? ' btn-lg' : ''}`;
  return <button type={type || 'button'} className={cls} onClick={onClick} style={style} {...rest}>{children}</button>;
};

const Pill = ({ children, style }) => (
  <span className="tag" style={{
    background: 'var(--light-gray)',
    color: 'var(--fg-deep)',
    boxShadow: 'var(--shadow-ring)',
    ...style
  }}>{children}</span>
);

// =========================================================
// NAV BAR
// =========================================================
const MARKETING_ROUTES = [
  { id: 'home',     label: 'Home'     },
  { id: 'features', label: 'Features' },
  { id: 'pricing',  label: 'Pricing'  },
];

const TopNav = ({ route, setRoute, inApp, setInApp }) => {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Logo onClick={() => { setRoute('home'); setInApp(false); }} />
        {!inApp ? (
          <div className="nav-links">
            {MARKETING_ROUTES.map(r => (
              <div key={r.id}
                   className="nav-link"
                   data-active={route === r.id}
                   onClick={() => setRoute(r.id)}>
                {r.label}
              </div>
            ))}
            <div style={{ width: 8 }} />
            <Button variant="plain" size="sm" onClick={() => setRoute('login')}>Log in</Button>
            <Button variant="primary" size="sm" onClick={() => setRoute('register')}>
              Get started <IconArrowRight size={14} />
            </Button>
          </div>
        ) : (
          <AppNav route={route} setRoute={setRoute} setInApp={setInApp} />
        )}
      </div>
    </nav>
  );
};

const APP_NAV = [
  { id: 'dashboard', label: 'Today',    icon: IconHome     },
  { id: 'planner',   label: 'Week',     icon: IconList     },
  { id: 'semester',  label: 'Semester', icon: IconCalendar },
  { id: 'courses',   label: 'Courses',  icon: IconBook     },
  { id: 'chat',      label: 'Ask AI',   icon: IconSparkle  },
];

const AppNav = ({ route, setRoute, setInApp }) => (
  <>
    <div className="nav-links" style={{ marginLeft: 24 }}>
      {APP_NAV.map(r => {
        const I = r.icon;
        return (
          <div key={r.id}
               className="nav-link"
               data-active={route === r.id}
               onClick={() => setRoute(r.id)}
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <I size={14} /> {r.label}
          </div>
        );
      })}
    </div>
    <div className="nav-links">
      <div className="nav-link" title="Notifications" style={{ padding: 8 }}><IconBell size={16} /></div>
      <div className="nav-link" title="Settings" style={{ padding: 8 }}><IconSettings size={16} /></div>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'var(--charcoal)', color: 'var(--white)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, marginLeft: 6, cursor: 'pointer'
      }} onClick={() => setInApp(false)} title="Back to marketing">AR</div>
    </div>
  </>
);

// =========================================================
// PLACEHOLDER — striped SVG for imagery slots
// =========================================================
const Placeholder = ({ label, height = 360, style }) => (
  <div style={{
    width: '100%',
    height,
    borderRadius: 'var(--r-12)',
    background: `repeating-linear-gradient(135deg,
      var(--light-gray) 0 10px,
      color-mix(in oklab, var(--light-gray) 70%, var(--bg)) 10px 20px)`,
    boxShadow: 'var(--shadow-ring)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--fg-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: 0.2,
    ...style
  }}>{label}</div>
);

// =========================================================
// FOOTER
// =========================================================
const Footer = ({ setRoute }) => (
  <footer style={{
    padding: '64px 0 48px',
    borderTop: '1px solid var(--border-subtle)',
    marginTop: 48
  }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 32 }}>
        <div>
          <Logo />
          <p style={{ marginTop: 16, fontSize: 14, maxWidth: 260 }}>
            AI academic planning for students who take their time seriously.
          </p>
        </div>
        <FooterCol title="Product" items={[
          ['Features', () => setRoute('features')],
          ['Pricing', () => setRoute('pricing')],
          ['Changelog'],
          ['Roadmap'],
        ]} />
        <FooterCol title="Resources" items={[
          ['Help center'],
          ['Study guide'],
          ['Student blog'],
          ['Templates'],
        ]} />
        <FooterCol title="Company" items={[
          ['About'],
          ['Careers'],
          ['Privacy'],
          ['Terms'],
        ]} />
      </div>
      <div style={{
        marginTop: 48,
        paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        color: 'var(--fg-muted)'
      }}>
        <span>© 2026 Planorah, Inc.</span>
        <span>Made for students, in the library, at 2am.</span>
      </div>
    </div>
  </footer>
);

const FooterCol = ({ title, items }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 14 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(([label, onClick], i) => (
        <div key={i}
             onClick={onClick}
             style={{
               fontSize: 14,
               color: 'var(--fg-deep)',
               cursor: onClick ? 'pointer' : 'default'
             }}>{label}</div>
      ))}
    </div>
  </div>
);

// Export all to window
Object.assign(window, {
  React, useState, useEffect, useMemo, useRef, useCallback,
  Icon, IconSparkle, IconCalendar, IconList, IconHome, IconChat, IconBook,
  IconCheck, IconArrowRight, IconClock, IconPlus, IconSettings, IconSearch,
  IconBell, IconMoon, IconSun, IconSend, IconMore, IconFlame, IconTrend, IconZap,
  IconShield, IconBookmark,
  Logo, Tag, Pill, Button, Placeholder, TopNav, Footer,
  COURSES, ASSIGNMENTS, APP_NAV,
});
