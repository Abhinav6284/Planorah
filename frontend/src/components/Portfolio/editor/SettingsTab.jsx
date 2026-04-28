import React from 'react';

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-charcoalDark border border-gray-200 dark:border-charcoalMuted rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-colors text-sm';
const inputErrCls = 'w-full px-4 py-2.5 bg-white dark:bg-charcoalDark border border-red-400 dark:border-red-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-red-500 outline-none transition-colors text-sm';

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>;
}

export default function SettingsTab({
  portfolio,
  onFieldChange,
  fieldErrors = {},
  canUseSubdomain,
  portfolioRootDomain,
  newSubdomain,
  onNewSubdomainChange,
  onSetSubdomain,
  subdomainLoading,
}) {
  const cls = (field) => fieldErrors[field] ? inputErrCls : inputCls;
  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-5">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-charcoalDark/50 border border-gray-100 dark:border-white/10 rounded-2xl">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium text-sm">Show Email</h4>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Display your email on portfolio</p>
            </div>
            <button
              onClick={() => onFieldChange('show_email', !portfolio?.show_email)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                portfolio?.show_email ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-charcoalMuted'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  portfolio?.show_email ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Portfolio Template</label>
            <select
              name="theme"
              value={portfolio?.theme || 'default'}
              onChange={(e) => onFieldChange('theme', e.target.value)}
              className={inputCls}
            >
              <option value="default">Default Dark</option>
              <option value="minimal">Minimal</option>
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-5">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">SEO Title</label>
            <input
              name="seo_title"
              value={portfolio?.seo_title || ''}
              onChange={(e) => onFieldChange('seo_title', e.target.value)}
              className={cls('seo_title')}
              placeholder="John Doe - Full Stack Developer"
            />
            <FieldError error={fieldErrors.seo_title} />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">SEO Description</label>
            <textarea
              name="seo_description"
              value={portfolio?.seo_description || ''}
              onChange={(e) => onFieldChange('seo_description', e.target.value)}
              rows={3}
              className={`${cls('seo_description')} resize-none`}
              placeholder="Portfolio of John Doe with featured projects and contact details."
            />
            <FieldError error={fieldErrors.seo_description} />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">OG Image URL</label>
            <input
              name="og_image_url"
              value={portfolio?.og_image_url || ''}
              onChange={(e) => onFieldChange('og_image_url', e.target.value)}
              className={cls('og_image_url')}
              placeholder="https://example.com/og-image.png"
            />
            <FieldError error={fieldErrors.og_image_url} />
          </div>
        </div>
      </div>

      {canUseSubdomain && (
        <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-5">Custom Subdomain</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Claim your subdomain</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-white dark:bg-charcoalDark border border-gray-200 dark:border-charcoalMuted rounded-xl overflow-hidden focus-within:border-indigo-400 transition-colors">
                  <input
                    value={newSubdomain}
                    onChange={(e) => onNewSubdomainChange(e.target.value)}
                    placeholder={portfolio?.custom_subdomain || 'your-name'}
                    className="flex-1 bg-transparent px-4 py-2.5 text-gray-900 dark:text-white text-sm outline-none"
                  />
                  <span className="px-3 py-2.5 bg-gray-50 dark:bg-charcoal text-gray-400 text-xs border-l border-gray-200 dark:border-charcoalMuted">
                    .{portfolioRootDomain}
                  </span>
                </div>
                <button
                  onClick={onSetSubdomain}
                  disabled={subdomainLoading || !newSubdomain}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 text-sm"
                >
                  {subdomainLoading ? '...' : 'Claim'}
                </button>
              </div>
              <p className="mt-2 text-gray-400 text-xs">Once claimed, your portfolio will be live at this address.</p>
            </div>

            {portfolio?.custom_subdomain && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Subdomain</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{portfolio.custom_subdomain}.{portfolioRootDomain}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
