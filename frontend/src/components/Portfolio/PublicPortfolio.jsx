import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portfolioService } from '../../api/portfolioService';

const templateMap = {
  default: {
    page: 'bg-[#050505]',
    text: 'text-white',
    subtext: 'text-gray-400',
    card: 'bg-white/[0.03] border-white/10',
    badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    buttonPrimary: 'bg-white text-black hover:bg-gray-200',
    buttonSecondary: 'bg-transparent text-white border border-white/20 hover:bg-white/10',
    accentGradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
  minimal: {
    page: 'bg-white',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    card: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    buttonPrimary: 'bg-black text-white hover:bg-gray-800',
    buttonSecondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100',
    accentGradient: 'from-blue-500 via-cyan-500 to-emerald-500',
  },
  professional: {
    page: 'bg-slate-950',
    text: 'text-slate-100',
    subtext: 'text-slate-300',
    card: 'bg-slate-900 border-slate-800',
    badge: 'bg-emerald-900/40 text-emerald-200 border-emerald-500/30',
    buttonPrimary: 'bg-emerald-500 text-slate-900 hover:bg-emerald-400',
    buttonSecondary: 'bg-transparent text-slate-100 border border-slate-600 hover:bg-slate-800',
    accentGradient: 'from-emerald-500 via-cyan-500 to-blue-500',
  },
  creative: {
    page: 'bg-gradient-to-br from-rose-950 via-indigo-950 to-black',
    text: 'text-white',
    subtext: 'text-indigo-200',
    card: 'bg-white/10 border-white/20 backdrop-blur-md',
    badge: 'bg-fuchsia-500/20 text-fuchsia-100 border-fuchsia-300/40',
    buttonPrimary: 'bg-fuchsia-500 text-white hover:bg-fuchsia-400',
    buttonSecondary: 'bg-transparent text-white border border-white/30 hover:bg-white/10',
    accentGradient: 'from-fuchsia-500 via-rose-500 to-orange-400',
  },
};

function setMetaTag(selector, value) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    if (selector.startsWith('meta[name="')) {
      tag.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
    } else if (selector.startsWith('meta[property="')) {
      tag.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value || '');
}

export default function PublicPortfolio({ subdomain }) {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const portfolioKey = subdomain || slug;
  const appHomeUrl = window.location.origin;
  const theme = useMemo(() => templateMap[portfolio?.theme] || templateMap.default, [portfolio]);

  const trackEvent = async (eventType, extra = {}) => {
    if (!portfolio?.slug) return;
    try {
      await portfolioService.trackEvent({
        slug: portfolio.slug,
        event_type: eventType,
        ...extra,
      });
    } catch (err) {
      // Silent by design: tracking should never break UX.
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = subdomain
          ? await portfolioService.getPublicBySubdomain(subdomain)
          : await portfolioService.getPublicBySlug(slug);
        setPortfolio(data);
      } catch (err) {
        setError('Portfolio not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [slug, subdomain]);

  useEffect(() => {
    if (!portfolio) return;

    const title = portfolio.seo_title || `${portfolio.display_name || portfolio.username} - Portfolio`;
    const description =
      portfolio.seo_description ||
      portfolio.headline ||
      'Portfolio built with Planorah';

    document.title = title;
    setMetaTag('meta[name="description"]', description);
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:type"]', 'website');
    setMetaTag('meta[property="og:url"]', portfolio.public_url || window.location.href);
    if (portfolio.og_image_url) {
      setMetaTag('meta[property="og:image"]', portfolio.og_image_url);
    }

    trackEvent('page_view');
  }, [portfolioKey, portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">Loading Portfolio</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-3">Portfolio Offline</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">This portfolio is private, unpublished, or unavailable.</p>
          <a href={appHomeUrl} className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors inline-block">
            Build Your Own
          </a>
        </div>
      </div>
    );
  }

  const displayName = portfolio.display_name || portfolio.title || portfolio.username;
  const headline = portfolio.headline || 'Building reliable software products.';
  const ctaLabel = portfolio.primary_cta_label || 'Contact';
  const ctaHref = portfolio.primary_cta_url || (portfolio.email ? `mailto:${portfolio.email}` : null);
  const skills = Array.isArray(portfolio.skills) ? portfolio.skills : [];
  const projects = Array.isArray(portfolio.projects) ? portfolio.projects : [];

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <header className={`border-b ${theme.card}`}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{(displayName || 'P').charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className={`text-sm font-semibold ${theme.text}`}>{displayName}</p>
              <p className={`text-xs ${theme.subtext}`}>{portfolio.location || 'Remote'}</p>
            </div>
          </div>
          <a href={appHomeUrl} className={`text-xs uppercase tracking-widest ${theme.subtext} hover:opacity-80`}>
            Built with Planorah
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <section className="grid lg:grid-cols-12 gap-10 mb-14">
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border ${theme.badge}`}>
              {portfolio.availability_status === 'open' ? 'Open to opportunities' : portfolio.availability_status.replace('_', ' ')}
            </span>
            <h1 className={`mt-5 text-4xl md:text-6xl font-black leading-[1.05] ${theme.text}`}>
              {displayName}
            </h1>
            <p className={`mt-4 text-lg md:text-2xl font-medium ${theme.subtext}`}>{headline}</p>
            {portfolio.bio && (
              <p className={`mt-6 max-w-3xl text-base leading-relaxed ${theme.subtext} whitespace-pre-wrap`}>
                {portfolio.bio}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {ctaHref && (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('cta_click', { target_url: ctaHref })}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${theme.buttonPrimary}`}
                >
                  {ctaLabel}
                </a>
              )}
              {portfolio.resume_url && (
                <a
                  href={portfolio.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('resume_click', { target_url: portfolio.resume_url })}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${theme.buttonSecondary}`}
                >
                  View Resume
                </a>
              )}
            </div>
          </motion.div>

          <div className="lg:col-span-4 space-y-3">
            {[
              { label: 'GitHub', url: portfolio.github_url },
              { label: 'LinkedIn', url: portfolio.linkedin_url },
              { label: 'Twitter / X', url: portfolio.twitter_url },
              { label: 'Website', url: portfolio.website_url },
            ]
              .filter((item) => item.url)
              .map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('cta_click', { target_url: item.url })}
                  className={`block w-full p-4 rounded-2xl border ${theme.card} ${theme.text} hover:opacity-90 transition-opacity`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={`text-xs truncate mt-1 ${theme.subtext}`}>{item.url}</p>
                </a>
              ))}
          </div>
        </section>

        {skills.length > 0 && (
          <section className="mb-14">
            <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${theme.card} ${theme.text}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className={`text-2xl md:text-3xl font-bold ${theme.text}`}>Projects</h2>
            <span className={`text-sm ${theme.subtext}`}>{projects.length} items</span>
          </div>

          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5">
              {projects.map((project, index) => {
                const projectTitle = project.display_title || project.project_title || project.title;
                const projectDescription = project.display_description || project.project_description || project.description;
                const sourceUrl = project.github_url || project.project_url || project.demo_url;
                return (
                  <motion.article
                    key={project.id || `${projectTitle}-${index}`}
                    className={`p-5 rounded-2xl border ${theme.card}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.06, 0.35) }}
                  >
                    <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>{projectTitle}</h3>
                    {projectDescription && (
                      <p className={`text-sm leading-relaxed mb-4 ${theme.subtext}`}>{projectDescription}</p>
                    )}
                    {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tech_stack.slice(0, 6).map((tech) => (
                          <span key={tech} className={`px-2 py-1 rounded-lg text-[11px] ${theme.card} ${theme.subtext}`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          trackEvent('project_click', {
                            target_url: sourceUrl,
                            project_id: project.id,
                          })
                        }
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${theme.text} hover:opacity-80`}
                      >
                        Open Project
                        <span>→</span>
                      </a>
                    )}
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className={`p-10 rounded-2xl border text-center ${theme.card}`}>
              <p className={`${theme.subtext}`}>No projects published yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
