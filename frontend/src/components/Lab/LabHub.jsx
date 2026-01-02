import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VscVscode } from 'react-icons/vsc';

export default function LabHub() {
    const labs = [
        {
            id: 'codespace',
            title: 'CodeSpace IDE',
            description: 'A full VS Code-like IDE experience with file explorer, terminal, extensions marketplace, Git source control, and multi-language code execution.',
            icon: <VscVscode className="w-12 h-12" />,
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            link: '/lab/codespace',
            badge: 'VS Code'
        },
        {
            id: 'resources',
            title: 'Resource Hub',
            description: 'Curated collection of learning tools, simulations, and references.',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            link: '/lab/resources'
        },
        {
            id: 'publish',
            title: 'Publish Research',
            description: 'Submit your research papers to trusted academic publishers and repositories worldwide.',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
            link: '/lab/publish',
            badge: 'New'
        }
    ];

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-medium text-gray-900 dark:text-white mb-2">Zen Lab</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your virtual playground for experimentation and discovery.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {labs.map((lab) => (
                        <Link key={lab.id} to={lab.link} className="group">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden"
                            >
                                {lab.badge && (
                                    <span className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
                                        {lab.badge}
                                    </span>
                                )}
                                <div className={`w-20 h-20 rounded-2xl ${lab.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {lab.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{lab.title}</h2>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{lab.description}</p>

                                <div className="mt-8 flex items-center gap-2 font-medium text-sm uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-gray-300">
                                    Enter Lab
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
