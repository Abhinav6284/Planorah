import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PublishResearch() {
    const publishers = [
        {
            name: 'ResearchGate',
            description: 'Share your research, connect with peers, and get citations. Perfect for all academic fields.',
            url: 'https://www.researchgate.net/',
            icon: '🔬',
            color: 'from-teal-500 to-cyan-600',
            category: 'All Fields'
        },
        {
            name: 'arXiv',
            description: 'Open access repository for preprints in physics, mathematics, computer science, and more.',
            url: 'https://arxiv.org/',
            icon: '📄',
            color: 'from-red-500 to-orange-600',
            category: 'Science & CS'
        },
        {
            name: 'PubMed Central',
            description: 'Free full-text archive of biomedical and life sciences journal literature.',
            url: 'https://www.ncbi.nlm.nih.gov/pmc/',
            icon: '🏥',
            color: 'from-blue-500 to-indigo-600',
            category: 'Medical'
        },
        {
            name: 'SSRN',
            description: 'Social Science Research Network - leading repository for social sciences and humanities.',
            url: 'https://www.ssrn.com/',
            icon: '📊',
            color: 'from-purple-500 to-pink-600',
            category: 'Commerce & Social'
        },
        {
            name: 'Academia.edu',
            description: 'Platform for academics to share research papers and track analytics.',
            url: 'https://www.academia.edu/',
            icon: '🎓',
            color: 'from-gray-600 to-gray-800',
            category: 'All Fields'
        },
        {
            name: 'Google Scholar',
            description: 'Create your scholar profile and track your publications and citations.',
            url: 'https://scholar.google.com/',
            icon: '📚',
            color: 'from-blue-400 to-blue-600',
            category: 'All Fields'
        },
        {
            name: 'IEEE Xplore',
            description: 'Digital library for engineering, computer science, and related disciplines.',
            url: 'https://ieeexplore.ieee.org/',
            icon: '⚡',
            color: 'from-indigo-500 to-purple-600',
            category: 'Engineering & CS'
        },
        {
            name: 'Springer',
            description: 'Major international publisher of books, e-books, and peer-reviewed journals.',
            url: 'https://www.springer.com/',
            icon: '📖',
            color: 'from-yellow-500 to-orange-500',
            category: 'All Fields'
        }
    ];

    const tips = [
        'Choose a journal that matches your research scope and audience',
        'Follow the publisher\'s formatting guidelines carefully',
        'Get your paper peer-reviewed before submission',
        'Include proper citations and avoid plagiarism',
        'Consider open-access journals for wider reach'
    ];

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
                {/* Back Button */}
                <Link
                    to="/lab"
                    className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Lab
                </Link>

                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-medium text-gray-900 dark:text-white mb-2">Publish Research</h1>
                    <p className="text-gray-500 dark:text-gray-400">Submit your research papers to trusted academic publishers and repositories.</p>
                </header>

                {/* Tips Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 mb-10 text-white"
                >
                    <h2 className="text-xl font-bold mb-4">📝 Publication Tips</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                                <span className="text-white/60">•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Publishers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {publishers.map((publisher, index) => (
                        <motion.a
                            key={publisher.name}
                            href={publisher.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${publisher.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                {publisher.icon}
                            </div>

                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full mb-3">
                                {publisher.category}
                            </span>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{publisher.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{publisher.description}</p>

                            <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                                Visit Site
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
}
