import { Link } from 'react-router-dom';

const COLS = [
  {
    title: 'Product',
    items: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing',  to: '/pricing'  },
      { label: 'Changelog',to: null        },
      { label: 'Roadmap',  to: null        },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Help center',  to: '/support' },
      { label: 'Blog',         to: '/blogs'   },
      { label: 'Templates',    to: null       },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About',   to: '/founder' },
      { label: 'Careers', to: '/careers' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms',   to: '/terms'   },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      padding: '64px 0 48px',
      borderTop: '1px solid var(--lp-border-subtle)',
    }}>
      <div className="lp-container">
        <div className="lp-footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" className="lp-logo" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <img 
                src="/planorah_logo.png" 
                alt="Planorah" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  objectFit: 'contain',
                  filter: 'var(--logo-invert)',
                  marginRight: 8
                }} 
              />
              Planorah
            </Link>
            <p style={{ marginTop: 16, fontSize: 14, maxWidth: 260, color: 'var(--lp-fg-muted)', lineHeight: 1.6 }}>
              AI academic planning for students who take their time seriously.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div className="lp-eyebrow" style={{ marginBottom: 14 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map(item => (
                  item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      style={{
                        fontSize: 14,
                        color: 'var(--lp-fg-deep)',
                        fontFamily: 'var(--lp-font-body)',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--lp-fg-muted)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--lp-fg-deep)'}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={item.label}
                      style={{ fontSize: 14, color: 'var(--lp-fg-muted)', cursor: 'default' }}
                    >
                      {item.label}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid var(--lp-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--lp-fg-muted)',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <span>© {new Date().getFullYear()} Planorah, Inc.</span>
          <span>Made for students, in the library, at 2am.</span>
        </div>
      </div>
    </footer>
  );
}
