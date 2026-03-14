import { headers } from "next/headers";
import { notFound } from "next/navigation";

import PublicPortfolioPage from "../../../components/public/PublicPortfolioPage";
import { fetchPortfolioByHost } from "../../../lib/api";

/**
 * This page is never navigated to directly by users.
 * It is only reached when the Next.js middleware rewrites the root path of a
 * verified custom domain (e.g. "abhinavgoyal.dev/") to "/p/_custom".
 *
 * The middleware puts the original hostname in the "x-custom-domain" request
 * header so we can forward it to FastAPI, which resolves the portfolio.
 */
export const revalidate = 60;

export default async function CustomDomainPortfolioPage() {
  const headersList = headers();
  // The middleware sets this; fall back to the raw "host" if somehow missing
  const customDomain =
    headersList.get("x-custom-domain") ||
    (headersList.get("host") ?? "").split(":")[0];

  if (!customDomain) {
    notFound();
  }

  try {
    const portfolio = await fetchPortfolioByHost(customDomain);
    return <PublicPortfolioPage portfolio={portfolio} />;
  } catch {
    notFound();
  }
}
