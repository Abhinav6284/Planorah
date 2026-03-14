"use client";

import { CSSProperties, useEffect, useState } from "react";
import {
  addDomain,
  deleteDomain,
  getDomainInstructions,
  listDomains,
  verifyDomain,
} from "../../lib/api";
import type { CustomDomain, DomainInstructions } from "../../lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getToken(): string {
  // Reads the JWT stored by your auth flow.
  // Adjust the key name if your app uses a different one.
  if (typeof window === "undefined") return "";
  return localStorage.getItem("access_token") ?? sessionStorage.getItem("access_token") ?? "";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: verified ? "#dcfce7" : "#fef9c3",
        color: verified ? "#166534" : "#854d0e",
      }}
    >
      {verified ? "✓ Verified" : "⏳ Pending"}
    </span>
  );
}

function InstructionsPanel({
  instructions,
  onClose,
}: {
  instructions: DomainInstructions;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 20,
        marginTop: 16,
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          background: "none",
          border: "none",
          fontSize: 18,
          cursor: "pointer",
          color: "#64748b",
        }}
        aria-label="Close instructions"
      >
        ×
      </button>
      <h4 style={{ margin: "0 0 12px", fontSize: 15 }}>
        DNS Setup — <code style={{ fontSize: 13 }}>{instructions.domain}</code>
      </h4>

      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#475569" }}>
        Add <strong>one</strong> of these records at your domain registrar, then click{" "}
        <strong>Check DNS</strong>.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#e2e8f0" }}>
            {["Option", "Type", "Name", "Value"].map((h) => (
              <th
                key={h}
                style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "6px 10px", color: "#475569" }}>A (recommended for apex)</td>
            <td style={{ padding: "6px 10px" }}>A</td>
            <td style={{ padding: "6px 10px" }}>
              <code>@</code>
            </td>
            <td style={{ padding: "6px 10px" }}>
              <code>{instructions.a_record_ip}</code>
            </td>
          </tr>
          <tr style={{ background: "#f1f5f9" }}>
            <td style={{ padding: "6px 10px", color: "#475569" }}>CNAME (for www subdomains)</td>
            <td style={{ padding: "6px 10px" }}>CNAME</td>
            <td style={{ padding: "6px 10px" }}>
              <code>{instructions.cname_name}</code>
            </td>
            <td style={{ padding: "6px 10px" }}>
              <code>{instructions.cname_value}</code>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
        DNS propagation can take up to 48 hours. Once done, click{" "}
        <strong>Check DNS</strong> to verify.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CustomDomainManager() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // domain string currently in flight
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<DomainInstructions | null>(null);

  // ── Load domains on mount ────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("You must be signed in to manage custom domains.");
      setLoading(false);
      return;
    }

    listDomains(token)
      .then(setDomains)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function flash(msg: string, kind: "error" | "success") {
    if (kind === "error") {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 6000);
  }

  // ── Add domain ───────────────────────────────────────────────────────────
  async function handleAdd() {
    const trimmed = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!trimmed) return;
    setActionLoading("add");
    try {
      const domain = await addDomain(getToken(), trimmed);
      setDomains((prev) => [domain, ...prev]);
      setNewDomain("");
      flash(`'${domain.domain}' added. Now set your DNS records.`, "success");
      // Auto-show instructions
      const instr = await getDomainInstructions(getToken(), domain.domain);
      setInstructions(instr);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to add domain", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Verify domain ────────────────────────────────────────────────────────
  async function handleVerify(domain: string) {
    setActionLoading(domain);
    try {
      const updated = await verifyDomain(getToken(), domain);
      setDomains((prev) => prev.map((d) => (d.domain === domain ? updated : d)));
      flash(`'${domain}' verified successfully! 🎉`, "success");
      setInstructions(null);
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Show DNS instructions ────────────────────────────────────────────────
  async function handleShowInstructions(domain: string) {
    if (instructions?.domain === domain) {
      setInstructions(null);
      return;
    }
    setActionLoading(domain);
    try {
      const instr = await getDomainInstructions(getToken(), domain);
      setInstructions(instr);
    } catch {
      flash("Could not load instructions.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Delete domain ────────────────────────────────────────────────────────
  async function handleDelete(domain: string) {
    if (!window.confirm(`Remove '${domain}' from your account?`)) return;
    setActionLoading(domain);
    try {
      await deleteDomain(getToken(), domain);
      setDomains((prev) => prev.filter((d) => d.domain !== domain));
      if (instructions?.domain === domain) setInstructions(null);
      flash(`'${domain}' removed.`, "success");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to remove domain", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <p style={{ color: "#94a3b8", padding: "8px 0" }}>Loading domains…</p>;
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ color: "#475569", marginBottom: 16, fontSize: 14 }}>
        Connect your own domain (e.g. <code>abhinavgoyal.dev</code>) so visitors can reach your
        portfolio directly. After adding, follow the DNS instructions and click{" "}
        <strong>Check DNS</strong> to activate.
      </p>

      {/* ── Alert banner ── */}
      {(error || success) && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 13,
            background: error ? "#fef2f2" : "#f0fdf4",
            color: error ? "#b91c1c" : "#15803d",
            border: `1px solid ${error ? "#fca5a5" : "#86efac"}`,
          }}
        >
          {error ?? success}
        </div>
      )}

      {/* ── Add domain form ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="yourdomain.com"
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newDomain.trim() || actionLoading === "add"}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: !newDomain.trim() || actionLoading === "add" ? "not-allowed" : "pointer",
            opacity: !newDomain.trim() || actionLoading === "add" ? 0.6 : 1,
          }}
        >
          {actionLoading === "add" ? "Adding…" : "Add Domain"}
        </button>
      </div>

      {/* ── Domain list ── */}
      {domains.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>No custom domains yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {domains.map((d) => (
            <li
              key={d.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "12px 16px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {/* Left: domain + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{d.domain}</span>
                  <StatusBadge verified={d.verified} />
                </div>

                {/* Right: action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {!d.verified && (
                    <>
                      <button
                        onClick={() => handleShowInstructions(d.domain)}
                        disabled={actionLoading === d.domain}
                        style={outlineBtn}
                      >
                        {instructions?.domain === d.domain ? "Hide Instructions" : "Setup DNS"}
                      </button>
                      <button
                        onClick={() => handleVerify(d.domain)}
                        disabled={actionLoading === d.domain}
                        style={primaryBtn}
                      >
                        {actionLoading === d.domain ? "Checking…" : "Check DNS"}
                      </button>
                    </>
                  )}
                  {d.verified && (
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...outlineBtn, textDecoration: "none", lineHeight: "20px" }}
                    >
                      Visit ↗
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(d.domain)}
                    disabled={actionLoading === d.domain}
                    style={dangerBtn}
                    aria-label={`Remove ${d.domain}`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Inline instructions panel */}
              {instructions?.domain === d.domain && (
                <InstructionsPanel
                  instructions={instructions}
                  onClose={() => setInstructions(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared button styles
// ---------------------------------------------------------------------------

const baseBtn: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "opacity 0.15s",
};

const primaryBtn: CSSProperties = {
  ...baseBtn,
  background: "#111827",
  color: "#fff",
  border: "none",
};

const outlineBtn: CSSProperties = {
  ...baseBtn,
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
};

const dangerBtn: CSSProperties = {
  ...baseBtn,
  background: "#fff",
  color: "#b91c1c",
  border: "1px solid #fca5a5",
  fontWeight: 700,
  lineHeight: "14px",
};
