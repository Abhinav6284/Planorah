import type { PublicPortfolio, PortfolioProject } from "../../lib/types";

// ---------------------------------------------------------------------------
// Theme definitions — mirrors the templateMap in the React app
// ---------------------------------------------------------------------------
const THEMES: Record<string, {
  page: React.CSSProperties;
  text: React.CSSProperties;
  subtext: React.CSSProperties;
  card: React.CSSProperties;
  badge: React.CSSProperties;
  buttonPrimary: React.CSSProperties;
  accentColor: string;
}> = {
  default: {
    page: { backgroundColor: "#050505", color: "#ffffff" },
    text: { color: "#ffffff" },
    subtext: { color: "#9ca3af" },
    card: { backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" },
    badge: { backgroundColor: "rgba(99,102,241,0.2)", color: "#c7d2fe", border: "1px solid rgba(99,102,241,0.3)" },
    buttonPrimary: { backgroundColor: "#ffffff", color: "#000000" },
    accentColor: "#6366f1",
  },
  minimal: {
    page: { backgroundColor: "#ffffff", color: "#111827" },
    text: { color: "#111827" },
    subtext: { color: "#4b5563" },
    card: { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" },
    badge: { backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
    buttonPrimary: { backgroundColor: "#000000", color: "#ffffff" },
    accentColor: "#3b82f6",
  },
  professional: {
    page: { backgroundColor: "#020617", color: "#f1f5f9" },
    text: { color: "#f1f5f9" },
    subtext: { color: "#cbd5e1" },
    card: { backgroundColor: "#0f172a", border: "1px solid #1e293b" },
    badge: { backgroundColor: "rgba(16,185,129,0.15)", color: "#a7f3d0", border: "1px solid rgba(16,185,129,0.3)" },
    buttonPrimary: { backgroundColor: "#10b981", color: "#0f172a" },
    accentColor: "#10b981",
  },
  creative: {
    page: {
      background: "linear-gradient(135deg, #4c0519 0%, #1e1b4b 50%, #000000 100%)",
      color: "#ffffff",
    },
    text: { color: "#ffffff" },
    subtext: { color: "#a5b4fc" },
    card: { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" },
    badge: { backgroundColor: "rgba(217,70,239,0.2)", color: "#f5d0fe", border: "1px solid rgba(217,70,239,0.4)" },
    buttonPrimary: { backgroundColor: "#d946ef", color: "#ffffff" },
    accentColor: "#d946ef",
  },
};

const AVAILABILITY_LABELS: Record<string, string> = {
  open: "Open to opportunities",
  interviewing: "Interviewing",
  not_looking: "Not actively looking",
};

function SocialLinks({ portfolio, accentColor }: { portfolio: PublicPortfolio; accentColor: string }) {
  const links = [
    { label: "GitHub", url: portfolio.github_url },
    { label: "LinkedIn", url: portfolio.linkedin_url },
    { label: "Twitter", url: portfolio.twitter_url },
    { label: "Website", url: portfolio.website_url },
    { label: "Resume", url: portfolio.resume_url },
  ].filter((l) => l.url);

  if (!links.length) return null;
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
      {links.map(({ label, url }) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer"
          style={{ color: accentColor, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
          {label}
        </a>
      ))}
    </div>
  );
}

type ThemeSpec = typeof THEMES[string];

function ProjectCard({ project, t }: { project: PortfolioProject; t: ThemeSpec }) {
  return (
    <article style={{ borderRadius: 14, padding: 18, ...t.card }}>
      <h3 style={{ margin: "0 0 6px", fontSize: 16, ...t.text }}>{project.display_title}</h3>
      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5, ...t.subtext }}>{project.display_description}</p>
      {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {project.tech_stack.map((tech) => (
            <span key={tech} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, ...t.badge }}>{tech}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: t.accentColor, textDecoration: "none" }}>
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: t.accentColor, textDecoration: "none" }}>
            Live Demo
          </a>
        )}
        {project.project_url && !project.demo_url && (
          <a href={project.project_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: t.accentColor, textDecoration: "none" }}>
            View Project
          </a>
        )}
      </div>
    </article>
  );
}

export default function PublicPortfolioPage({ portfolio }: { portfolio: PublicPortfolio }) {
  const t = THEMES[portfolio.theme] ?? THEMES.default;
  const skills: string[] = Array.isArray(portfolio.skills) ? portfolio.skills : [];
  const projects: PortfolioProject[] = Array.isArray(portfolio.projects) ? portfolio.projects : [];
  const displayName = portfolio.display_name || portfolio.title;
  const ctaLabel = portfolio.primary_cta_label || "Contact";
  const ctaHref = portfolio.primary_cta_url || (portfolio.email ? `mailto:${portfolio.email}` : null);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "system-ui, sans-serif", ...t.page }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(128,128,128,0.2)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: t.accentColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 16,
            }}>
              {(displayName || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, ...t.text }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: 12, ...t.subtext }}>{portfolio.location || "Remote"}</p>
            </div>
          </div>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", ...t.subtext }}>
            Built with Planorah
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <section style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.1, ...t.text }}>
            {displayName}
          </h1>
          {portfolio.headline && (
            <p style={{ fontSize: 18, margin: "0 0 12px", ...t.subtext }}>{portfolio.headline}</p>
          )}
          {portfolio.availability_status && (
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 12, marginBottom: 16, ...t.badge }}>
              {AVAILABILITY_LABELS[portfolio.availability_status] ?? portfolio.availability_status}
            </span>
          )}
          {portfolio.bio && (
            <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 640, margin: "16px 0", ...t.subtext }}>{portfolio.bio}</p>
          )}

          {/* Social links */}
          <SocialLinks portfolio={portfolio} accentColor={t.accentColor} />

          {/* CTA */}
          {ctaLabel && ctaHref && (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", borderRadius: 10, fontWeight: 600, textDecoration: "none", ...t.buttonPrimary }}>
              {ctaLabel}
            </a>
          )}
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, ...t.text }}>Skills</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((skill) => (
                <span key={skill} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, ...t.badge }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, ...t.text }}>Projects</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} t={t} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
