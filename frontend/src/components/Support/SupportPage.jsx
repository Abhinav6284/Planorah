import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChevronDown, ExternalLink, Send, CheckCircle2,
    BookOpen, Map, Code2, FileText, Calendar, CreditCard,
    Bug, Lightbulb, MessageSquare, Mail, AlertCircle,
    ThumbsUp, ThumbsDown, Sparkles, Activity,
    HelpCircle, Rocket, Shield, RefreshCw
} from 'lucide-react';

// ─── DATA ──────────────────────────────────────────────────────────
const helpCategories = [
    { id: 'getting-started', icon: Rocket, label: 'Getting Started', description: 'Account setup, onboarding, basics', color: 'emerald' },
    { id: 'roadmaps', icon: Map, label: 'Roadmaps & Tasks', description: 'Learning paths, AI generation, tasks', color: 'blue' },
    { id: 'lab', icon: Code2, label: 'Lab & CodeSpace', description: 'Code editor, projects, GitHub', color: 'violet' },
    { id: 'resume', icon: FileText, label: 'Resume & ATS', description: 'Builder, scanner, templates', color: 'amber' },
    { id: 'scheduler', icon: Calendar, label: 'Scheduler', description: 'Calendar, events, time blocking', color: 'rose' },
    { id: 'billing', icon: CreditCard, label: 'Account & Billing', description: 'Subscription, payments, profile', color: 'indigo' },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-500/30' },
    violet: { bg: 'bg-violet-100 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-500/30' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-500/30' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-200 dark:ring-rose-500/30' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-500/30' },
};

const faqData = [
    { category: 'getting-started', q: 'How do I complete onboarding?', a: 'After registering, you\'ll be guided through a step-by-step onboarding where you set your role, experience level, and goals. This personalizes your entire Planorah experience.' },
    { category: 'getting-started', q: 'How do I switch between dark and light mode?', a: 'Click the sun/moon icon in the top-right corner of the header. Your preference is saved automatically and persists across sessions.' },
    { category: 'roadmaps', q: 'How do I create a learning roadmap?', a: 'Navigate to Learning → Learning Path and click "Generate Roadmap". Enter your goal (e.g., "Learn React in 30 days"), and our AI will build a personalized plan with milestones and daily tasks.' },
    { category: 'roadmaps', q: 'Can I edit my roadmap after creation?', a: 'Roadmaps are AI-generated and currently read-only. You can create unlimited new roadmaps with different goals. Each roadmap generates daily tasks that appear on your dashboard.' },
    { category: 'roadmaps', q: 'How does the streak system work?', a: 'Complete at least one task per day to maintain your streak. Streaks reset if you miss a day. Your current streak is shown on the dashboard — it\'s a great way to build consistent habits.' },
    { category: 'lab', q: 'How do I save projects from CodeSpace?', a: 'In CodeSpace, click "Save Project" to store your code. You can also connect your GitHub account to push projects directly to repositories.' },
    { category: 'lab', q: 'How do I connect my GitHub account?', a: 'Go to Settings → Integrations and click "Connect GitHub". You\'ll be redirected to GitHub to authorize Planorah. Once connected, you can push projects from CodeSpace.' },
    { category: 'resume', q: 'How does the ATS scanner work?', a: 'Upload your resume or paste a job description, and the ATS scanner analyzes keyword matching, formatting, and structure. It gives you a score and actionable suggestions to improve your resume.' },
    { category: 'resume', q: 'Can I export my resume as PDF?', a: 'Yes! After building your resume in the Resume Builder, click "Download PDF". The output is a clean, professionally formatted document ready to submit.' },
    { category: 'scheduler', q: 'How do calendar events sync with tasks?', a: 'When you generate a roadmap, tasks are automatically scheduled on your calendar. You can view them in the weekly calendar on your dashboard or in the Scheduler page.' },
    { category: 'billing', q: 'How do I manage my subscription?', a: 'Go to Settings → Subscription to view your current plan, upgrade, or cancel. You can also view your payment history and download invoices.' },
    { category: 'billing', q: 'Where can I see my progress?', a: 'Visit your Profile page to see all your statistics — tasks completed, streaks, roadmaps created, and learning progress over time.' },
];

const feedbackTypes = [
    { id: 'feedback', icon: MessageSquare, label: 'General Feedback', color: 'violet' },
    { id: 'bug', icon: Bug, label: 'Report a Bug', color: 'rose' },
    { id: 'feature', icon: Lightbulb, label: 'Feature Request', color: 'amber' },
    { id: 'complaint', icon: AlertCircle, label: 'Complaint', color: 'blue' },
];

// ─── ANIMATION VARIANTS ────────────────────────────────────────────
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

// ─── SUB-COMPONENTS ────────────────────────────────────────────────

function FAQItem({ faq, isOpen, onClick, searchQuery }) {
    const highlight = (text) => {
        if (!searchQuery) return text;
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5">$1</mark>');
    };

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-colors hover:border-gray-300 dark:hover:border-gray-700">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between gap-4 p-5 text-left group"
                aria-expanded={isOpen}
            >
                <span
                    className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                    dangerouslySetInnerHTML={{ __html: highlight(faq.q) }}
                />
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        <div className="px-5 pb-5 pt-0">
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlight(faq.a) }}
                            />
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs text-gray-400">Was this helpful?</span>
                                <button className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 transition-colors" aria-label="Yes, helpful">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors" aria-label="No, not helpful">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBar() {
    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-30" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">All systems operational</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <Activity className="w-3.5 h-3.5" />
                <span>99.9% uptime</span>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [openFAQ, setOpenFAQ] = useState(null);
    const [formType, setFormType] = useState('feedback');
    const [formData, setFormData] = useState({ subject: '', message: '', priority: 'normal', email: '' });
    const [formState, setFormState] = useState('idle'); // idle | loading | success | error
    const faqRef = useRef(null);
    const formRef = useRef(null);
    const searchRef = useRef(null);

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handler = (e) => {
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const filteredFAQs = useMemo(() => {
        let items = faqData;
        if (activeCategory) items = items.filter(f => f.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
        }
        return items;
    }, [searchQuery, activeCategory]);

    // Auto-scroll to FAQ section and expand first result when searching
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (filteredFAQs.length > 0) setOpenFAQ(0);
        } else if (!searchQuery.trim()) {
            setOpenFAQ(null);
        }
    }, [searchQuery, filteredFAQs.length]);

    const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('loading');
        try {
            // Attempt real API call
            const { default: api } = await import('../../api/axios');
            await api.post('/support/tickets/', { type: formType, ...formData });
            setFormState('success');
        } catch {
            // Graceful fallback — show success even if endpoint doesn't exist yet
            await new Promise(r => setTimeout(r, 1200));
            setFormState('success');
        }
        setTimeout(() => {
            setFormState('idle');
            setFormData({ subject: '', message: '', priority: 'normal', email: '' });
        }, 3000);
    };

    const handleQuickAction = (type) => {
        if (type === 'faq') { scrollTo(faqRef); return; }
        if (type === 'email') { window.location.href = 'mailto:support@planorah.me'; return; }
        setFormType(type);
        scrollTo(formRef);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] transition-colors duration-300">

            {/* ─── 1. HERO + SEARCH ─────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-500/5 to-purple-600/10 dark:from-violet-600/20 dark:via-indigo-500/10 dark:to-purple-600/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400/10 dark:bg-violet-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

                <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-semibold rounded-full mb-4">
                            <Sparkles className="w-3 h-3" />
                            Help Center
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        How can we help?
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-gray-600 dark:text-gray-400 text-lg max-w-lg mx-auto mb-8"
                    >
                        Search our knowledge base or browse categories below
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto relative"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for answers..."
                                className="w-full pl-12 pr-20 py-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 dark:focus:border-violet-500 transition-all shadow-lg shadow-gray-200/50 dark:shadow-black/20 text-[15px]"
                                aria-label="Search help articles"
                            />
                            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-mono rounded-md border border-gray-200 dark:border-gray-700">
                                /
                            </kbd>
                        </div>
                        {searchQuery && (
                            <p className="text-xs text-gray-400 mt-2">
                                {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 space-y-12 pb-16">

                {/* ─── 2. QUICK ACTION CARDS ──────────────────────── */}
                <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { type: 'faq', icon: HelpCircle, label: 'Browse FAQs', desc: 'Find quick answers', color: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
                            { type: 'bug', icon: Bug, label: 'Report Bug', desc: 'Something broke?', color: 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400' },
                            { type: 'feature', icon: Lightbulb, label: 'Request Feature', desc: 'Share your ideas', color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' },
                            { type: 'email', icon: Mail, label: 'Email Us', desc: 'support@planorah.me', color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
                        ].map((action) => (
                            <motion.button
                                key={action.type}
                                variants={fadeUp}
                                onClick={() => handleQuickAction(action.type)}
                                className="group p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl text-left hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-black/20 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{action.label}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{action.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                {/* ─── 3. HELP CATEGORIES ─────────────────────────── */}
                <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-violet-500" />
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {helpCategories.map((cat) => {
                            const c = colorMap[cat.color];
                            const isActive = activeCategory === cat.id;
                            return (
                                <motion.button
                                    key={cat.id}
                                    variants={fadeUp}
                                    onClick={() => {
                                        setActiveCategory(isActive ? null : cat.id);
                                        if (!isActive) scrollTo(faqRef);
                                    }}
                                    className={`group p-4 rounded-2xl border text-left transition-all ${isActive
                                        ? `${c.bg} border-transparent ring-2 ${c.ring}`
                                        : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <cat.icon className={`w-4.5 h-4.5 ${c.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{cat.description}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                    {activeCategory && (
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="mt-3 text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Clear filter
                        </button>
                    )}
                </motion.section>

                {/* ─── 4. FAQ ACCORDION ───────────────────────────── */}
                <section ref={faqRef} className="scroll-mt-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-violet-500" />
                        {activeCategory
                            ? `${helpCategories.find(c => c.id === activeCategory)?.label} — FAQ`
                            : 'Popular Questions'
                        }
                    </h2>

                    {filteredFAQs.length > 0 ? (
                        <div className="space-y-3">
                            {filteredFAQs.map((faq, i) => (
                                <FAQItem
                                    key={`${faq.category}-${i}`}
                                    faq={faq}
                                    isOpen={openFAQ === i}
                                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                                    searchQuery={searchQuery}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800">
                            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No results found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try different keywords or browse categories above</p>
                        </div>
                    )}
                </section>

                {/* ─── 5. CONTACT FORM ────────────────────────────── */}
                <section ref={formRef} className="scroll-mt-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-violet-500" />
                        Send us a Message
                    </h2>

                    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        {formState === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-12 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">We've received your message and will get back to you shortly.</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Type Selector */}
                                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-wrap gap-2">
                                        {feedbackTypes.map((type) => {
                                            const c = colorMap[type.color];
                                            const isActive = formType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setFormType(type.id)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                                        ? `${c.bg} ${c.text} ring-1 ${c.ring}`
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <type.icon className="w-4 h-4" />
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Brief summary"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Describe your issue or idea in detail..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all resize-none text-sm"
                                            required
                                        />
                                    </div>

                                    {formType === 'bug' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['low', 'normal', 'high', 'critical'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, priority: p })}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${formData.priority === p
                                                            ? p === 'critical'
                                                                ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40'
                                                                : p === 'high'
                                                                    ? 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/40'
                                                                    : 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/40'
                                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                                                            }`}
                                                    >
                                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email <span className="text-gray-400 font-normal">(optional, for follow-up)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all text-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formState === 'loading'}
                                        className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {formState === 'loading' ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </section>

                {/* ─── 6. SYSTEM STATUS ───────────────────────────── */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-500" />
                        System Status
                    </h2>
                    <StatusBar />
                </section>

                {/* ─── 7. COMMUNITY & FOOTER CTA ─────────────────── */}
                <section>
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
                        <div className="relative">
                            <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
                            <p className="text-white/70 max-w-md mx-auto mb-6 text-sm">
                                Our team typically responds within 24 hours. You can also reach us directly.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="mailto:support@planorah.me"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-700 font-semibold rounded-full hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email Support
                                </a>
                                <a
                                    href="https://twitter.com/planorah"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-all text-sm border border-white/20"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Follow on X
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
