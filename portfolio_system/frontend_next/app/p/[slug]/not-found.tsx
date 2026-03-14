export default function PortfolioNotFound() {
  return (
    <main style={{ maxWidth: 600, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ fontSize: 48, margin: "0 0 8px" }}>404</h1>
      <p style={{ color: "#475569", fontSize: 18 }}>
        This portfolio doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
      <a href="/" style={{ marginTop: 24, display: "inline-block", color: "#6366f1" }}>
        ← Back to home
      </a>
    </main>
  );
}
