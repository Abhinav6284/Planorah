import React from 'react';

const themeMap = {
  default: {
    body: 'bg-black',
    text: 'text-white',
    subtext: 'text-gray-400',
    chip: 'bg-gray-900/70',
  },
  minimal: {
    body: 'bg-white',
    text: 'text-gray-900',
    subtext: 'text-gray-500',
    chip: 'bg-gray-100',
  },
  professional: {
    body: 'bg-slate-900',
    text: 'text-slate-100',
    subtext: 'text-slate-300',
    chip: 'bg-slate-800',
  },
  creative: {
    body: 'bg-gradient-to-br from-rose-950 via-indigo-950 to-black',
    text: 'text-white',
    subtext: 'text-indigo-200',
    chip: 'bg-white/10',
  },
};

export default function PreviewPanel({ portfolio, portfolioUrl }) {
  const theme = themeMap[portfolio?.theme] || themeMap.default;
  const displayName = portfolio?.display_name || portfolio?.title || 'Your Name';
  const headline = portfolio?.headline || 'Your headline here';
  const bio = portfolio?.bio || '';
  const projects = portfolio?.portfolio_projects || [];
  const skills = Array.isArray(portfolio?.skills) ? portfolio.skills : [];

  return (
    <div className="sticky top-6">
      <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="px-4 py-3 bg-[#1C1C1E] border-b border-white/10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-gray-500 text-xs font-mono truncate flex-1">{portfolioUrl}</span>
        </div>
        <div className={`p-6 min-h-[420px] ${theme.body}`}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {(displayName || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className={`${theme.text} font-semibold mb-1`}>{displayName}</h3>
            <p className={`${theme.subtext} text-sm mb-4`}>{headline}</p>
            {portfolio?.location && (
              <p className={`${theme.subtext} text-xs mb-4`}>{portfolio.location}</p>
            )}

            {skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {skills.slice(0, 6).map((skill) => (
                  <span key={skill} className={`px-2 py-1 rounded-lg text-[11px] ${theme.chip} ${theme.text}`}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {bio && (
              <div className={`text-left p-3 rounded-xl ${theme.chip}`}>
                <p className={`${theme.subtext} text-xs line-clamp-3`}>{bio}</p>
              </div>
            )}

            {projects.length > 0 && (
              <div className="mt-4 text-left">
                <p className={`${theme.subtext} text-xs mb-2`}>Featured Projects</p>
                <div className="space-y-2">
                  {projects.slice(0, 2).map((project) => (
                    <div key={project.id} className={`p-2 rounded-lg ${theme.chip}`}>
                      <p className={`${theme.text} text-xs font-medium truncate`}>
                        {project.display_title || project.project_title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-3">Live preview</p>
    </div>
  );
}
