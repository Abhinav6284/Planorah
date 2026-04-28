import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, GraduationCap, Rocket, BadgeCheck } from 'lucide-react';

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

const leadershipProfiles = [
  {
    id: 'founder',
    tabLabel: 'Founder',
    name: 'Abhinav Goyal',
    role: 'Founder and Builder, Planorah',
    intro:
      'I built Planorah to help students stop drowning in planning chaos and start executing with clarity every single day.',
    location: 'India',
    email: 'support@planorah.me',
    initials: 'AG',
    quote:
      'Students do not fail because they lack ambition. They fail because their systems are broken. Planorah exists to fix that system.',
  },
  {
    id: 'co-founder',
    tabLabel: 'Co Founder',
    name: 'Abhishek Singh',
    role: 'Co-Founder, Planorah',
    intro:
      'I am focused on scaling Planorah into a system students can trust daily for clear direction, accountability, and momentum.',
    location: 'India',
    email: 'support@planorah.me',
    initials: 'AS',
    quote:
      'Execution is not about working more. It is about removing noise, choosing what matters, and showing up with consistency.',
  },
];

const founderStats = [
  { label: 'Students impacted', value: '10,000+' },
  { label: 'Core modules shipped', value: '12+' },
  { label: 'Execution mindset', value: 'Student-first' },
];

const principles = [
  {
    title: 'Clarity Over Complexity',
    description: 'Great products reduce mental load. Every Planorah feature should make the next step obvious.',
  },
  {
    title: 'Execution Beats Intention',
    description: 'Planning is useful only when it ends in action. The product is built to push daily execution.',
  },
  {
    title: 'Built With Real Users',
    description: 'Roadmaps are shaped by student feedback loops, not by assumptions inside a boardroom.',
  },
  {
    title: 'AI With Accountability',
    description: 'AI should guide, not control. Recommendations stay practical, transparent, and measurable.',
  },
];

const journey = [
  {
    period: '2024',
    title: 'From Personal Chaos To First Prototype',
    detail: 'Planorah started as a personal system to survive coursework, projects, and career prep without burnout.',
  },
  {
    period: '2024 Q3',
    title: 'First Student Users',
    detail: 'Friends from college started using it and shared the same outcome: less confusion, better consistency.',
  },
  {
    period: '2025',
    title: 'Growth Through Word Of Mouth',
    detail: 'Students invited other students because the product solved a painful everyday problem.',
  },
  {
    period: 'Now',
    title: 'Building The Student Execution OS',
    detail: 'Planorah is evolving into a full stack for roadmap planning, focus, accountability, and career momentum.',
  },
];

export default function AboutPage() {
  useScrollReveal();
  const navigate = useNavigate();
  const [activeProfileId, setActiveProfileId] = useState(leadershipProfiles[0].id);
  const activeProfile = leadershipProfiles.find((p) => p.id === activeProfileId) || leadershipProfiles[0];

  return (
    <main>
      {/* Hero / Leadership Spotlight */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container">
          <div className="reveal-fade" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Leadership Spotlight</div>
              
              <div style={{ display: 'inline-flex', gap: 8, background: 'var(--surface)', padding: 6, borderRadius: 9999, marginBottom: 24, boxShadow: 'var(--shadow-ring)' }}>
                {leadershipProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setActiveProfileId(profile.id)}
                    style={{
                      background: activeProfileId === profile.id ? 'var(--fg-deep)' : 'transparent',
                      color: activeProfileId === profile.id ? 'var(--bg)' : 'var(--fg-muted)',
                      padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {profile.tabLabel}
                  </button>
                ))}
              </div>

              <h1 style={{ marginBottom: 24, fontSize: 48, lineHeight: 1.1 }}>
                Meet the team behind Planorah.
              </h1>
              <p style={{ fontSize: 18, color: 'var(--fg-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                {activeProfile.intro}
              </p>

              <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
                <button className="btn" onClick={() => navigate('/register')}>Start Free</button>
                <a href={`mailto:${activeProfile.email}`} className="btn btn-plain" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} /> Contact {activeProfile.tabLabel}
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {founderStats.map((item) => (
                  <div key={item.label} className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg-deep)', marginBottom: 4 }}>{item.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--charcoal)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
                {activeProfile.initials}
              </div>
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>{activeProfile.name}</h2>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 24 }}>{activeProfile.role}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg-deep)' }}>
                  <GraduationCap size={16} style={{ color: 'var(--fg-muted)' }} /> Built from real student pain points
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg-deep)' }}>
                  <Rocket size={16} style={{ color: 'var(--fg-muted)' }} /> Shipping fast, iterating weekly
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg-deep)' }}>
                  <BadgeCheck size={16} style={{ color: 'var(--fg-muted)' }} /> Based in {activeProfile.location}
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                "{activeProfile.quote}"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why I Started */}
      <section className="section-sm">
        <div className="container-narrow">
          <div className="reveal">
            <h2 style={{ fontSize: 36, marginBottom: 24 }}>Why I Started Planorah</h2>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.7 }}>
              I was doing everything students are told to do: taking notes, setting goals, building timetables, and trying productivity apps. But I still felt scattered. The real issue was not motivation. It was system friction.
            </p>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.7 }}>
              Most tools require students to be project managers of their own lives. That adds overhead instead of removing it. I wanted a product where students could think less about organizing and more about executing.
            </p>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginBottom: 32, lineHeight: 1.7 }}>
              Planorah is my answer: a product that turns messy thoughts into structured action, then pushes consistency with clear feedback loops.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>Founder Principles</h2>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', maxWidth: 600, margin: '0 auto' }}>
              The product decisions at Planorah are driven by these operating principles.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {principles.map((item, i) => (
              <div key={i} className="card reveal-scale" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="section-sm">
        <div className="container-narrow">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36 }}>Journey So Far</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {journey.map((item, i) => (
              <div key={i} className="card reveal-scale" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: 'var(--fg-deep)', flexShrink: 0 }}>
                  {item.period}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
