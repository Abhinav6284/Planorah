import type { CustomDomain, DomainInstructions, PublicPortfolio } from "./types";

// Used for FastAPI portfolio-system endpoints (domain management, custom domain SSR)
const API_BASE = process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE || "http://localhost:8000/v1";

// Used for Django backend endpoints (actual portfolio data)
const DJANGO_API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_BASE || "https://api.planorah.me";

// ---------------------------------------------------------------------------
// Public portfolio by slug — served from Django backend
// ---------------------------------------------------------------------------

export async function fetchPublicPortfolio(slug: string): Promise<PublicPortfolio | null> {
  const res = await fetch(`${DJANGO_API_BASE}/api/portfolio/public/${slug}/`, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Portfolio fetch failed: ${res.status}`);

  return res.json();
}

// ---------------------------------------------------------------------------
// Public portfolio by custom domain (used by the _custom SSR page)
// The `host` value is passed as the Host header so the FastAPI middleware
// can resolve it to the correct user.
// ---------------------------------------------------------------------------

export async function fetchPortfolioByHost(host: string): Promise<PublicPortfolio> {
  // Use internal base (server-side only) if available, else fall back to public base
  const base = process.env.PORTFOLIO_API_INTERNAL_BASE || API_BASE;
  const res = await fetch(`${base}/public/domain-portfolio`, {
    headers: { host },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Custom domain portfolio not found");
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Domain management — authenticated (client-side, pass JWT token)
// ---------------------------------------------------------------------------

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function listDomains(token: string): Promise<CustomDomain[]> {
  const res = await fetch(`${API_BASE}/domains`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to list domains");
  return res.json();
}

export async function addDomain(token: string, domain: string): Promise<CustomDomain> {
  const res = await fetch(`${API_BASE}/domains`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ domain }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? "Failed to add domain");
  return data;
}

export async function verifyDomain(token: string, domain: string): Promise<CustomDomain> {
  const res = await fetch(`${API_BASE}/domains/verify`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ domain }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? "Verification failed");
  return data;
}

export async function deleteDomain(token: string, domain: string): Promise<void> {
  const res = await fetch(`${API_BASE}/domains/${encodeURIComponent(domain)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? "Failed to delete domain");
  }
}

export async function getDomainInstructions(
  token: string,
  domain: string
): Promise<DomainInstructions> {
  const res = await fetch(`${API_BASE}/domains/${encodeURIComponent(domain)}/instructions`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch instructions");
  return res.json();
}
