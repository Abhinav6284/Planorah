import PublicPortfolioPage from "../../../components/public/PublicPortfolioPage";
import { fetchPublicPortfolio, trackPortfolioView } from "../../../lib/api";

export const revalidate = 300;

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const data = await fetchPublicPortfolio(params.slug);
  trackPortfolioView(params.slug).catch(() => undefined);
  return <PublicPortfolioPage portfolio={data} />;
}
