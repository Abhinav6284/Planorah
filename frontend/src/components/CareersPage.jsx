import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Globe, HeartHandshake, Rocket, Sparkles, Users } from 'lucide-react';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('.reveal,.reveal-fade,.reveal-scale')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const roles = [
  {
    title: "Frontend Engineer (React)",
    mode: "Remote",
    type: "Full-time",
    level: "1-3 years",
    summary: "Build polished student-facing experiences across onboarding, productivity flows, and public marketing pages.",
    skills: ["React", "CSS", "UX polish", "Performance"],
  },
  {
    title: "Backend Engineer (Django)",
    mode: "Remote",
    type: "Full-time",
    level: "2-4 years",
    summary: "Design robust APIs for planning intelligence, scheduling, and analytics with reliability at scale.",
    skills: ["Django", "PostgreSQL", "API design", "Async jobs"],
  },
  {
    title: "Product Designer",
    mode: "Remote",
    type: "Contract",
    level: "1-3 years",
    summary: "Craft thoughtful product journeys that turn complex planning workflows into intuitive, motivating interactions.",
    skills: ["Figma", "Design systems", "User research", "Interaction design"],
  },
  {
    title: "Developer Relations Intern",
    mode: "Hybrid",
    type: "Internship",
    level: "Students welcome",
    summary: "Create educational content, guides, and demos that help students adopt Planorah effectively.",
    skills: ["Content", "Community", "Teaching", "Technical writing"],
  },
];

const values = [
  {
    icon: Rocket,
    title: "Ship Fast, Learn Faster",
    description: "We prefer momentum with feedback over perfect plans that never launch.",
  },
  {
    icon: HeartHandshake,
    title: "Student Impact First",
    description: "Every feature decision should improve real student outcomes, not vanity metrics.",
  },
  {
    icon: Users,
    title: "High Ownership, Low Ego",
    description: "We solve problems together and let data, craft, and user feedback lead decisions.",
  },
];

export default function CareersPage() {
  useScrollReveal();
  const navigate = useNavigate();

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Careers</div>
          <h1 className="reveal" style={{ marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
            Build the future of student execution.
          </h1>
          <p className="reveal" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto', color: 'var(--fg-muted)' }}>
            We are building an AI-native academic planning platform used by students to turn ambition into consistent action. If you care about meaningful product impact, we should talk.
          </p>
          <div className="reveal" style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <a href="mailto:careers@planorah.me" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Apply via Email <ArrowRight size={16} />
            </a>
            <button className="btn btn-plain" onClick={() => navigate('/contact')}>
              Contact Team
            </button>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="section">
        <div className="container-narrow">
          <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Briefcase size={24} color="var(--fg-muted)" />
            <h2 style={{ fontSize: 28, margin: 0 }}>Open Roles</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {roles.map((role, i) => (
              <div key={i} className="card reveal-scale" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--surface)', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: 'var(--fg-deep)' }}>{role.type}</span>
                  <span style={{ background: 'var(--light-gray)', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)' }}>{role.mode}</span>
                  <span style={{ background: 'var(--light-gray)', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)' }}>{role.level}</span>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12, color: 'var(--fg-deep)' }}>{role.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>{role.summary}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {role.skills.map(skill => (
                    <span key={skill} style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, fontSize: 11, color: 'var(--fg-muted)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <a href={`mailto:careers@planorah.me?subject=Application - ${role.title}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)', textDecoration: 'none' }}>
                  Apply for this role <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-sm">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32 }}>How we work</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="card reveal-scale" style={{ padding: 32 }}>
                  <div style={{ background: 'var(--surface)', display: 'inline-flex', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                    <Icon size={24} color="var(--fg-deep)" />
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 12 }}>{value.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* General application CTA */}
      <section className="section">
        <div className="container-narrow">
          <div className="reveal reveal-scale" style={{ background: 'var(--surface)', borderRadius: 24, padding: 48, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 28, marginBottom: 12 }}>Not seeing your role?</h2>
              <p style={{ fontSize: 15, color: 'var(--fg-muted)' }}>We are always interested in meeting builders who care about student outcomes and product excellence.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
              <a href="mailto:careers@planorah.me?subject=General Application" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Send General Application <ArrowRight size={16} />
              </a>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={14} /> Remote-friendly across time zones
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
