import React from 'react';
import { parseSkillsInput, stringifySkills } from './portfolioEditorUtils';

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-colors text-sm';
const inputErrCls = 'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-red-400 dark:border-red-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-red-500 outline-none transition-colors text-sm';

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>;
}

export default function GeneralTab({ portfolio, onFieldChange, fieldErrors = {} }) {
  const cls = (field) => fieldErrors[field] ? inputErrCls : inputCls;
  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-5">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Portfolio Title</label>
            <input
              name="title"
              value={portfolio?.title || ''}
              onChange={(e) => onFieldChange('title', e.target.value)}
              className={cls('title')}
              placeholder="My Developer Portfolio"
            />
            <FieldError error={fieldErrors.title} />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Display Name</label>
            <input
              name="display_name"
              value={portfolio?.display_name || ''}
              onChange={(e) => onFieldChange('display_name', e.target.value)}
              className={cls('display_name')}
              placeholder="John Doe"
            />
            <FieldError error={fieldErrors.display_name} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Headline</label>
              <input
                name="headline"
                value={portfolio?.headline || ''}
                onChange={(e) => onFieldChange('headline', e.target.value)}
                className={cls('headline')}
                placeholder="Full-Stack Developer | Open Source Enthusiast"
              />
              <FieldError error={fieldErrors.headline} />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Location</label>
              <input
                name="location"
                value={portfolio?.location || ''}
                onChange={(e) => onFieldChange('location', e.target.value)}
                className={cls('location')}
                placeholder="Bangalore, India"
              />
              <FieldError error={fieldErrors.location} />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Availability</label>
            <select
              value={portfolio?.availability_status || 'open'}
              onChange={(e) => onFieldChange('availability_status', e.target.value)}
              className={cls('availability_status')}
            >
              <option value="open">Open to opportunities</option>
              <option value="interviewing">Interviewing</option>
              <option value="not_looking">Not actively looking</option>
            </select>
            <FieldError error={fieldErrors.availability_status} />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Skills</label>
            <input
              value={stringifySkills(portfolio?.skills)}
              onChange={(e) => onFieldChange('skills', parseSkillsInput(e.target.value))}
              className={cls('skills')}
              placeholder="React, Node.js, Django, AWS"
            />
            <FieldError error={fieldErrors.skills} />
            {!fieldErrors.skills && <p className="text-xs text-gray-400 mt-1.5">Comma-separated skills shown on your public page.</p>}
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Bio</label>
            <textarea
              name="bio"
              value={portfolio?.bio || ''}
              onChange={(e) => onFieldChange('bio', e.target.value)}
              rows={6}
              className={`${cls('bio')} resize-none`}
              placeholder="Tell visitors about your background, impact, and what roles you are targeting..."
            />
            <FieldError error={fieldErrors.bio} />
          </div>
        </div>
      </div>
    </div>
  );
}
