export type PublicProject = {
  title: string;
  short_description: string;
  github_url?: string | null;
  live_url?: string | null;
  image_url?: string | null;
};

export type PublicPortfolio = {
  username: string;
  slug: string;
  title: string;
  headline: string;
  bio: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  skills: { id: number; name: string; category: string; level: string; sort_order: number }[];
  projects: PublicProject[];
  certificates: { id: number; title: string; issuer: string; issue_date?: string | null; image_url?: string | null; certificate_url?: string | null }[];
  social_links: { id: number; platform: string; url: string }[];
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
