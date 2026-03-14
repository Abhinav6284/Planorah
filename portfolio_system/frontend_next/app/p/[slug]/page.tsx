import { notFound } from "next/navigation";
import PublicPortfolioPage from "../../../components/public/PublicPortfolioPage";
import { fetchPublicPortfolio } from "../../../lib/api";

export const dynamic = 'force-dynamic'; // always SSR — no ISR cache so theme changes show immediately

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const data = await fetchPublicPortfolio(params.slug);
  if (!data) notFound();
  return <PublicPortfolioPage portfolio={data} />;
}
