/** Shape returned by Django's /api/portfolio/public/{slug}/ endpoint */
export type PortfolioProject = {
  id: number;
  project_type: string;
  display_title: string;
  display_description: string;
  tech_stack: string[];
  github_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  project_url?: string | null;
};

export type PublicPortfolio = {
  slug: string;
  username: string;
  title: string;
  display_name: string;
  headline: string;
  bio: string;
  location: string;
  availability_status: string;
  /** Skills stored as a flat string array (Django JSONField) */
  skills: string[];
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
  resume_url: string;
  primary_cta_label: string;
  primary_cta_url: string;
  email: string | null;
  theme: string;
  projects: PortfolioProject[];
  status: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  public_url: string;
};

export type CustomDomain = {
  id: number;
  domain: string;
  verified: boolean;
  created_at: string;
};

export type DomainInstructions = {
  domain: string;
  cname_name: string;
  cname_value: string;
  a_record_ip: string;
  verified: boolean;
  instructions: string;
};
