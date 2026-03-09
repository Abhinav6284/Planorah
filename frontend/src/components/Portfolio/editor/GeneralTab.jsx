import React from 'react';
import { parseSkillsInput, stringifySkills } from './portfolioEditorUtils';

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-colors text-sm';

export default function GeneralTab({ portfolio, onFieldChange }) {
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
              className={inputCls}
              placeholder="My Developer Portfolio"
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Display Name</label>
            <input
              name="display_name"
              value={portfolio?.display_name || ''}
              onChange={(e) => onFieldChange('display_name', e.target.value)}
              className={inputCls}
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Headline</label>
              <input
                name="headline"
                value={portfolio?.headline || ''}
                onChange={(e) => onFieldChange('headline', e.target.value)}
                className={inputCls}
                placeholder="Full-Stack Developer | Open Source Enthusiast"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Location</label>
              <input
                name="location"
                value={portfolio?.location || ''}
                onChange={(e) => onFieldChange('location', e.target.value)}
                className={inputCls}
                placeholder="Bangalore, India"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Availability</label>
            <select
              value={portfolio?.availability_status || 'open'}
              onChange={(e) => onFieldChange('availability_status', e.target.value)}
              className={inputCls}
            >
              <option value="open">Open to opportunities</option>
              <option value="interviewing">Interviewing</option>
              <option value="not_looking">Not actively looking</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Skills</label>
            <input
              value={stringifySkills(portfolio?.skills)}
              onChange={(e) => onFieldChange('skills', parseSkillsInput(e.target.value))}
              className={inputCls}
              placeholder="React, Node.js, Django, AWS"
            />
            <p className="text-xs text-gray-400 mt-1.5">Comma-separated skills shown on your public page.</p>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Bio</label>
            <textarea
              name="bio"
              value={portfolio?.bio || ''}
              onChange={(e) => onFieldChange('bio', e.target.value)}
              rows={6}
              className={`${inputCls} resize-none`}
              placeholder="Tell visitors about your background, impact, and what roles you are targeting..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
