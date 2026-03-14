import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../api/portfolioService';
import { useSubscription } from '../../context/SubscriptionContext';
import GeneralTab from './editor/GeneralTab';
import SocialTab from './editor/SocialTab';
import ProjectsTab from './editor/ProjectsTab';
import SettingsTab from './editor/SettingsTab';
import PreviewPanel from './editor/PreviewPanel';
import CompletenessCard from './editor/CompletenessCard';
import { getLocalCompleteness, parseFieldErrors, tabs, updatePayloadFromPortfolio } from './editor/portfolioEditorUtils';

function getStatusBadge(portfolio) {
  if (!portfolio) return { badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', label: 'Loading' };
  const statuses = {
    active: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: '● Live' },
    grace: { badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: '● Grace Period' },
    read_only: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: '● Free Plan' },
    archived: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: '○ Archived' },
  };
  return statuses[portfolio.status] || statuses.archived;
}

export default function PortfolioEditorV2() {
  const { canAccess } = useSubscription();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [dirty, setDirty] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [completeness, setCompleteness] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const autosaveTimerRef = useRef(null);
  const isAutosavingRef = useRef(false);

  const portfolioRootDomain = process.env.REACT_APP_PORTFOLIO_ROOT_DOMAIN ||
    ((window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
      ? 'localhost'
      : 'planorah.me');

  const publicUrl = useMemo(() => {
    if (!portfolio) return '';
    return portfolio.public_url || `${window.location.origin}/p/${portfolio.slug}`;
  }, [portfolio]);
  const portfolioUrl = publicUrl.replace(/^https?:\/\//, '');
  const statusInfo = getStatusBadge(portfolio);

  const refreshCompleteness = useCallback(async (currentPortfolio = null) => {
    try {
      const data = await portfolioService.getCompleteness();
      setCompleteness(data);
    } catch (err) {
      if (currentPortfolio) setCompleteness(getLocalCompleteness(currentPortfolio));
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getMyPortfolio();
      setPortfolio(data);
      await refreshCompleteness(data);
    } catch (err) {
      setError('Failed to load portfolio settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [refreshCompleteness]);

  useEffect(() => {
    fetchPortfolio();
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [fetchPortfolio]);

  const handleFieldChange = (field, value) => {
    setPortfolio((prev) => {
      const next = { ...prev, [field]: value };
      setCompleteness(getLocalCompleteness(next));
      return next;
    });
    // Clear the error for this field as soon as the user edits it
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
    setDirty(true);
    setAutosaveStatus('Unsaved changes');
  };

  const savePortfolio = async ({ autosave = false } = {}) => {
    if (!portfolio) return;
    const payload = updatePayloadFromPortfolio(portfolio);
    try {
      if (autosave) {
        isAutosavingRef.current = true;
        setAutosaveStatus('Autosaving...');
        const result = await portfolioService.autosave(payload);
        setPortfolio(result.portfolio);
        setAutosaveStatus('All changes autosaved');
      } else {
        setSaving(true);
        await portfolioService.updateSettings(payload);
        setMessage({ type: 'success', text: 'Changes saved!' });
        setTimeout(() => setMessage(null), 2500);
      }
      setDirty(false);
      await refreshCompleteness();
    } catch (err) {
      const backendError = err.response?.data;
      const parsed = parseFieldErrors(backendError);
      const hasFieldErrors = Object.keys(parsed).filter((k) => k !== '_general').length > 0;

      if (hasFieldErrors) {
        // Show inline field errors and switch to the relevant tab
        setFieldErrors(parsed);
        const fieldToTab = {
          title: 'general', display_name: 'general', headline: 'general',
          location: 'general', bio: 'general', skills: 'general', availability_status: 'general',
          github_url: 'social', linkedin_url: 'social', twitter_url: 'social',
          website_url: 'social', resume_url: 'social',
          primary_cta_label: 'social', primary_cta_url: 'social',
          seo_title: 'settings', seo_description: 'settings', og_image_url: 'settings',
          show_email: 'settings', theme: 'settings',
        };
        const firstErrorField = Object.keys(parsed).find((k) => k !== '_general' && fieldToTab[k]);
        if (firstErrorField) setActiveTab(fieldToTab[firstErrorField]);
        if (autosave) {
          setAutosaveStatus('Fix highlighted fields');
        } else {
          setMessage({ type: 'error', text: 'Please fix the highlighted fields.' });
          setTimeout(() => setMessage(null), 4000);
        }
      } else {
        const text =
          parsed._general ||
          (typeof backendError === 'string' ? backendError : null) ||
          'Failed to save changes.';
        if (autosave) {
          setAutosaveStatus('Autosave failed');
        } else {
          setMessage({ type: 'error', text });
          setTimeout(() => setMessage(null), 4000);
        }
      }
    } finally {
      setSaving(false);
      isAutosavingRef.current = false;
    }
  };

  useEffect(() => {
    if (!dirty || !portfolio) return;
    if (isAutosavingRef.current) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      savePortfolio({ autosave: true });
    }, 1500);
  }, [dirty, portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    await savePortfolio({ autosave: false });
  };

  const handlePublishToggle = async (nextState) => {
    if (!portfolio) return;
    setPublishing(true);
    try {
      const response = await portfolioService.publish(nextState);
      setPortfolio(response.portfolio);
      setCompleteness(response.completeness || getLocalCompleteness(response.portfolio));
      setMessage({
        type: 'success',
        text: nextState ? 'Portfolio published successfully.' : 'Portfolio unpublished.',
      });
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      const apiCompleteness = err.response?.data?.completeness;
      if (apiCompleteness) setCompleteness(apiCompleteness);
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update publish state.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleSetSubdomain = async () => {
    if (!newSubdomain) return;
    setSubdomainLoading(true);
    try {
      const data = await portfolioService.setSubdomain(newSubdomain);
      setPortfolio(data);
      setNewSubdomain('');
      setMessage({ type: 'success', text: 'Subdomain updated successfully.' });
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update subdomain.' });
    } finally {
      setSubdomainLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400">{error || 'Failed to load portfolio.'}</p>
          <button
            onClick={fetchPortfolio}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-2xl hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          <div>
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans">
      <div className="bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">{portfolio?.username?.charAt(0).toUpperCase() || 'P'}</span>
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-white font-semibold text-base">{portfolio?.title || 'My Portfolio'}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.badge}`}>{statusInfo.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${portfolio.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {portfolio.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePublishToggle(!portfolio.is_published)}
                disabled={publishing}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                {publishing ? 'Updating...' : portfolio.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Your Portfolio URL</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{portfolioUrl}</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Copy URL"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{autosaveStatus}</p>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Visit
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-white/10 -mx-6 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {activeTab === 'general' && (
              <GeneralTab portfolio={portfolio} onFieldChange={handleFieldChange} fieldErrors={fieldErrors} />
            )}
            {activeTab === 'social' && (
              <SocialTab portfolio={portfolio} onFieldChange={handleFieldChange} fieldErrors={fieldErrors} />
            )}
            {activeTab === 'projects' && (
              <ProjectsTab portfolio={portfolio} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                portfolio={portfolio}
                onFieldChange={handleFieldChange}
                fieldErrors={fieldErrors}
                canUseSubdomain={true}
                portfolioRootDomain={portfolioRootDomain}
                newSubdomain={newSubdomain}
                onNewSubdomainChange={(value) => setNewSubdomain(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                onSetSubdomain={handleSetSubdomain}
                subdomainLoading={subdomainLoading}
              />
            )}
          </div>
          <div className="lg:col-span-1 space-y-4">
            <CompletenessCard completeness={completeness} />
            <PreviewPanel portfolio={portfolio} portfolioUrl={portfolioUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
