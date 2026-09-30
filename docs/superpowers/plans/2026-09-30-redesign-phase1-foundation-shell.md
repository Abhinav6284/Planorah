# Redesign Phase 1 — Foundation + App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Mono + Lime design tokens, the shared UI primitives, the new app shell (sidebar with Today · Path · Mentor · Progress + avatar menu, mobile tab bar) and the new route map with redirects from every old URL.

**Architecture:** New CSS variables (`--p-*`) in `src/styles/tokens.css`, mapped into Tailwind as new color names. Primitives live in `src/components/ui/`, styled only with Tailwind classes. `AppLayout` replaces `Layout.jsx` + `Sidebar.jsx`. New routes point at the existing screen components for now; later phases rebuild those screens. Old tokens/colors stay until spec step 10.

**Tech Stack:** React 18 (CRA / react-scripts 5), Tailwind 3, react-router-dom 7, lucide-react, Jest + @testing-library/react + user-event 13.

**Spec:** `docs/superpowers/specs/2026-09-30-frontend-redesign-design.md` (sections 1–4 are implemented here; sections 5+ are later phases, each with its own plan).

## Global Constraints

- Theme: dark default on `:root`; light overrides under `html.light` (set by existing `src/context/ThemeContext.jsx`).
- New CSS variables are prefixed `--p-`; never edit or delete old `--el-*`/`--bg`/etc. in `index.css` in this phase.
- New Tailwind color names must not collide with existing ones (`warning`, `error`, `success`, `indigo`, `blue`, `charcoal` exist). Use: `canvas, subtle, surface, surface-hover, line, line-strong, fg, muted, faint, accent, accent-fg, accent-text, accent-soft, danger, warn, info`.
- Lime `#BEF264` only for: primary button fill, active nav marker, focus ring, positive chips. Accent used as text must use `text-accent-text`.
- Fonts: `Geist` + `Geist Mono` from Google Fonts. Old font imports stay until step 10.
- No inline `style={{}}` and no hex colors inside `src/components/ui/` or `src/components/shell/`.
- Focus ring on interactive primitives: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`.
- Icons: lucide-react, `size={16} strokeWidth={1.75}`.
- Tests run with: `cd frontend && CI=true npx react-scripts test --watchAll=false <pattern>`.
- Build check: `cd frontend && CI=false npm run build` must print `Compiled successfully.`

## Review Focus

1. Old deep links with params (`/roadmap/42`, `/planora/subject/7/plan`, `/resume/compiled/3`) must land on the new equivalent URL with the same params — tested in Task 5.
2. Avatar menu: Esc and outside click close it and focus returns to the avatar button — tested in Task 3.
3. Logged-in user opening `/` goes to `/today`; logged-out user still sees the landing page — tested in Task 5.
4. Mobile width (<768px): bottom tab bar visible, sidebar hidden, content not covered by the tab bar (`pb-16` on main) — tested in Task 4 (class assertions) + manual check in Task 6.
5. Light theme accent text stays readable (`text-accent-text` = `#4D7C0F`) — manual check in Task 6.

---

### Task 1: Tokens, fonts, Tailwind mapping, stale tests

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Create: `frontend/src/utils/cx.js`
- Modify: `frontend/src/index.js` (import tokens after `index.css`)
- Modify: `frontend/public/index.html:89` (font link)
- Modify: `frontend/tailwind.config.js` (add colors, fontFamily, boxShadow)
- Delete: `frontend/src/components/Assistant/subcomponents/__tests__/` (tests for components deleted in cleanup; they fail on import)
- Test: `frontend/src/utils/cx.test.js`

**Interfaces:**
- Produces: Tailwind classes `bg-canvas bg-subtle bg-surface bg-surface-hover border-line border-line-strong text-fg text-muted text-faint bg-accent text-accent-fg text-accent-text bg-accent-soft text-danger text-warn text-info font-sans font-mono shadow-pop ring-accent`; `cx(...classes) => string`.

- [ ] **Step 1: Delete stale tests and confirm suite is green**

```bash
cd frontend && rm -r src/components/Assistant/subcomponents/__tests__ && rmdir src/components/Assistant/subcomponents 2>/dev/null; CI=true npx react-scripts test --watchAll=false
```
Expected: `Test Suites: 1 passed`.

- [ ] **Step 2: Write failing test for `cx`**

`frontend/src/utils/cx.test.js`:
```js
import { cx } from './cx';

test('joins truthy class names only', () => {
  expect(cx('a', false, null, undefined, '', 'b', 0 && 'c')).toBe('a b');
});
```
Run: `CI=true npx react-scripts test --watchAll=false cx` → FAIL (module not found).

- [ ] **Step 3: Implement `cx`**

`frontend/src/utils/cx.js`:
```js
export const cx = (...classes) => classes.filter(Boolean).join(' ');
```
Run the test → PASS.

- [ ] **Step 4: Create tokens**

`frontend/src/styles/tokens.css`:
```css
:root {
  --p-bg: #000000;
  --p-bg-subtle: #0A0A0A;
  --p-surface: #111111;
  --p-surface-hover: #171717;
  --p-border: #1F1F1F;
  --p-border-strong: #2E2E2E;
  --p-text: #FAFAFA;
  --p-text-muted: #A3A3A3;
  --p-text-faint: #737373;
  --p-accent: #BEF264;
  --p-accent-fg: #000000;
  --p-accent-text: #BEF264;
  --p-accent-soft: rgba(190, 242, 100, 0.12);
  --p-danger: #F87171;
  --p-warning: #FBBF24;
  --p-info: #60A5FA;
  --p-shadow-pop: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px #1F1F1F;
  --p-font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --p-font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  color-scheme: dark;
}

html.light {
  --p-bg: #FFFFFF;
  --p-bg-subtle: #FAFAFA;
  --p-surface: #FFFFFF;
  --p-surface-hover: #F5F5F5;
  --p-border: #E5E5E5;
  --p-border-strong: #D4D4D4;
  --p-text: #0A0A0A;
  --p-text-muted: #525252;
  --p-text-faint: #A3A3A3;
  --p-accent-text: #4D7C0F;
  --p-accent-soft: rgba(77, 124, 15, 0.10);
  --p-danger: #DC2626;
  --p-warning: #B45309;
  --p-info: #2563EB;
  --p-shadow-pop: 0 12px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px #E5E5E5;
  color-scheme: light;
}

body {
  background: var(--p-bg);
  color: var(--p-text);
  font-family: var(--p-font-sans);
  -webkit-font-smoothing: antialiased;
}

.tabular { font-variant-numeric: tabular-nums; }
```

In `frontend/src/index.js`, directly after `import './index.css';` add:
```js
import './styles/tokens.css';
```

- [ ] **Step 5: Load Geist fonts**

In `frontend/public/index.html`, replace line 89 (the Inter/JetBrains link) with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 6: Map tokens into Tailwind**

In `frontend/tailwind.config.js`, inside `theme.extend.colors` add (keep all existing entries):
```js
        // ── Planorah Mono + Lime (redesign) ──
        canvas: 'var(--p-bg)',
        subtle: 'var(--p-bg-subtle)',
        surface: 'var(--p-surface)',
        'surface-hover': 'var(--p-surface-hover)',
        line: 'var(--p-border)',
        'line-strong': 'var(--p-border-strong)',
        fg: 'var(--p-text)',
        muted: 'var(--p-text-muted)',
        faint: 'var(--p-text-faint)',
        accent: 'var(--p-accent)',
        'accent-fg': 'var(--p-accent-fg)',
        'accent-text': 'var(--p-accent-text)',
        'accent-soft': 'var(--p-accent-soft)',
        danger: 'var(--p-danger)',
        warn: 'var(--p-warning)',
        info: 'var(--p-info)',
```
Inside `theme.extend.fontFamily` add:
```js
        sans: ['var(--p-font-sans)'],
        mono: ['var(--p-font-mono)'],
```
Inside `theme.extend.boxShadow` add:
```js
        pop: 'var(--p-shadow-pop)',
```

- [ ] **Step 7: Build + tests**

Run: `CI=false npm run build` → `Compiled successfully.`
Run: `CI=true npx react-scripts test --watchAll=false` → all pass.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/src/styles/tokens.css frontend/src/utils/cx.js frontend/src/utils/cx.test.js frontend/src/index.js frontend/public/index.html frontend/tailwind.config.js frontend/src/components/Assistant
git commit -m "feat(ui): Mono + Lime design tokens, Geist fonts, Tailwind mapping"
```

---

### Task 2: Basic primitives

**Files:**
- Create: `frontend/src/components/ui/Button.jsx`, `Badge.jsx`, `Surface.jsx`, `ListRow.jsx`, `Field.jsx` (Input, Textarea, Select), `Skeleton.jsx` (Skeleton, Spinner), `EmptyState.jsx`, `PageHeader.jsx`, `index.js`
- Test: `frontend/src/components/ui/__tests__/basic.test.jsx`

**Interfaces:**
- Consumes: `cx` from `src/utils/cx.js`.
- Produces (all named exports from `src/components/ui/index.js`):
  - `Button({ variant='primary'|'secondary'|'ghost'|'danger', size='md'|'sm', loading=false, to, icon: Icon, className, children, ...props })` — renders `<Link>` when `to` is set, else `<button type="button">`.
  - `Badge({ tone='neutral'|'accent'|'danger'|'warn'|'info', children })`
  - `Surface({ title, action, className, children })`
  - `ListRow({ leading, title, meta, trailing, onClick, to, className })`
  - `Input({ label, hint, error, id, className, ...props })`, `Textarea(same)`, `Select(same + children)`
  - `Skeleton({ className })`, `Spinner({ size=16 })`
  - `EmptyState({ icon: Icon, title, text, action })`
  - `PageHeader({ title, subtitle, actions })`

- [ ] **Step 1: Write failing tests**

`frontend/src/components/ui/__tests__/basic.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button, Input, ListRow, EmptyState, Badge } from '..';

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

test('Button renders a link when `to` is given', () => {
  inRouter(<Button to="/today">Go</Button>);
  expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/today');
});

test('Button is disabled and busy while loading', () => {
  inRouter(<Button loading>Save</Button>);
  const btn = screen.getByRole('button', { name: /save/i });
  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('aria-busy', 'true');
});

test('Button primary uses accent fill', () => {
  inRouter(<Button>Start</Button>);
  expect(screen.getByRole('button', { name: 'Start' }).className).toMatch(/bg-accent/);
});

test('Input links label and marks errors', () => {
  inRouter(<Input label="Email" error="Required" />);
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Required')).toHaveAttribute('id', input.getAttribute('aria-describedby'));
});

test('ListRow with onClick is a button and fires', () => {
  const onClick = jest.fn();
  inRouter(<ListRow title="REST APIs" meta="40m" onClick={onClick} />);
  userEvent.click(screen.getByRole('button', { name: /rest apis/i }));
  expect(onClick).toHaveBeenCalled();
});

test('EmptyState renders title, text and action', () => {
  inRouter(<EmptyState title="No tasks" text="Create a path" action={<Button>New path</Button>} />);
  expect(screen.getByText('No tasks')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'New path' })).toBeInTheDocument();
});

test('Badge accent tone uses accent-text', () => {
  inRouter(<Badge tone="accent">Strong</Badge>);
  expect(screen.getByText('Strong').className).toMatch(/text-accent-text/);
});
```
Run: `CI=true npx react-scripts test --watchAll=false ui/__tests__/basic` → FAIL (cannot find module '..').

- [ ] **Step 2: Implement primitives**

`frontend/src/components/ui/Button.jsx`:
```jsx
import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import { Spinner } from './Skeleton';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

const VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:brightness-95',
  secondary: 'border border-line-strong text-fg hover:bg-surface-hover',
  ghost: 'text-muted hover:text-fg hover:bg-surface-hover',
  danger: 'border border-line-strong text-danger hover:bg-surface-hover',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export function Button({ variant = 'primary', size = 'md', loading = false, to, icon: Icon, className, children, disabled, ...props }) {
  const classes = cx(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors select-none',
    'disabled:opacity-50 disabled:pointer-events-none',
    FOCUS, VARIANTS[variant], SIZES[size], className,
  );
  const content = (
    <>
      {loading ? <Spinner size={14} /> : Icon && <Icon size={16} strokeWidth={1.75} aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}

export { FOCUS };
```

`frontend/src/components/ui/Skeleton.jsx`:
```jsx
import { cx } from '../../utils/cx';

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-md bg-surface-hover', className)} />;
}

export function Spinner({ size = 16 }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
      style={{ width: size, height: size }}
    />
  );
}
```
(The `style` for a runtime size is the one allowed exception: it is a dynamic dimension, not a color.)

`frontend/src/components/ui/Badge.jsx`:
```jsx
import { cx } from '../../utils/cx';

const TONES = {
  neutral: 'bg-surface-hover text-muted',
  accent: 'bg-accent-soft text-accent-text',
  danger: 'bg-surface-hover text-danger',
  warn: 'bg-surface-hover text-warn',
  info: 'bg-surface-hover text-info',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  );
}
```

`frontend/src/components/ui/Surface.jsx`:
```jsx
import { cx } from '../../utils/cx';

export function Surface({ title, action, className, children }) {
  return (
    <section className={cx('rounded-xl border border-line bg-surface', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
```

`frontend/src/components/ui/ListRow.jsx`:
```jsx
import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import { FOCUS } from './Button';

export function ListRow({ leading, title, meta, trailing, onClick, to, className }) {
  const interactive = Boolean(onClick || to);
  const classes = cx(
    'flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm',
    interactive && cx('transition-colors hover:bg-surface-hover', FOCUS),
    className,
  );
  const body = (
    <>
      {leading}
      <span className="min-w-0 flex-1 truncate text-fg">{title}</span>
      {meta && <span className="shrink-0 font-mono text-xs tabular text-faint">{meta}</span>}
      {trailing}
    </>
  );
  if (to) return <Link to={to} className={classes}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={classes}>{body}</button>;
  return <div className={classes}>{body}</div>;
}
```

`frontend/src/components/ui/Field.jsx`:
```jsx
import { useId } from 'react';
import { cx } from '../../utils/cx';

const CONTROL = cx(
  'w-full rounded-md border border-line-strong bg-canvas px-3 text-sm text-fg placeholder:text-faint',
  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
  'aria-[invalid=true]:border-danger',
);

function FieldShell({ label, hint, error, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[13px] font-medium text-fg">{label}</label>}
      {children}
      {error
        ? <p id={`${id}-msg`} className="text-xs text-danger">{error}</p>
        : hint && <p id={`${id}-msg`} className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

function useFieldProps({ id, hint, error }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return {
    fieldId,
    aria: {
      id: fieldId,
      'aria-invalid': error ? 'true' : undefined,
      'aria-describedby': error || hint ? `${fieldId}-msg` : undefined,
    },
  };
}

export function Input({ label, hint, error, id, className, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <input className={cx(CONTROL, 'h-9', className)} {...aria} {...props} />
    </FieldShell>
  );
}

export function Textarea({ label, hint, error, id, className, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <textarea className={cx(CONTROL, 'min-h-[88px] py-2', className)} {...aria} {...props} />
    </FieldShell>
  );
}

export function Select({ label, hint, error, id, className, children, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <select className={cx(CONTROL, 'h-9', className)} {...aria} {...props}>{children}</select>
    </FieldShell>
  );
}
```

`frontend/src/components/ui/EmptyState.jsx`:
```jsx
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {Icon && <Icon size={20} strokeWidth={1.75} className="text-faint" aria-hidden="true" />}
      <div>
        <p className="text-sm font-semibold text-fg">{title}</p>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}
```

`frontend/src/components/ui/PageHeader.jsx`:
```jsx
export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
```

`frontend/src/components/ui/index.js`:
```js
export { Button } from './Button';
export { Badge } from './Badge';
export { Surface } from './Surface';
export { ListRow } from './ListRow';
export { Input, Textarea, Select } from './Field';
export { Skeleton, Spinner } from './Skeleton';
export { EmptyState } from './EmptyState';
export { PageHeader } from './PageHeader';
```

- [ ] **Step 3: Run tests → PASS**

Run: `CI=true npx react-scripts test --watchAll=false ui/__tests__/basic` → 7 passed.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui
git commit -m "feat(ui): basic primitives (Button, Badge, Surface, ListRow, fields, states)"
```

---

### Task 3: Interactive primitives — Menu, Dialog, Tabs

**Files:**
- Create: `frontend/src/components/ui/Menu.jsx`, `Dialog.jsx`, `Tabs.jsx`
- Modify: `frontend/src/components/ui/index.js`
- Test: `frontend/src/components/ui/__tests__/interactive.test.jsx`

**Interfaces:**
- Produces:
  - `Menu({ trigger: (props) => ReactNode, items: Array<{ label, icon?, onSelect?, to?, danger? } | 'divider'>, align='start'|'end', side='bottom'|'top' })`. `trigger` receives `{ ref, onClick, 'aria-haspopup', 'aria-expanded', 'aria-controls' }` to spread on a button.
  - `Dialog({ open, onClose, title, children, footer })`
  - `Tabs({ tabs: Array<{ id, label }>, value, onChange(id) })`

- [ ] **Step 1: Write failing tests**

`frontend/src/components/ui/__tests__/interactive.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Dialog, Tabs } from '..';

function MenuHarness({ onLogout = () => {} }) {
  return (
    <MemoryRouter>
      <Menu
        trigger={(p) => <button {...p}>Account</button>}
        items={[{ label: 'Settings', to: '/settings' }, 'divider', { label: 'Log out', onSelect: onLogout, danger: true }]}
      />
      <p>outside</p>
    </MemoryRouter>
  );
}

test('Menu opens, Esc closes and returns focus to trigger', () => {
  render(<MenuHarness />);
  const trigger = screen.getByRole('button', { name: 'Account' });
  userEvent.click(trigger);
  expect(screen.getByRole('menu')).toBeInTheDocument();
  expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('Menu closes on outside click', () => {
  render(<MenuHarness />);
  userEvent.click(screen.getByRole('button', { name: 'Account' }));
  userEvent.click(screen.getByText('outside'));
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('Menu arrow keys move focus and Enter selects', () => {
  const onLogout = jest.fn();
  render(<MenuHarness onLogout={onLogout} />);
  userEvent.click(screen.getByRole('button', { name: 'Account' }));
  userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Log out' })).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(onLogout).toHaveBeenCalled();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('Dialog traps Esc and labels itself', () => {
  const onClose = jest.fn();
  render(<Dialog open onClose={onClose} title="Start focus">Body</Dialog>);
  expect(screen.getByRole('dialog', { name: 'Start focus' })).toBeInTheDocument();
  userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});

test('Dialog renders nothing when closed', () => {
  render(<Dialog open={false} onClose={() => {}} title="X">Body</Dialog>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

function TabsHarness() {
  const [v, setV] = useState('a');
  return <Tabs tabs={[{ id: 'a', label: 'Roadmaps' }, { id: 'b', label: 'Exams' }]} value={v} onChange={setV} />;
}

test('Tabs select on click and move with arrow keys', () => {
  render(<TabsHarness />);
  const first = screen.getByRole('tab', { name: 'Roadmaps' });
  expect(first).toHaveAttribute('aria-selected', 'true');
  first.focus();
  userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Exams' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Exams' })).toHaveFocus();
});
```
Run → FAIL (exports missing).

- [ ] **Step 2: Implement**

`frontend/src/components/ui/Menu.jsx`:
```jsx
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cx } from '../../utils/cx';

export function Menu({ trigger, items, align = 'start', side = 'bottom' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const menuId = useId();
  const navigate = useNavigate();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    listRef.current?.querySelector('[role="menuitem"]')?.focus();
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const select = (item) => {
    close();
    if (item.to) navigate(item.to);
    item.onSelect?.();
  };

  const onKeyDown = (e) => {
    const nodes = [...listRef.current.querySelectorAll('[role="menuitem"]')];
    const i = nodes.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); nodes[(i + 1) % nodes.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); nodes[(i - 1 + nodes.length) % nodes.length].focus(); }
    if (e.key === 'Tab') close(false);
  };

  return (
    <div className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
      })}
      {open && (
        <div
          id={menuId}
          ref={listRef}
          role="menu"
          onKeyDown={onKeyDown}
          className={cx(
            'absolute z-50 min-w-[200px] rounded-xl border border-line bg-surface p-1 shadow-pop',
            align === 'end' ? 'right-0' : 'left-0',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {items.map((item, idx) => (item === 'divider'
            ? <div key={`d${idx}`} role="separator" className="my-1 h-px bg-line" />
            : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => select(item)}
                className={cx(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm',
                  'hover:bg-surface-hover focus:bg-surface-hover focus:outline-none',
                  item.danger ? 'text-danger' : 'text-fg',
                )}
              >
                {item.icon && <item.icon size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />}
                {item.label}
              </button>
            )))}
        </div>
      )}
    </div>
  );
}
```

`frontend/src/components/ui/Dialog.jsx`:
```jsx
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Dialog({ open, onClose, title, children, footer }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl border border-line bg-surface shadow-pop focus:outline-none"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-fg">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-fg">
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>
        <div className="px-5 py-4 text-sm text-muted">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
```

`frontend/src/components/ui/Tabs.jsx`:
```jsx
import { cx } from '../../utils/cx';

export function Tabs({ tabs, value, onChange }) {
  const onKeyDown = (e, index) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.id);
    e.currentTarget.parentElement.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <div role="tablist" className="flex gap-5 border-b border-line">
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              '-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:text-fg',
              selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

Append to `frontend/src/components/ui/index.js`:
```js
export { Menu } from './Menu';
export { Dialog } from './Dialog';
export { Tabs } from './Tabs';
```

- [ ] **Step 3: Run tests → PASS**

Run: `CI=true npx react-scripts test --watchAll=false ui/__tests__` → all passed.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui
git commit -m "feat(ui): accessible Menu, Dialog and Tabs primitives"
```

---

### Task 4: App shell — sidebar, avatar menu, mobile tab bar

**Files:**
- Create: `frontend/src/components/shell/nav.js`, `Sidebar.jsx`, `MobileNav.jsx`, `AvatarMenu.jsx`, `AppLayout.jsx`
- Test: `frontend/src/components/shell/__tests__/shell.test.jsx`

**Interfaces:**
- Consumes: `Menu` (Task 3), `cx`, `useTheme()` → `{ theme, toggleTheme }` from `src/context/ThemeContext.jsx`, `clearTokens()` + `logoutBackend()` from `src/utils/auth.js`, `useAuthStore().logout`, `userService.getProfile()`.
- Produces: `NAV_ITEMS` (`[{ to, label, icon }]` for `/today /path /mentor /progress`), `isActive(pathname, to) => boolean`, default export `AppLayout` (renders `<Outlet />`).

- [ ] **Step 1: Write failing tests**

`frontend/src/components/shell/__tests__/shell.test.jsx`:
```jsx
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';
import Sidebar from '../Sidebar';
import MobileNav from '../MobileNav';
import { NAV_ITEMS, isActive } from '../nav';

jest.mock('../../../utils/auth', () => ({ clearTokens: jest.fn(), logoutBackend: jest.fn(() => Promise.resolve()) }));

const renderAt = (path, ui) => render(
  <ThemeProvider><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></ThemeProvider>,
);

test('nav has exactly Today, Path, Mentor, Progress', () => {
  expect(NAV_ITEMS.map((i) => i.label)).toEqual(['Today', 'Path', 'Mentor', 'Progress']);
});

test('isActive matches nested paths only on segment boundary', () => {
  expect(isActive('/path/roadmap/4', '/path')).toBe(true);
  expect(isActive('/pathfinder', '/path')).toBe(false);
});

test('sidebar marks current section with aria-current', () => {
  renderAt('/path/roadmap/4', <Sidebar user={{ first_name: 'Abhinav', email: 'a@b.c' }} />);
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getByRole('link', { name: 'Path' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');
});

test('avatar menu lists career + account entries and logs out', async () => {
  const { clearTokens } = require('../../../utils/auth');
  const realLocation = window.location;
  delete window.location;
  window.location = { href: '' };
  renderAt('/today', <Sidebar user={{ first_name: 'Abhinav', email: 'a@b.c' }} />);
  userEvent.click(screen.getByRole('button', { name: /account menu/i }));
  const menu = screen.getByRole('menu');
  ['Resume', 'Portfolio', 'LinkedIn check', 'Billing', 'Settings', 'Support', 'Log out'].forEach((label) => {
    expect(within(menu).getByRole('menuitem', { name: new RegExp(label) })).toBeInTheDocument();
  });
  userEvent.click(within(menu).getByRole('menuitem', { name: 'Log out' }));
  await waitFor(() => expect(clearTokens).toHaveBeenCalled());
  expect(window.location.href).toBe('/login');
  window.location = realLocation;
});

test('mobile nav is hidden on desktop and shows 4 tabs', () => {
  renderAt('/today', <MobileNav />);
  const nav = screen.getByRole('navigation', { name: 'Main mobile' });
  expect(nav.className).toMatch(/md:hidden/);
  expect(within(nav).getAllByRole('link')).toHaveLength(4);
});
```
Run → FAIL (modules missing).

- [ ] **Step 2: Implement**

`frontend/src/components/shell/nav.js`:
```js
import { Sun, Map, MessageCircle, TrendingUp } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/path', label: 'Path', icon: Map },
  { to: '/mentor', label: 'Mentor', icon: MessageCircle },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);
```

`frontend/src/components/shell/AvatarMenu.jsx`:
```jsx
import { FileText, Globe, Linkedin, CreditCard, Settings, LifeBuoy, Sun, Moon, LogOut } from 'lucide-react';
import { Menu } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { clearTokens, logoutBackend } from '../../utils/auth';
import { cx } from '../../utils/cx';

const initialOf = (user) => (user?.first_name || user?.username || user?.email || '?').charAt(0).toUpperCase();

export default function AvatarMenu({ user, side = 'top', compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutBackend().catch(() => null);
    clearTokens();
    logout();
    window.location.href = '/login';
  };

  const items = [
    { label: 'Resume', icon: FileText, to: '/career/resume' },
    { label: 'Portfolio', icon: Globe, to: '/career/portfolio' },
    { label: 'LinkedIn check', icon: Linkedin, to: '/career/linkedin' },
    'divider',
    { label: 'Billing', icon: CreditCard, to: '/settings#billing' },
    { label: 'Settings', icon: Settings, to: '/settings' },
    { label: 'Support', icon: LifeBuoy, to: '/support' },
    { label: theme === 'light' ? 'Dark theme' : 'Light theme', icon: theme === 'light' ? Moon : Sun, onSelect: toggleTheme },
    'divider',
    { label: 'Log out', icon: LogOut, onSelect: handleLogout, danger: true },
  ];

  return (
    <Menu
      side={side}
      align={compact ? 'end' : 'start'}
      items={items}
      trigger={(props) => (
        <button
          type="button"
          aria-label="Account menu"
          {...props}
          className={cx(
            'flex items-center gap-2.5 rounded-md text-left text-sm text-muted hover:bg-surface-hover hover:text-fg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            compact ? 'p-1' : 'w-full px-2 py-1.5',
          )}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-hover text-xs font-semibold text-fg">
            {initialOf(user)}
          </span>
          {!compact && <span className="truncate">{user?.first_name || user?.username || 'Account'}</span>}
        </button>
      )}
    />
  );
}
```

`frontend/src/components/shell/Sidebar.jsx`:
```jsx
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, isActive } from './nav';
import AvatarMenu from './AvatarMenu';
import { cx } from '../../utils/cx';

export default function Sidebar({ user }) {
  const { pathname } = useLocation();
  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-line bg-subtle px-3 py-4 md:flex">
      <Link to="/today" className="mb-6 px-2 text-[15px] font-semibold tracking-[-0.02em] text-fg">planorah</Link>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(pathname, to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active ? 'bg-surface-hover text-fg' : 'text-muted hover:bg-surface-hover hover:text-fg',
              )}
            >
              {active && <span aria-hidden="true" className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />}
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <AvatarMenu user={user} side="top" />
    </aside>
  );
}
```
Plain `Link` (not `NavLink`) so `aria-current` is fully controlled by `isActive`, which also covers nested paths.

`frontend/src/components/shell/MobileNav.jsx`:
```jsx
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, isActive } from './nav';
import { cx } from '../../utils/cx';

export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Main mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-subtle pb-safe-bottom md:hidden"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = isActive(pathname, to);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cx('flex h-14 flex-col items-center justify-center gap-1 text-[11px]', active ? 'text-fg' : 'text-faint')}
          >
            <Icon size={18} strokeWidth={1.75} className={active ? 'text-accent-text' : undefined} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
```

`frontend/src/components/shell/AppLayout.jsx` (keeps the post-onboarding voice intro, welcome coach and tour from the old `Layout.jsx`; drops the floating "Quicky" dock and text panel — Mentor is now a page):
```jsx
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AvatarMenu from './AvatarMenu';
import AIVoicePanel from '../Mentoring/AIVoicePanel';
import WelcomeCoach from '../Onboarding/WelcomeCoach';
import { TourProvider } from '../Tour/TourContext';
import GuidedTour from '../Tour/GuidedTour';
import { userService } from '../../api/userService';

const REALTIME_ONBOARDING_INTRO_KEY = 'show_realtime_onboarding_intro';

const contextSourceFor = (pathname) => {
  if (pathname.startsWith('/path')) return 'roadmap';
  if (pathname.startsWith('/career')) return 'resume';
  if (pathname.startsWith('/mentor')) return 'assistant';
  if (pathname.startsWith('/today')) return 'dashboard';
  return 'general';
};

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  useEffect(() => {
    userService.getProfile().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(REALTIME_ONBOARDING_INTRO_KEY) === 'true' && location.pathname.startsWith('/today')) {
      sessionStorage.removeItem(REALTIME_ONBOARDING_INTRO_KEY);
      sessionStorage.removeItem('show_welcome_coach');
      setVoiceOpen(true);
      return;
    }
    const flag = sessionStorage.getItem('show_welcome_coach');
    if (flag) setWelcomeUser(flag === 'true' ? '' : flag);
  }, [location.pathname]);

  return (
    <TourProvider>
      <div className="flex min-h-screen bg-canvas font-sans text-fg">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center justify-between border-b border-line px-4 md:hidden">
            <Link to="/today" className="text-[15px] font-semibold tracking-[-0.02em]">planorah</Link>
            <AvatarMenu user={user} side="bottom" compact />
          </header>
          <main className="flex-1 pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>

      {welcomeUser !== null && <WelcomeCoach userName={welcomeUser} onDone={() => setWelcomeUser(null)} />}
      <AIVoicePanel
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        contextSource={contextSourceFor(location.pathname)}
        autoStart={voiceOpen}
        onAutoStartHandled={() => {}}
        onSwitchToText={() => setVoiceOpen(false)}
      />
      {location.pathname.startsWith('/today') && <GuidedTour />}
    </TourProvider>
  );
}
```

- [ ] **Step 3: Run tests → PASS**

Run: `CI=true npx react-scripts test --watchAll=false shell` → 5 passed.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/shell
git commit -m "feat(shell): sidebar with 4 sections, avatar menu, mobile tab bar"
```

---

### Task 5: Route map, redirects, logged-in home

**Files:**
- Create: `frontend/src/routes/RedirectWithParams.jsx`, `frontend/src/routes/HomeRoute.jsx`
- Modify: `frontend/src/App.js:14-16` (imports), `:196` (`/` route), `:221-262` (protected routes block)
- Delete: `frontend/src/components/Layout.jsx`, `frontend/src/components/Sidebar.jsx`
- Modify: `frontend/src/utils/assistantContext.js` (path prefixes)
- Test: `frontend/src/routes/__tests__/routes.test.jsx`

**Interfaces:**
- Consumes: `AppLayout` (Task 4), `getAccessToken()` from `src/utils/auth.js`.
- Produces: `RedirectWithParams({ to })` — `to` is a pattern like `/path/roadmap/:id`, filled from current `useParams()`, keeps `location.hash`. `HomeRoute({ children })` — `<Navigate to="/today" replace />` if `getAccessToken()` is truthy, else `children`.

- [ ] **Step 1: Write failing tests**

`frontend/src/routes/__tests__/routes.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import RedirectWithParams from '../RedirectWithParams';
import HomeRoute from '../HomeRoute';

jest.mock('../../utils/auth', () => ({ getAccessToken: jest.fn() }));
const { getAccessToken } = require('../../utils/auth');

function Where() {
  const loc = useLocation();
  const params = useParams();
  return <p>{loc.pathname}{loc.hash}|{JSON.stringify(params)}</p>;
}

const at = (url, routes) => render(<MemoryRouter initialEntries={[url]}><Routes>{routes}</Routes></MemoryRouter>);

test('old roadmap deep link keeps its id', () => {
  at('/roadmap/42', [
    <Route key="o" path="/roadmap/:id" element={<RedirectWithParams to="/path/roadmap/:id" />} />,
    <Route key="n" path="/path/roadmap/:id" element={<Where />} />,
  ]);
  expect(screen.getByText('/path/roadmap/42|{"id":"42"}')).toBeInTheDocument();
});

test('multi-param exam link keeps params', () => {
  at('/planora/subject/7/plan', [
    <Route key="o" path="/planora/subject/:subjectId/plan" element={<RedirectWithParams to="/path/exam/subject/:subjectId/plan" />} />,
    <Route key="n" path="/path/exam/subject/:subjectId/plan" element={<Where />} />,
  ]);
  expect(screen.getByText('/path/exam/subject/7/plan|{"subjectId":"7"}')).toBeInTheDocument();
});

test('hash is preserved', () => {
  at('/resume/compiled/3#top', [
    <Route key="o" path="/resume/compiled/:versionId" element={<RedirectWithParams to="/career/resume/compiled/:versionId" />} />,
    <Route key="n" path="/career/resume/compiled/:versionId" element={<Where />} />,
  ]);
  expect(screen.getByText('/career/resume/compiled/3#top|{"versionId":"3"}')).toBeInTheDocument();
});

test('logged-in user on / goes to /today', () => {
  getAccessToken.mockReturnValue('tok');
  at('/', [
    <Route key="h" path="/" element={<HomeRoute><p>landing</p></HomeRoute>} />,
    <Route key="t" path="/today" element={<Where />} />,
  ]);
  expect(screen.getByText(/^\/today/)).toBeInTheDocument();
});

test('logged-out user on / sees landing', () => {
  getAccessToken.mockReturnValue(null);
  at('/', [<Route key="h" path="/" element={<HomeRoute><p>landing</p></HomeRoute>} />]);
  expect(screen.getByText('landing')).toBeInTheDocument();
});
```
Run → FAIL.

- [ ] **Step 2: Implement helpers**

`frontend/src/routes/RedirectWithParams.jsx`:
```jsx
import { Navigate, generatePath, useLocation, useParams } from 'react-router-dom';

export default function RedirectWithParams({ to }) {
  const params = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`${generatePath(to, params)}${search}${hash}`} replace />;
}
```

`frontend/src/routes/HomeRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../utils/auth';

export default function HomeRoute({ children }) {
  return getAccessToken() ? <Navigate to="/today" replace /> : children;
}
```
Run tests → 5 passed.

- [ ] **Step 3: Rewire `App.js`**

Replace `import Layout from './components/Layout';` with:
```js
import AppLayout from './components/shell/AppLayout';
import RedirectWithParams from './routes/RedirectWithParams';
import HomeRoute from './routes/HomeRoute';
```

Change the landing route to:
```jsx
              <Route path="/" element={<HomeRoute><LandingPage /></HomeRoute>} />
```

Replace the whole `{/* Protected App Routes */}` `<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}> … </Route>` block with:
```jsx
            {/* Protected App Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {/* Today */}
              <Route path="/today" element={<Dashboard />} />
              <Route path="/today/tasks" element={<TaskList />} />
              <Route path="/today/timeline" element={<DayTimeline />} />
              <Route path="/today/focus" element={<FocusMode />} />
              <Route path="/today/calendar" element={<Scheduler />} />
              {/* Path */}
              <Route path="/path" element={<RoadmapList />} />
              <Route path="/path/new" element={<RoadmapGenerator />} />
              <Route path="/path/roadmap/:id" element={<RoadmapView />} />
              <Route path="/path/projects" element={<RoadmapProjects />} />
              <Route path="/path/exam" element={<PlanoraDashboard />} />
              <Route path="/path/exam/subject/:subjectId" element={<SubjectDetail />} />
              <Route path="/path/exam/subject/:subjectId/plan" element={<StudyPlanner />} />
              <Route path="/path/exam/topic/:topicId/notes" element={<TopicDetail />} />
              <Route path="/path/exam/topic/:topicId/guide" element={<TopicDetail />} />
              {/* Mentor / Progress */}
              <Route path="/mentor" element={<AIAssistant />} />
              <Route path="/progress" element={<Analytics />} />
              {/* Career (avatar menu) */}
              <Route path="/career/resume" element={<ResumeList />} />
              <Route path="/career/resume/new" element={<ResumeBuilder />} />
              <Route path="/career/resume/compiled" element={<CompiledResumeList />} />
              <Route path="/career/resume/compiled/:versionId" element={<CompiledResumeView />} />
              <Route path="/career/resume/:id" element={<ResumeBuilder />} />
              <Route path="/career/ats" element={<ATSScanner />} />
              <Route path="/career/linkedin" element={<LinkedInAnalyzer />} />
              <Route path="/career/portfolio" element={<PortfolioEditor />} />
              <Route path="/career/portfolio/projects" element={<ProjectManager />} />
              {/* Account */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing/checkout" element={<CheckoutPage />} />

              {/* Redirects from old URLs */}
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/tasks" element={<Navigate to="/today/tasks" replace />} />
              <Route path="/tasks/day" element={<Navigate to="/today/timeline" replace />} />
              <Route path="/tasks/focus" element={<Navigate to="/today/focus" replace />} />
              <Route path="/tasks/analytics" element={<Navigate to="/progress" replace />} />
              <Route path="/scheduler" element={<Navigate to="/today/calendar" replace />} />
              <Route path="/roadmap/list" element={<Navigate to="/path" replace />} />
              <Route path="/roadmap/generate" element={<Navigate to="/path/new" replace />} />
              <Route path="/roadmap/projects" element={<Navigate to="/path/projects" replace />} />
              <Route path="/roadmap/:id" element={<RedirectWithParams to="/path/roadmap/:id" />} />
              <Route path="/planora" element={<Navigate to="/path/exam" replace />} />
              <Route path="/planora/subject/:subjectId" element={<RedirectWithParams to="/path/exam/subject/:subjectId" />} />
              <Route path="/planora/subject/:subjectId/plan" element={<RedirectWithParams to="/path/exam/subject/:subjectId/plan" />} />
              <Route path="/planora/topic/:topicId/notes" element={<RedirectWithParams to="/path/exam/topic/:topicId/notes" />} />
              <Route path="/planora/topic/:topicId/guide" element={<RedirectWithParams to="/path/exam/topic/:topicId/guide" />} />
              <Route path="/assistant" element={<Navigate to="/mentor" replace />} />
              <Route path="/resume" element={<Navigate to="/career/resume" replace />} />
              <Route path="/resume/new" element={<Navigate to="/career/resume/new" replace />} />
              <Route path="/resume/compiled" element={<Navigate to="/career/resume/compiled" replace />} />
              <Route path="/resume/compiled/:versionId" element={<RedirectWithParams to="/career/resume/compiled/:versionId" />} />
              <Route path="/resume/:id" element={<RedirectWithParams to="/career/resume/:id" />} />
              <Route path="/ats" element={<Navigate to="/career/ats" replace />} />
              <Route path="/linkedin-analyzer" element={<Navigate to="/career/linkedin" replace />} />
              <Route path="/portfolio/edit" element={<Navigate to="/career/portfolio" replace />} />
              <Route path="/projects" element={<Navigate to="/career/portfolio/projects" replace />} />
              <Route path="/profile" element={<Navigate to="/settings#profile" replace />} />
              <Route path="/subscription/plans" element={<Navigate to="/settings#plans" replace />} />
              <Route path="/subscription" element={<Navigate to="/settings#subscription" replace />} />
              <Route path="/billing/history" element={<Navigate to="/settings#billing" replace />} />
            </Route>
```

- [ ] **Step 4: Update context mapping and delete old shell**

`frontend/src/utils/assistantContext.js`: add these lines at the top of the path checks (before existing ones), so new URLs map to the same context names:
```js
  if (pathname.startsWith('/today')) return 'dashboard';
  if (pathname.startsWith('/path/exam')) return 'planora';
  if (pathname.startsWith('/path')) return 'roadmap';
  if (pathname.startsWith('/career/portfolio')) return 'portfolio';
  if (pathname.startsWith('/career')) return 'resume';
  if (pathname.startsWith('/mentor')) return 'assistant';
```

```bash
cd frontend && git rm -q src/components/Layout.jsx src/components/Sidebar.jsx
grep -rn "components/Layout'\|from './Sidebar'\|from '../Sidebar'" src || echo "no refs"
```
Expected: `no refs`.

- [ ] **Step 5: Tests + build**

Run: `CI=true npx react-scripts test --watchAll=false` → all pass.
Run: `CI=false npm run build` → `Compiled successfully.`

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src
git commit -m "feat(shell): new route map (today/path/mentor/progress/career) with redirects"
```

---

### Task 6: Verify in the running app

**Files:** none (verification only; fix-ups go in a follow-up commit if needed).

- [ ] **Step 1: Run the app**

Backend already on `:8000`; frontend: `cd frontend && BROWSER=none npm start`. Log in as the local test user.

- [ ] **Step 2: Check, both themes, desktop (1280px) and mobile (390px)**

- `/dashboard` lands on `/today`, sidebar shows Today active with lime marker.
- Click each of the 4 nav items; each renders its existing screen inside the new shell, no console errors.
- Avatar menu: opens, Esc closes and focus returns, outside click closes, theme toggle flips theme, each career/account entry navigates, Log out ends on `/login`.
- Old deep links: `/roadmap/<real id>`, `/planora`, `/resume` redirect correctly.
- Mobile: sidebar hidden, top bar + bottom tab bar visible, last content not hidden behind tab bar, no horizontal scroll.
- Light theme: badge/marker accent text readable (dark green, not lime).
- `/` while logged in → `/today`; after logout `/` shows landing.

- [ ] **Step 3: Record result**

List anything off, fix it in a small commit `fix(shell): …`, re-run tests + build. Then hand to the user for phase 1 review.
