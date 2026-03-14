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

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = (forwardedHost || request.headers.get("host") || "").split(",")[0]?.trim() || "";
  return hostHeader.split(":")[0].toLowerCase();
}

/** Return true when the hostname is entirely unrelated to planorah.me — i.e. a user custom domain. */
function isCustomDomain(hostname: string): boolean {
  if (!hostname || LOCAL_HOSTS.has(hostname)) return false;
  if (hostname === ROOT_DOMAIN) return false;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) return false;
  return true;
}

function resolveSubdomainSlug(hostname: string): string | null {
  if (!hostname || LOCAL_HOSTS.has(hostname)) {
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
  const hostname = getRequestHostname(request);
  const { pathname } = request.nextUrl;

  // ── Custom domain (e.g. abhinavgoyal.dev) ──────────────────────────────
  // We only serve the root path as the portfolio page; all other paths
  // (assets, _next, api) pass through unchanged.
  if (isCustomDomain(hostname) && (pathname === "/" || pathname === "")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/p/_custom";

    // Forward the original host to the SSR page so it can query FastAPI
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-custom-domain", hostname);

    return NextResponse.rewrite(rewriteUrl, { request: { headers: reqHeaders } });
  }

  // ── Planorah subdomain (e.g. alice.planorah.me) ────────────────────────
  if (pathname !== "/") {
    return NextResponse.next();
  }

  const slug = resolveSubdomainSlug(hostname);
  if (!slug) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/p/${slug}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
