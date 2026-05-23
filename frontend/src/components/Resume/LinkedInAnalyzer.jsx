import React, { useState } from 'react';
import client from '../../api/client';
import { useToast } from '../common/Toast';

const LinkedInAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const toast = useToast();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await client.post('resume/analyze-linkedin/', { linkedin_url: url });
      setResults(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">LinkedIn Profile Analyzer</h1>
      <p className="text-gray-600 mb-8">Enter your LinkedIn profile URL to get AI-powered insights and improvement suggestions.</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleAnalyze} className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Analyzing...' : 'Analyze Profile'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p>Scraping profile and generating AI insights...</p>
          <p className="text-sm mt-2">This may take up to a minute.</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {results.raw_profile && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-6">
              {results.raw_profile.profilePicture && (
                <img 
                  src={results.raw_profile.profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{results.raw_profile.fullName}</h2>
                <p className="text-lg text-gray-600">{results.raw_profile.headline}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Score</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">{results.overall_score}/100</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Summary</h3>
              <p className="text-gray-700 leading-relaxed">{results.profile_summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <span className="text-xl">✓</span> Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths?.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-green-900">
                    <span className="mt-1 flex-shrink-0 text-green-600">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚠</span> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {results.weaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-red-900">
                    <span className="mt-1 flex-shrink-0 text-red-600">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Actionable Suggestions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {results.suggestions?.map((suggestion, i) => (
                <div key={i} className="p-6">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                    {suggestion.section}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Current</h4>
                      <div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap text-sm border border-gray-200">
                        {suggestion.current || "Not provided/empty"}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Suggested Improvement</h4>
                      <div className="bg-blue-50 p-4 rounded-md text-blue-900 whitespace-pre-wrap text-sm border border-blue-200">
                        {suggestion.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInAnalyzer;
