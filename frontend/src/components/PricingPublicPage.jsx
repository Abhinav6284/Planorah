import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

const CheckDot = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx={7} cy={7} r={6.5} stroke="var(--border-subtle)" />
    <path d="M4 7l2.2 2.2L10 4.5" stroke="var(--fg-deep)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FAQ = ({ items }) => {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(([q, a], i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--border-subtle)', padding: '20px 0' }}>
          <div onClick={() => setOpen(open === i ? -1 : i)}
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
              letterSpacing: 0.2, color: 'var(--fg-deep)' }}>{q}</div>
            <div style={{ fontSize: 20, color: 'var(--fg-muted)',
              transform: open === i ? 'rotate(45deg)' : '', transition: 'transform 0.2s ease',
              flexShrink: 0, marginLeft: 16 }}>+</div>
          </div>
          {open === i && (
            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, maxWidth: 700, color: 'var(--fg-muted)' }}>
              {a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default function PricingPublicPage() {
  useScrollReveal();
  const navigate = useNavigate();
  const [usd, setUsd] = useState(false);
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      inr: '₹0',
      usd: '$0',
      inrYearly: '₹0',
      usdYearly: '$0',
      sub: 'Forever. No credit card.',
      features: [
        '1 Career Roadmap',
        'Basic Resume Generator',
        'Job Finder (limited listings)',
        'Quicky AI — 5 queries/day',
        'Task Management (basic)',
      ],
      cta: 'Get started free',
      ctaVariant: 'ghost',
    },
    {
      id: 'starter',
      name: 'Starter',
      inr: '₹99',
      usd: '$1.99',
      inrYearly: '₹1089',
      usdYearly: '$21.89',
      per: '/month',
      perYearly: '/year',
      sub: 'Cancel anytime.',
      features: [
        '5 Career Roadmaps/month',
        'Full Resume Generator',
        'Job Finder (unlimited)',
        'Quicky AI (unlimited)',
        'Task & Project Management',
        'Portfolio Live (addon +₹79)',
      ],
      cta: 'Start Starter',
      ctaVariant: 'default',
    },
    {
      id: 'pro',
      name: 'Pro',
      inr: '₹249',
      usd: '$4.99',
      inrYearly: '₹2739',
      usdYearly: '$54.89',
      per: '/month',
      perYearly: '/year',
      sub: 'Most popular for serious students.',
      badge: 'Most popular',
      features: [
        '15 Career Roadmaps/month',
        'Everything in Starter',
        'ATS Scanner (unlimited)',
        'Resources Hub (50+ tools)',
        'Portfolio Live (included)',
        '1× 1:1 Session/month (30 min)',
      ],
      cta: 'Go Pro',
      ctaVariant: 'primary',
    },
    {
      id: 'elite',
      name: 'Elite',
      inr: '₹499',
      usd: '$9.99',
      inrYearly: '₹5489',
      usdYearly: '$109.89',
      per: '/month',
      perYearly: '/year',
      sub: 'For students who want it all.',
      features: [
        'Unlimited Roadmaps',
        'Everything in Pro',
        '2× 1:1 Sessions/month (45 min)',
        'Priority booking',
        'Async support (WhatsApp/Discord)',
        'Early access to new features',
      ],
      cta: 'Go Elite',
      ctaVariant: 'default',
    },
  ];

  const addons = [
    { label: 'Single session · 30 min', inr: '₹149', usd: '$2.99' },
    { label: '3-session bundle',        inr: '₹349', usd: '$6.99' },
    { label: 'Mock interview · 45 min', inr: '₹199', usd: '$3.99' },
  ];

  const faq = [
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
  ];

  return (
    <main>
      <section className="section" style={{ background: 'var(--bg)', paddingTop: 96 }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Pricing</div>
            <h2 style={{ color: 'var(--fg-deep)', letterSpacing: '-0.01em', marginBottom: 14 }}>
              Simple. Student-priced.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.65, marginBottom: 20 }}>
              Start free, upgrade when you need more. Cancel any time.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: 3, gap: 2 }}>
                {['Monthly', 'Yearly (1 month free)'].map((label, i) => (
                  <button key={i} onClick={() => setYearly(i === 1)} style={{
                    padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: yearly === (i === 1) ? 'var(--fg-deep)' : 'transparent',
                    color: yearly === (i === 1) ? 'var(--bg)' : 'var(--fg-muted)',
                    border: 'none', transition: 'all 0.2s ease',
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ display: 'inline-flex', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: 3, gap: 2 }}>
                {['₹ INR', '$ USD'].map((label, i) => (
                  <button key={i} onClick={() => setUsd(i === 1)} style={{
                    padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: usd === (i === 1) ? 'var(--fg-deep)' : 'transparent',
                    color: usd === (i === 1) ? 'var(--bg)' : 'var(--fg-muted)',
                    border: 'none', transition: 'all 0.2s ease',
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 1020, margin: '0 auto 40px' }}>
            {plans.map((p) => {
              const isPro = p.id === 'pro';
              return (
                <div key={p.id} style={{
                  position: 'relative',
                  background: 'var(--surface)',
                  borderRadius: 16,
                  border: isPro ? '1.5px solid var(--fg-deep)' : '1px solid var(--border-subtle)',
                  boxShadow: isPro ? '0 0 0 1px var(--fg-deep)' : 'none',
                  padding: '28px 22px',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {p.badge && (
                    <div style={{
                      position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--fg-deep)', color: 'var(--bg)',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap',
                    }}>{p.badge}</div>
                  )}

                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                    {p.name}
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--fg-deep)', letterSpacing: '-0.02em' }}>
                      {yearly ? (usd ? p.usdYearly : p.inrYearly) : (usd ? p.usd : p.inr)}
                    </span>
                    {(yearly ? p.perYearly : p.per) && <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 400, marginLeft: 2 }}>{yearly ? p.perYearly : p.per}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 22, lineHeight: 1.5 }}>{p.sub}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                    {p.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, color: 'var(--fg-deep)', lineHeight: 1.4 }}>
                        <CheckDot />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/register')}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: isPro ? 'none' : '1px solid var(--border-subtle)',
                      background: isPro ? 'var(--fg-deep)' : 'transparent',
                      color: isPro ? 'var(--bg)' : 'var(--fg-deep)',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >{p.cta}</button>
                </div>
              );
            })}
          </div>

          <div className="reveal" style={{ maxWidth: 1020, margin: '0 auto' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 14,
              padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 0,
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 32, flexShrink: 0 }}>
                Session add-ons
              </div>
              <div style={{ display: 'flex', gap: 0, flex: 1 }}>
                {addons.map((a, i) => (
                  <div key={i} style={{
                    flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0 20px',
                    borderLeft: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{a.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)', fontFamily: 'var(--font-mono)' }}>
                      {usd ? a.usd : a.inr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--fg-muted)', opacity: 0.7 }}>
              Sessions booked via Calendly · Min 24h advance · No-shows forfeit the session
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <h3 style={{ fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Common questions</h3>
          <FAQ items={faq} />
        </div>
      </section>
    </main>
  );
}
