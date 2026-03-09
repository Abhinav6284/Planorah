import type { PublicPortfolio } from "../../lib/types";

export default function PublicPortfolioPage({ portfolio }: { portfolio: PublicPortfolio }) {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <section style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>{portfolio.title}</h1>
        <p style={{ marginTop: 0, color: "#475569" }}>{portfolio.headline}</p>
        <p>{portfolio.bio}</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2>Skills</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {portfolio.skills.map((skill) => (
            <span
              key={skill.name}
              style={{ border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: 999 }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2>Projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {portfolio.projects.map((project) => (
            <article key={project.title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
              <h3>{project.title}</h3>
              <p>{project.short_description}</p>
              <p style={{ color: "#64748b" }}>{project.technologies.join(", ")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {project.github_url && <a href={project.github_url}>GitHub</a>}
                {project.live_url && <a href={project.live_url}>Live Demo</a>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Certificates</h2>
        <ul>
          {portfolio.certificates.map((c) => (
            <li key={`${c.title}-${c.issuer}`}>
              {c.title} - {c.issuer}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
