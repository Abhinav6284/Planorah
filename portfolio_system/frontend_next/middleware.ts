import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ROOT_DOMAIN = (process.env.PORTFOLIO_ROOT_DOMAIN || "planorah.me").toLowerCase();
const RESERVED_SUBDOMAINS = new Set(
  (process.env.PORTFOLIO_RESERVED_SUBDOMAINS || "www,api,voice,portfolio,app")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const PORTFOLIO_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/;

function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = (forwardedHost || request.headers.get("host") || "").split(",")[0]?.trim() || "";
  return hostHeader.split(":")[0].toLowerCase();
}

function resolveSubdomainSlug(hostname: string): string | null {
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  const hostParts = hostname.split(".");
  const rootParts = ROOT_DOMAIN.split(".");

  if (hostParts.length !== rootParts.length + 1) {
    return null;
  }

  const hostRoot = hostParts.slice(-rootParts.length).join(".");
  if (hostRoot !== ROOT_DOMAIN) {
    return null;
  }

  const candidate = hostParts[0];
  if (RESERVED_SUBDOMAINS.has(candidate)) {
    return null;
  }

  if (!PORTFOLIO_SLUG_REGEX.test(candidate)) {
    return null;
  }

  return candidate;
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const slug = resolveSubdomainSlug(getRequestHostname(request));
  if (!slug) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/p/${slug}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/"],
};
