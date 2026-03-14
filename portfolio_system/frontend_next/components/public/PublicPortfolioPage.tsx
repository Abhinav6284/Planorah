import type { PublicPortfolio, PortfolioProject } from "../../lib/types";

const AVAILABILITY_LABELS: Record<string, string> = {
  open: "Open to opportunities",
  interviewing: "Interviewing",
  not_looking: "Not actively looking",
};

function SocialLinks({ portfolio }: { portfolio: PublicPortfolio }) {
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
          style={{ color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          {label}
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: "0 0 6px" }}>{project.display_title}</h3>
      <p style={{ margin: "0 0 10px", color: "#475569", fontSize: 14 }}>{project.display_description}</p>
      {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {project.tech_stack.map((t) => (
            <span key={t} style={{ background: "#f1f5f9", borderRadius: 6, padding: "2px 8px", fontSize: 12 }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
        {project.demo_url && <a href={project.demo_url} target="_blank" rel="noopener noreferrer">Live Demo</a>}
        {project.project_url && !project.demo_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer">View Project</a>}
      </div>
    </article>
  );
}

export default function PublicPortfolioPage({ portfolio }: { portfolio: PublicPortfolio }) {
  const skills: string[] = Array.isArray(portfolio.skills) ? portfolio.skills : [];
  const projects: PortfolioProject[] = Array.isArray(portfolio.projects) ? portfolio.projects : [];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <section style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 4 }}>{portfolio.display_name || portfolio.title}</h1>
        {portfolio.headline && <p style={{ marginTop: 0, color: "#475569", fontSize: 18 }}>{portfolio.headline}</p>}
        {portfolio.location && <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>📍 {portfolio.location}</p>}
        {portfolio.availability_status && (
          <p style={{ margin: "4px 0", fontSize: 13, color: "#16a34a" }}>
            {AVAILABILITY_LABELS[portfolio.availability_status] ?? portfolio.availability_status}
          </p>
        )}
        {portfolio.bio && <p style={{ marginTop: 16 }}>{portfolio.bio}</p>}
        <SocialLinks portfolio={portfolio} />
        {portfolio.primary_cta_label && portfolio.primary_cta_url && (
          <a href={portfolio.primary_cta_url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-block", marginTop: 14,
              background: "#6366f1", color: "#fff",
              padding: "10px 22px", borderRadius: 8, textDecoration: "none", fontWeight: 600,
            }}>
            {portfolio.primary_cta_label}
          </a>
        )}
      </section>

      {skills.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((skill) => (
              <span key={skill} style={{ border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: 999, fontSize: 13 }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2>Projects</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
