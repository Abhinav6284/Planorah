import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Primitives';

// ─── Social icons ─────────────────────────────────────────
const SocialIcon = ({ href, label, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    style={{
      width: 32, height: 32, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--fg-muted)', transition: 'color 0.15s ease, background 0.15s ease',
      background: 'transparent'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg-deep)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent'; }}
  >
    {children}
  </a>
);

const TwitterIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Footer column ────────────────────────────────────────
const FooterCol = ({ title, items }) => (
  <div>
    <div style={{
      fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)',
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16
    }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(([label, path], i) => (
        <Link key={i}
             to={path}
             style={{
               fontSize: 14,
               color: 'var(--fg-deep)',
               textDecoration: 'none',
               transition: 'color 0.15s ease'
             }}
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg-muted)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-deep)'}
        >{label}</Link>
      ))}
    </div>
  </div>
);

// ─── Main export ──────────────────────────────────────────
export const Footer = () => (
  <footer style={{
    padding: '80px 0 48px',
    borderTop: '1px solid var(--border-subtle)',
    marginTop: 48
  }}>
    <div className="container">
      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.7fr', gap: 40 }}>
        {/* Brand column */}
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <p style={{ marginTop: 16, fontSize: 14, maxWidth: 280, lineHeight: 1.6, color: 'var(--fg-muted)' }}>
            The AI-powered execution system for students who take their goals seriously.
          </p>
          {/* Social icons */}
          <div style={{ marginTop: 20, display: 'flex', gap: 6 }}>
            <SocialIcon href="https://x.com/planorah" label="Follow on X / Twitter">
              <TwitterIcon />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com/company/planorah" label="Follow on LinkedIn">
              <LinkedInIcon />
            </SocialIcon>
            <SocialIcon href="https://instagram.com/planorah" label="Follow on Instagram">
              <InstagramIcon />
            </SocialIcon>
          </div>
        </div>

        {/* Product */}
        <FooterCol title="Product" items={[
          ['Features', '/features'],
          ['Pricing', '/pricing'],
          ['How It Works', '/how-it-works'],
          ['Demo', '/demo'],
          ['Students', '/students'],
        ]} />

        {/* Resources */}
        <FooterCol title="Resources" items={[
          ['Blog', '/blogs'],
          ['Templates', '/templates'],
          ['FAQ', '/faq'],
          ['Help Center', '/support'],
        ]} />

        {/* Company */}
        <FooterCol title="Company" items={[
          ['About', '/about'],
          ['Careers', '/careers'],
          ['Contact', '/contact'],
        ]} />

        {/* Legal */}
        <FooterCol title="Legal" items={[
          ['Privacy', '/privacy'],
          ['Terms', '/terms'],
        ]} />
      </div>

      {/* Comparison links (SEO) */}
      <div style={{
        marginTop: 48, paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', flexWrap: 'wrap', gap: 20,
        fontSize: 12, color: 'var(--fg-muted)'
      }}>
        <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Compare:</span>
        <Link to="/compare/notion-vs-planorah" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>Notion vs Planorah</Link>
        <Link to="/compare/google-calendar-vs-planorah" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>Google Calendar vs Planorah</Link>
        <Link to="/compare/todoist-vs-planorah" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>Todoist vs Planorah</Link>
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: 24,
        paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: 'var(--fg-muted)'
      }}>
        <span>© 2026 Planorah, Inc.</span>
        <span>Made for students, in the library, at 2am.</span>
      </div>
    </div>
  </footer>
);
