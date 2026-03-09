"use client";

import { useState } from "react";
import LivePreview from "./LivePreview";

const tabs = ["General", "Social Links", "Projects", "Skills", "Certificates", "Settings"];

export default function PortfolioEditor() {
  const [activeTab, setActiveTab] = useState("General");
  const [title, setTitle] = useState("My Portfolio");
  const [headline, setHeadline] = useState("Full Stack Developer");
  const [bio, setBio] = useState("Building products with measurable impact.");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, padding: 24 }}>
      <section>
        <h1>Portfolio Editor Dashboard</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "8px 12px",
                background: activeTab === tab ? "#111827" : "#fff",
                color: activeTab === tab ? "#fff" : "#111827"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "General" ? (
          <div style={{ display: "grid", gap: 10 }}>
            <label>Portfolio Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Headline</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} />

            <label>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} />
          </div>
        ) : (
          <p>{activeTab} management form goes here (connected to API).</p>
        )}
      </section>

      <LivePreview title={title} headline={headline} bio={bio} />
    </div>
  );
}
