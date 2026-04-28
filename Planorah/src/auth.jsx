// =========================================================
// AUTH — Login + Register (split layout, Cal.com-inspired)
// =========================================================

const AuthShell = ({ mode, setRoute, setInApp }) => {
  return (
    <div className="route-fade" style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg)'
    }}>
      <AuthBrandPanel mode={mode} />
      <AuthFormPanel mode={mode} setRoute={setRoute} setInApp={setInApp} />
    </div>
  );
};

// -------- Brand / marketing side --------
const AuthBrandPanel = ({ mode }) => {
  return (
    <div style={{
      position: 'relative',
      background: 'var(--charcoal)',
      color: 'var(--white)',
      padding: '40px 56px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      {/* subtle grid backdrop */}
      <svg width="100%" height="100%" style={{
        position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none'
      }}>
        <defs>
          <pattern id="authGrid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authGrid)"/>
      </svg>

      {/* Top: logo + back */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
             onClick={() => { window.location.hash = ''; }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--white)', color: 'var(--charcoal)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16
          }}>P</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>Planorah</span>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); window.__authSetRoute && window.__authSetRoute('home'); }}
           style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Back to site
        </a>
      </div>

      {/* Middle: big headline + feature bullets */}
      <div style={{ position: 'relative', maxWidth: 440 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 20
        }}>
          {mode === 'login' ? 'Welcome back' : 'Start for free'}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.025em',
          marginBottom: 28
        }}>
          {mode === 'login'
            ? <>Your week,<br/>already planned.</>
            : <>Master your time.<br/>Maximize your learning.</>}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 15, lineHeight: 1.55, marginBottom: 32 }}>
          {mode === 'login'
            ? 'Pick up where you left off — your syllabi, schedule, and AI study assistant are waiting.'
            : 'Join thousands of students who turned a semester of chaos into a calm weekly plan.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(mode === 'login'
            ? [
                'Your plan syncs across every device',
                'Weekly focus score stays up to date',
                'Syllabus edits propagate automatically',
              ]
            : [
                'Free for students — no credit card',
                'Import your syllabi in under a minute',
                'AI study assistant grounded in your plan',
              ]
          ).map(line => (
            <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.88)' }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--white)'
              }}><IconCheck size={12} stroke={2.4} /></span>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: testimonial */}
      <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1.4, marginBottom: 14, maxWidth: 460 }}>
          "I stopped keeping a bullet journal. Planorah does the hard part — deciding what to work on — so I can just work."
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', color: 'var(--white)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600
          }}>MS</div>
          Maya S. · Junior, Comp Sci — UC Berkeley
        </div>
      </div>
    </div>
  );
};

// -------- Form side --------
const AuthFormPanel = ({ mode, setRoute, setInApp }) => {
  // expose setRoute for back-button in brand panel (lives in sibling component)
  useEffect(() => { window.__authSetRoute = setRoute; return () => { window.__authSetRoute = null; }; }, [setRoute]);

  const isLogin = mode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) { setErr('Please fill in all required fields.'); return; }
    if (!isLogin && !name) { setErr('Please enter your name.'); return; }
    if (!isLogin && !agree) { setErr('Please agree to the terms to continue.'); return; }
    // Simulated auth: bounce into the app
    setInApp(true);
    setRoute(isLogin ? 'dashboard' : 'onboarding');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
      background: 'var(--bg)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header + cross-link */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 40
        }}>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); setRoute(isLogin ? 'register' : 'login'); }}
             style={{ fontSize: 13, color: 'var(--fg-deep)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--fg-deep)' }}>
            {isLogin ? 'Create one →' : 'Sign in →'}
          </a>
        </div>

        <h2 style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.02em' }}>
          {isLogin ? 'Sign in to Planorah' : 'Create your account'}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--fg-muted)', marginBottom: 32 }}>
          {isLogin
            ? 'Welcome back. Let\u2019s get your week moving.'
            : 'Takes less than a minute. Free while you\u2019re a student.'}
        </p>

        {/* SSO buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <SSOButton provider="google" label={isLogin ? 'Continue with Google' : 'Sign up with Google'} />
          <SSOButton provider="microsoft" label={isLogin ? 'Continue with Microsoft' : 'Sign up with Microsoft'} />
          <SSOButton provider="apple" label={isLogin ? 'Continue with Apple' : 'Sign up with Apple'} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--fg-muted)', fontSize: 12, marginBottom: 22
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            or with email
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <Field
              label="Full name"
              input={
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Alex Rivera"
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              }
            />
          )}
          <Field
            label={isLogin ? 'Email' : 'School email'}
            hint={!isLogin ? '.edu emails unlock the free student plan automatically' : null}
            input={
              <input
                className="auth-input"
                type="email"
                placeholder={isLogin ? 'you@school.edu' : 'you@school.edu'}
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            }
          />
          <Field
            label="Password"
            rightLink={isLogin ? { label: 'Forgot password?', onClick: () => {} } : null}
            input={
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder={isLogin ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' : 'At least 8 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 60 }}
                />
                <button type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 0, cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, color: 'var(--fg-muted)',
                    padding: '4px 8px', borderRadius: 4
                  }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            }
          />

          {!isLogin && <PwStrength value={password} />}

          {/* Row: remember / terms */}
          {isLogin ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-deep)', cursor: 'pointer', userSelect: 'none' }}>
              <CheckBox checked={remember} onChange={setRemember} />
              Keep me signed in on this device
            </label>
          ) : (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fg-deep)', cursor: 'pointer', userSelect: 'none', lineHeight: 1.5 }}>
              <div style={{ paddingTop: 2 }}><CheckBox checked={agree} onChange={setAgree} /></div>
              <span>
                I agree to the <a href="#" style={{ color: 'var(--fg-deep)', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}>Terms</a> and <a href="#" style={{ color: 'var(--fg-deep)', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}>Privacy Policy</a>.
              </span>
            </label>
          )}

          {err && (
            <div style={{
              padding: '10px 12px',
              background: 'color-mix(in oklab, var(--accent-peach-bg) 70%, transparent)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8, fontSize: 13, color: 'var(--fg-deep)'
            }}>{err}</div>
          )}

          <Button variant="primary" size="lg" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {isLogin ? 'Sign in' : 'Create account'} <IconArrowRight size={14} />
          </Button>
        </form>

        <div style={{ marginTop: 32, fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>
          Protected by industry-standard encryption. Your syllabi never train third-party models.
        </div>
      </div>
    </div>
  );
};

// -------- Small pieces --------
const Field = ({ label, hint, rightLink, input }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-deep)' }}>{label}</label>
      {rightLink && (
        <a href="#" onClick={(e) => { e.preventDefault(); rightLink.onClick(); }}
           style={{ fontSize: 12, color: 'var(--fg-muted)', textDecoration: 'none' }}>
          {rightLink.label}
        </a>
      )}
    </div>
    {input}
    {hint && <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>{hint}</div>}
  </div>
);

const CheckBox = ({ checked, onChange }) => (
  <div onClick={() => onChange(!checked)} style={{
    width: 16, height: 16, borderRadius: 4,
    boxShadow: 'var(--shadow-ring)',
    background: checked ? 'var(--charcoal)' : 'transparent',
    color: 'var(--white)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  }}>
    {checked && <IconCheck size={11} stroke={2.8} />}
  </div>
);

const PwStrength = ({ value }) => {
  // very simple strength scoring: length + variety
  const score = (() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  })();
  const label = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'][score] || '';
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? 'var(--charcoal)' : 'var(--light-gray)',
            transition: 'background 0.25s ease'
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
        {value ? label : '8+ characters recommended, with a number or symbol.'}
      </div>
    </div>
  );
};

const SSOButton = ({ provider, label }) => {
  const icons = {
    google: (
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
    microsoft: (
      <svg width="14" height="14" viewBox="0 0 24 24">
        <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
        <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
        <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
        <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
      </svg>
    ),
    apple: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 12.5c0-3 2.5-4.5 2.6-4.6-1.4-2-3.6-2.3-4.4-2.3-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-3.9-1-2 0-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.2 3.1 3.7 3 1.5-.1 2.1-1 3.9-1s2.4 1 3.9 1c1.6 0 2.6-1.5 3.6-3 1.1-1.7 1.6-3.4 1.6-3.5-.1 0-3.1-1.2-3.1-4.6zm-3-8.5c.8-1 1.4-2.4 1.2-3.8-1.2 0-2.6.8-3.4 1.8-.8.9-1.5 2.3-1.3 3.7 1.3.1 2.6-.7 3.5-1.7z"/>
      </svg>
    ),
  };
  return (
    <button type="button" className="sso-btn">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        {icons[provider]}
        {label}
      </span>
    </button>
  );
};

// -------- Route wrappers --------
const LoginPage = ({ setRoute, setInApp }) => (
  <AuthShell mode="login" setRoute={setRoute} setInApp={setInApp} />
);
const RegisterPage = ({ setRoute, setInApp }) => (
  <AuthShell mode="register" setRoute={setRoute} setInApp={setInApp} />
);

Object.assign(window, { LoginPage, RegisterPage, AuthShell });
