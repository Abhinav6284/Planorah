export const tabs = [
  { id: 'general', label: 'General' },
  { id: 'social', label: 'Social Links' },
  { id: 'projects', label: 'Projects' },
  { id: 'settings', label: 'Settings' },
];

export const normalizeUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const parseSkillsInput = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 30);
};

export const stringifySkills = (skills) => {
  if (!Array.isArray(skills)) return '';
  return skills.join(', ');
};

export const updatePayloadFromPortfolio = (portfolio) => ({
  title: portfolio.title || '',
  display_name: portfolio.display_name || '',
  location: portfolio.location || '',
  availability_status: portfolio.availability_status || 'open',
  bio: portfolio.bio || '',
  headline: portfolio.headline || '',
  skills: Array.isArray(portfolio.skills) ? portfolio.skills : [],
  github_url: normalizeUrl(portfolio.github_url),
  linkedin_url: normalizeUrl(portfolio.linkedin_url),
  twitter_url: normalizeUrl(portfolio.twitter_url),
  website_url: normalizeUrl(portfolio.website_url),
  resume_url: normalizeUrl(portfolio.resume_url),
  primary_cta_label: portfolio.primary_cta_label || '',
  primary_cta_url: normalizeUrl(portfolio.primary_cta_url),
  seo_title: portfolio.seo_title || '',
  seo_description: portfolio.seo_description || '',
  og_image_url: normalizeUrl(portfolio.og_image_url),
  show_email: Boolean(portfolio.show_email),
  theme: portfolio.theme || 'default',
  settings_json: portfolio.settings_json || {},
});

export const getLocalCompleteness = (portfolio) => {
  const requiredChecks = [
    { field: 'title', pass: Boolean((portfolio.title || '').trim()) },
    { field: 'display_name', pass: Boolean((portfolio.display_name || '').trim()) },
    { field: 'headline', pass: Boolean((portfolio.headline || '').trim()) },
    { field: 'bio', pass: Boolean((portfolio.bio || '').trim()) },
    { field: 'primary_cta', pass: Boolean((portfolio.primary_cta_label || '').trim() && (portfolio.primary_cta_url || '').trim()) },
    { field: 'social_link', pass: Boolean((portfolio.github_url || '').trim() || (portfolio.linkedin_url || '').trim()) },
    { field: 'projects', pass: Array.isArray(portfolio.portfolio_projects) && portfolio.portfolio_projects.length > 0 },
  ];

  const optionalChecks = [
    { field: 'skills', pass: Array.isArray(portfolio.skills) && portfolio.skills.length > 0 },
    { field: 'resume_url', pass: Boolean((portfolio.resume_url || '').trim()) },
    { field: 'seo', pass: Boolean((portfolio.seo_title || '').trim() && (portfolio.seo_description || '').trim()) },
  ];

  const allChecks = [...requiredChecks, ...optionalChecks];
  const score = Math.round((allChecks.filter((item) => item.pass).length / allChecks.length) * 100);

  return {
    score,
    missing_required_fields: requiredChecks.filter((item) => !item.pass).map((item) => item.field),
    is_publish_ready: requiredChecks.every((item) => item.pass),
  };
};

