import PublicPortfolioPage from "../../../components/public/PublicPortfolioPage";
import { fetchPublicPortfolio } from "../../../lib/api";

export const revalidate = 300;

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const data = await fetchPublicPortfolio(params.slug);
  return <PublicPortfolioPage portfolio={data} />;
}
