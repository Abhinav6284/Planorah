export type PublicProject = {
  title: string;
  short_description: string;
  github_url?: string | null;
  live_url?: string | null;
  technologies: string[];
  image_urls: string[];
};

export type PublicPortfolio = {
  username: string;
  slug: string;
  title: string;
  headline: string;
  bio: string;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  skills: { name: string; category: string; level: string }[];
  projects: PublicProject[];
  certificates: { title: string; issuer: string }[];
  social_links: { platform: string; url: string }[];
  theme: Record<string, string>;
};
