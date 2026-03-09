import React from 'react';

const labels = {
  title: 'Portfolio title',
  display_name: 'Display name',
  headline: 'Headline',
  bio: 'Bio',
  primary_cta: 'Primary CTA',
  social_link: 'GitHub or LinkedIn',
  projects: 'At least one project',
};

export default function CompletenessCard({ completeness }) {
  if (!completeness) return null;

  const missing = completeness.missing_required_fields || [];
  const ready = Boolean(completeness.is_publish_ready);
  const score = completeness.score || 0;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Publish Readiness</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${ready ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
          {ready ? 'Ready' : 'Incomplete'}
        </span>
      </div>
      <div className="mb-3">
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">{score}% complete</p>
      </div>
      {missing.length > 0 && (
        <ul className="space-y-1">
          {missing.map((field) => (
            <li key={field} className="text-xs text-gray-500 dark:text-gray-400">
              • Missing: {labels[field] || field}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
