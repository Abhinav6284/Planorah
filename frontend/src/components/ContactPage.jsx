import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Headphones,
    Mail,
    MessageSquare,
    Send,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicSiteNav from "./public/PublicSiteNav";
import PublicSiteFooter from "./public/PublicSiteFooter";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const body = [
            `Name: ${formData.name || "Not provided"}`,
            `Email: ${formData.email || "Not provided"}`,
            "",
            formData.message,
        ].join("\n");

        const mailtoHref = `mailto:support@planorah.me?subject=${encodeURIComponent(formData.subject || "Planorah Contact")}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoHref;
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-beigePrimary text-textPrimary dark:bg-charcoalDark dark:text-white">
            <PublicSiteNav />

            <main className="pt-32">
                <section className="relative overflow-hidden px-6 pb-16">
                    <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-terracotta/15 blur-3xl" />
                    <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-sage/20 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl rounded-3xl border border-beigeMuted bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-charcoalMuted dark:bg-charcoal/80 sm:p-12">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
                                <Sparkles className="h-4 w-4" />
                                Contact Planorah
                            </div>

                            <h1 className="mt-5 font-playfair text-4xl font-bold leading-tight sm:text-5xl">
                                Reach out and get support from the team
                            </h1>
                            <p className="mt-4 text-base leading-relaxed text-textSecondary dark:text-gray-300 sm:text-lg">
                                Have a question, partnership idea, or product feedback? Send us a message and we will get back to you. For technical help, you can also use our support center.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/support"
                                    className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-beigePrimary transition-colors hover:bg-charcoalMuted dark:bg-beigePrimary dark:text-charcoal dark:hover:bg-beigeSecondary"
                                >
                                    Open Help Center
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="mailto:support@planorah.me"
                                    className="inline-flex items-center gap-2 rounded-full border border-beigeMuted bg-beigePrimary px-6 py-3 text-sm font-semibold text-textPrimary transition-colors hover:border-terracotta/40 hover:text-terracotta dark:border-charcoalMuted dark:bg-charcoal dark:text-gray-200 dark:hover:border-terracotta/50 dark:hover:text-orange-300"
                                >
                                    <Mail className="h-4 w-4" />
                                    support@planorah.me
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-20">
                    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: Headphones,
                                title: "Product Support",
                                text: "Get help with account issues, features, and setup.",
                                ctaLabel: "Go to Support",
                                href: "/support",
                                isMail: false,
                            },
                            {
                                icon: MessageSquare,
                                title: "Partnerships",
                                text: "For collaborations, growth partnerships, and community programs.",
                                ctaLabel: "Email Partnerships",
                                href: "mailto:support@planorah.me?subject=Partnership%20Inquiry",
                                isMail: true,
                            },
                            {
                                icon: Briefcase,
                                title: "Hiring",
                                text: "Interested in joining us? Explore open roles and apply.",
                                ctaLabel: "View Careers",
                                href: "/careers",
                                isMail: false,
                            },
                        ].map((card) => {
                            const Icon = card.icon;
                            return (
                                <motion.article
                                    key={card.title}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl border border-beigeMuted bg-white p-6 shadow-soft dark:border-charcoalMuted dark:bg-charcoal"
                                >
                                    <div className="mb-4 inline-flex rounded-xl bg-terracotta/15 p-3 text-terracotta">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-outfit text-xl font-semibold">{card.title}</h2>
                                    <p className="mt-2 text-sm text-textSecondary dark:text-gray-400">{card.text}</p>
                                    {card.isMail ? (
                                        <a href={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracottaHover">
                                            {card.ctaLabel}
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                    ) : (
                                        <Link to={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracottaHover">
                                            {card.ctaLabel}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </motion.article>
                            );
                        })}
                    </div>
                </section>

                <section className="border-y border-beigeMuted bg-beigeSecondary px-6 py-20 dark:border-charcoalMuted dark:bg-charcoal">
                    <div className="mx-auto max-w-3xl rounded-3xl border border-beigeMuted bg-white p-8 shadow-soft dark:border-charcoalMuted dark:bg-charcoalDark sm:p-10">
                        <h2 className="font-playfair text-3xl font-bold">Send a direct message</h2>
                        <p className="mt-2 text-sm text-textSecondary dark:text-gray-400">
                            This form opens your default email app with your message prefilled so you can send it instantly.
                        </p>

                        {submitted && (
                            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Draft opened in your email app. Send it to complete your request.
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className="w-full rounded-xl border border-beigeMuted bg-beigePrimary px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-terracotta/30 dark:border-charcoalMuted dark:bg-charcoal dark:text-white"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your email"
                                    className="w-full rounded-xl border border-beigeMuted bg-beigePrimary px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-terracotta/30 dark:border-charcoalMuted dark:bg-charcoal dark:text-white"
                                    required
                                />
                            </div>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                className="w-full rounded-xl border border-beigeMuted bg-beigePrimary px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-terracotta/30 dark:border-charcoalMuted dark:bg-charcoal dark:text-white"
                                required
                            />

                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="How can we help?"
                                rows={5}
                                className="w-full rounded-xl border border-beigeMuted bg-beigePrimary px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-terracotta/30 dark:border-charcoalMuted dark:bg-charcoal dark:text-white"
                                required
                            />

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracottaHover"
                            >
                                <Send className="h-4 w-4" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            <PublicSiteFooter />
        </div>
    );
}
