import type { PublicPortfolio } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE || "http://localhost:8000/v1";

export async function fetchPublicPortfolio(slug: string): Promise<PublicPortfolio> {
  const res = await fetch(`${API_BASE}/public/portfolio/${slug}`, {
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return res.json();
}
