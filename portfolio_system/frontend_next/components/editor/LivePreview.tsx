type LivePreviewProps = {
  title: string;
  headline: string;
  bio: string;
};

export default function LivePreview({ title, headline, bio }: LivePreviewProps) {
  return (
    <aside
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 14,
        padding: 16,
        background: "#0f172a",
        color: "#f8fafc"
      }}
    >
      <h3 style={{ margin: 0 }}>{title || "Portfolio Title"}</h3>
      <p style={{ marginTop: 8, color: "#94a3b8" }}>{headline || "Headline preview"}</p>
      <p style={{ marginTop: 12, color: "#cbd5e1" }}>{bio || "Bio preview"}</p>
    </aside>
  );
}
