import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioService } from '../../api/portfolioService';

export default function PublicPortfolio({ subdomain }) {
    const { slug } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchPortfolio();
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [slug, subdomain]);

    const fetchPortfolio = async () => {
        try {
            const data = subdomain
                ? await portfolioService.getPublicBySubdomain(subdomain)
                : await portfolioService.getPublicBySlug(slug);
            setPortfolio(data);
        } catch (err) {
            console.error('Failed to fetch portfolio:', err);
            setError('Portfolio not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">Loading Experience</p>
                </div>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Portfolio Offline</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">This portfolio might be private or hasn't been set up yet. Check back later!</p>
                    <a href="https://planorah.me" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors inline-block">
                        Build Your Own
                    </a>
                </div>
            </div>
        );
    }

    const theme = portfolio.theme === 'minimal' ? {
        bg: 'bg-white',
        text: 'text-gray-900',
        subtext: 'text-gray-500',
        card: 'bg-gray-50/50 border-gray-200',
        header: 'bg-white/80 border-gray-200',
        button: 'bg-black text-white'
    } : {
        bg: 'bg-[#050505]',
        text: 'text-white',
        subtext: 'text-gray-400',
        card: 'bg-white/[0.03] border-white/5',
        header: 'bg-[#050505]/80 border-white/5',
        button: 'bg-white text-black'
    };

    return (
        <div className={`min-h-screen ${theme.bg} selection:bg-purple-500/30`}>
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? theme.header + ' backdrop-blur-xl py-4' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-sm">{portfolio.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className={`font-bold tracking-tight ${theme.text}`}>{portfolio.title || portfolio.username}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#about" className={`text-sm font-medium ${theme.subtext} hover:${theme.text} transition-colors`}>About</a>
                            <a href="#projects" className={`text-sm font-medium ${theme.subtext} hover:${theme.text} transition-colors`}>Projects</a>
                        </nav>
                        <a
                            href={`mailto:${portfolio.email || '#'}`}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${theme.button} hover:scale-105 active:scale-95`}
                        >
                            Hire Me
                        </a>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20">
                {/* Hero */}
                <section className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-12 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-widest mb-6 border border-purple-500/20">
                                    Software Engineer & Visionary
                                </span>
                                <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black ${theme.text} mb-8 tracking-tight leading-[0.9]`}>
                                    Designing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">future</span> of tech.
                                </h1>
                                <p className={`text-lg md:text-xl ${theme.subtext} mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium`}>
                                    {portfolio.headline || "Transforming complex challenges into elegant solutions. Welcome to my creative laboratory where code meets design."}
                                </p>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    {portfolio.github_url && (
                                        <a href={portfolio.github_url} target="_blank" rel="noreferrer" className={`group flex items-center gap-2 p-3 rounded-2xl ${theme.card} border transition-all hover:border-white/20 hover:scale-105`}>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                            <span className={`text-sm font-semibold ${theme.text}`}>GitHub</span>
                                        </a>
                                    )}
                                    {portfolio.linkedin_url && (
                                        <a href={portfolio.linkedin_url} target="_blank" rel="noreferrer" className={`group flex items-center gap-2 p-3 rounded-2xl ${theme.card} border transition-all hover:border-white/20 hover:scale-105`}>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                            <span className={`text-sm font-semibold ${theme.text}`}>LinkedIn</span>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                {portfolio.bio && (
                    <section id="about" className="max-w-6xl mx-auto px-6 mb-32">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                                <div className={`relative p-8 rounded-[2rem] ${theme.card} border backdrop-blur-sm`}>
                                    <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>My Story</h2>
                                    <p className={`${theme.subtext} leading-relaxed text-lg whitespace-pre-wrap`}>
                                        {portfolio.bio}
                                    </p>
                                </div>
                            </motion.div>
                            <div className="flex flex-col gap-8">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <h3 className={`text-xs font-bold text-gray-500 uppercase tracking-widest mb-4`}>Specialization</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(portfolio.projects?.[0]?.tech_stack || ["React", "Node", "TypeScript", "Python", "Cloud Architecture"]).slice(0, 10).map((skill, i) => (
                                            <span key={i} className={`px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-medium ${theme.text}`}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects Grid */}
                {portfolio.projects && portfolio.projects.length > 0 && (
                    <section id="projects" className="max-w-6xl mx-auto px-6">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className={`text-4xl md:text-5xl font-black ${theme.text} mb-4`}>Crafted Projects</h2>
                                <p className={`${theme.subtext} text-lg`}>A curated selection of my most impactful works.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {portfolio.projects.map((project, index) => (
                                <motion.div
                                    key={project.id || index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group relative p-8 rounded-[2.5rem] ${theme.card} border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    </div>
                                    <div className="relative h-full flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            {project.is_featured && (
                                                <span className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-tighter rounded-full">Starred</span>
                                            )}
                                            <span className="px-3 py-1 bg-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-white/10">{project.project_type || 'Custom'}</span>
                                        </div>
                                        <h3 className={`text-3xl font-bold ${theme.text} mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-500 transition-all duration-500`}>
                                            {project.display_title || project.title}
                                        </h3>
                                        <p className={`${theme.subtext} mb-8 leading-relaxed line-clamp-3 text-lg font-medium`}>
                                            {project.display_description || project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-10 overflow-hidden h-9">
                                            {project.tech_stack?.map((tech, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none flex items-center">{tech}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex items-center gap-4">
                                            {project.github_url && (
                                                <a href={project.github_url} target="_blank" rel="noreferrer" className={`flex-1 group/btn relative flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white hover:text-black`}>
                                                    <span className="text-sm font-black uppercase tracking-widest">Source</span>
                                                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </a>
                                            )}
                                            {project.demo_url && (
                                                <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className={`py-12 border-t ${theme.card} backdrop-blur-md`}>
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="flex flex-col items-center gap-8 text-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black">P</div>
                            <span className={`text-xl font-bold tracking-tighter ${theme.text}`}>Planorah.</span>
                        </div>
                        <p className={`text-sm font-bold tracking-widest uppercase ${theme.subtext}`}>
                            Crafted with passion using <a href="https://planorah.me" className="text-white hover:text-purple-400 transition-colors">Planorah</a>
                        </p>
                        <div className="flex gap-8">
                            {portfolio.github_url && <a href={portfolio.github_url} className={`text-sm font-bold uppercase tracking-widest ${theme.subtext} hover:${theme.text} transition-colors`}>GitHub</a>}
                            {portfolio.linkedin_url && <a href={portfolio.linkedin_url} className={`text-sm font-bold uppercase tracking-widest ${theme.subtext} hover:${theme.text} transition-colors`}>LinkedIn</a>}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.subtext} opacity-30 mt-8`}>
                            &copy; {new Date().getFullYear()} {portfolio.username} &mdash; All Rights Under Control
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
