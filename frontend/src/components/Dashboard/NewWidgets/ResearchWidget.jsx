import React from 'react';

const ResearchWidget = ({ userField = '' }) => {
    // Determine which platforms to show based on field
    const isMedical = userField.toLowerCase().includes('medical') || userField.toLowerCase().includes('life');
    const isScience = userField.toLowerCase().includes('science') || userField.toLowerCase().includes('physics') || userField.toLowerCase().includes('chemistry');
    const isCommerce = userField.toLowerCase().includes('commerce') || userField.toLowerCase().includes('account');

    const platforms = [
        {
            name: 'ResearchGate',
            description: 'Connect with researchers worldwide',
            url: 'https://www.researchgate.net/',
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.121 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .078.53 3.193 3.193 0 0 0 .112.437c.244.744.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93.042-.37.063-.81.063-1.314 0-.5-.02-.94-.063-1.312-.042-.372-.1-.695-.177-.93-.234-.734-.603-1.26-1.175-1.65-.57-.39-1.306-.603-2.105-.603zM5.3 3.407c-.168.168-.32.354-.437.554a3.267 3.267 0 0 0-.27.628 3.98 3.98 0 0 0-.124.678c-.03.24-.045.483-.045.73 0 .246.015.49.045.73.03.238.07.464.124.678.054.212.146.424.27.628.117.2.27.386.437.554.336.336.756.593 1.252.756.497.164 1.074.246 1.726.246.652 0 1.23-.082 1.726-.246.497-.163.916-.42 1.253-.756.336-.336.593-.756.756-1.253.164-.497.246-1.074.246-1.726 0-.247-.014-.49-.044-.73a3.98 3.98 0 0 0-.124-.678 3.267 3.267 0 0 0-.27-.628 2.224 2.224 0 0 0-.437-.554 2.637 2.637 0 0 0-.756-.756 2.637 2.637 0 0 0-1.253-.246H6.556c-.652 0-1.23.082-1.726.246a2.637 2.637 0 0 0-.756.756z" />
                </svg>
            ),
            color: 'from-teal-500 to-cyan-600'
        },
        {
            name: 'Google Scholar',
            description: 'Search academic papers & citations',
            url: 'https://scholar.google.com/',
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
                </svg>
            ),
            color: 'from-blue-500 to-indigo-600'
        },
        {
            name: 'Academia.edu',
            description: 'Share your research papers',
            url: 'https://www.academia.edu/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'from-gray-600 to-gray-800'
        }
    ];

    // Add field-specific platforms
    if (isMedical) {
        platforms.push({
            name: 'PubMed',
            description: 'Medical & life sciences research',
            url: 'https://pubmed.ncbi.nlm.nih.gov/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            color: 'from-red-500 to-pink-600'
        });
    }

    if (isScience) {
        platforms.push({
            name: 'arXiv',
            description: 'Open access to scientific papers',
            url: 'https://arxiv.org/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'from-orange-500 to-red-600'
        });
    }

    if (isCommerce) {
        platforms.push({
            name: 'SSRN',
            description: 'Social science research network',
            url: 'https://www.ssrn.com/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'from-purple-500 to-indigo-600'
        });
    }

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">🔬</span>
                    Research Hub
                </h3>
            </div>

            <div className="space-y-3">
                {platforms.slice(0, 4).map((platform, index) => (
                    <a
                        key={index}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {platform.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{platform.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{platform.description}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ResearchWidget;
