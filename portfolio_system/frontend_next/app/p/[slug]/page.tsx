import { notFound } from "next/navigation";
import PublicPortfolioPage from "../../../components/public/PublicPortfolioPage";
import { fetchPublicPortfolio } from "../../../lib/api";

export const revalidate = 300;

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const data = await fetchPublicPortfolio(params.slug);
  if (!data) notFound();
  return <PublicPortfolioPage portfolio={data} />;
}
