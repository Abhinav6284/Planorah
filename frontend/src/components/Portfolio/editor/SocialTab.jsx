import React from 'react';

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-colors text-sm';
const inputErrCls = 'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-red-400 dark:border-red-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-red-500 outline-none transition-colors text-sm';

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>;
}

export default function SocialTab({ portfolio, onFieldChange, fieldErrors = {} }) {
  const cls = (field) => fieldErrors[field] ? inputErrCls : inputCls;

  const fields = [
    { name: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username' },
    { name: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { name: 'twitter_url', label: 'Twitter / X', placeholder: 'https://x.com/username' },
    { name: 'website_url', label: 'Website', placeholder: 'https://yourwebsite.com' },
    { name: 'resume_url', label: 'Resume URL', placeholder: 'https://example.com/resume.pdf' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-5">Social & Links</h3>
        <div className="space-y-4">
          {fields.map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                {label}
              </label>
              <input
                name={name}
                value={portfolio?.[name] || ''}
                onChange={(e) => onFieldChange(name, e.target.value)}
                className={cls(name)}
                placeholder={placeholder}
              />
              <FieldError error={fieldErrors[name]} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-5">Primary CTA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">CTA Label</label>
            <input
              name="primary_cta_label"
              value={portfolio?.primary_cta_label || ''}
              onChange={(e) => onFieldChange('primary_cta_label', e.target.value)}
              className={cls('primary_cta_label')}
              placeholder="Hire Me"
            />
            <FieldError error={fieldErrors.primary_cta_label} />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">CTA URL</label>
            <input
              name="primary_cta_url"
              value={portfolio?.primary_cta_url || ''}
              onChange={(e) => onFieldChange('primary_cta_url', e.target.value)}
              className={cls('primary_cta_url')}
              placeholder="https://example.com/contact"
            />
            <FieldError error={fieldErrors.primary_cta_url} />
          </div>
        </div>
      </div>
    </div>
  );
}
