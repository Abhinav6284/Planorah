import { motion } from "framer-motion";
import {
    ArrowRight,
    Briefcase,
    Globe,
    HeartHandshake,
    Rocket,
    Sparkles,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicSiteNav from "./public/PublicSiteNav";
import PublicSiteFooter from "./public/PublicSiteFooter";

const roles = [
    {
        title: "Frontend Engineer (React)",
        mode: "Remote",
        type: "Full-time",
        level: "1-3 years",
        summary:
            "Build polished student-facing experiences across onboarding, productivity flows, and public marketing pages.",
        skills: ["React", "Tailwind", "UX polish", "Performance"],
    },
    {
        title: "Backend Engineer (Django)",
        mode: "Remote",
        type: "Full-time",
        level: "2-4 years",
        summary:
            "Design robust APIs for planning intelligence, scheduling, and analytics with reliability at scale.",
        skills: ["Django", "PostgreSQL", "API design", "Async jobs"],
    },
    {
        title: "Product Designer",
        mode: "Remote",
        type: "Contract",
        level: "1-3 years",
        summary:
            "Craft thoughtful product journeys that turn complex planning workflows into intuitive, motivating interactions.",
        skills: ["Figma", "Design systems", "User research", "Interaction design"],
    },
    {
        title: "Developer Relations Intern",
        mode: "Hybrid",
        type: "Internship",
        level: "Students welcome",
        summary:
            "Create educational content, guides, and demos that help students adopt Planorah effectively.",
        skills: ["Content", "Community", "Teaching", "Technical writing"],
    },
];

const values = [
    {
        icon: Rocket,
        title: "Ship Fast, Learn Faster",
        description: "We prefer momentum with feedback over perfect plans that never launch.",
    },
    {
        icon: HeartHandshake,
        title: "Student Impact First",
        description: "Every feature decision should improve real student outcomes, not vanity metrics.",
    },
    {
        icon: Users,
        title: "High Ownership, Low Ego",
        description: "We solve problems together and let data, craft, and user feedback lead decisions.",
    },
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-beigePrimary text-textPrimary dark:bg-charcoalDark dark:text-white">
            <PublicSiteNav />

            <main className="pt-32">
                <section className="relative overflow-hidden px-6 pb-16">
                    <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-terracotta/15 blur-3xl" />
                    <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-sage/20 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl rounded-3xl border border-beigeMuted bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-charcoalMuted dark:bg-charcoal/80 sm:p-12">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
                                <Sparkles className="h-4 w-4" />
                                Careers at Planorah
                            </div>

                            <h1 className="mt-5 font-playfair text-4xl font-bold leading-tight sm:text-5xl">
                                Build the future of student execution
                            </h1>
                            <p className="mt-4 text-base leading-relaxed text-textSecondary dark:text-gray-300 sm:text-lg">
                                We are building an AI-native academic planning platform used by students to turn ambition into consistent action. If you care about meaningful product impact, we should talk.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="mailto:careers@planorah.me?subject=Career%20Application%20-%20Planorah"
                                    className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-beigePrimary transition-colors hover:bg-charcoalMuted dark:bg-beigePrimary dark:text-charcoal dark:hover:bg-beigeSecondary"
                                >
                                    Apply via Email
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 rounded-full border border-beigeMuted bg-beigePrimary px-6 py-3 text-sm font-semibold text-textPrimary transition-colors hover:border-terracotta/40 hover:text-terracotta dark:border-charcoalMuted dark:bg-charcoal dark:text-gray-200 dark:hover:border-terracotta/50 dark:hover:text-orange-300"
                                >
                                    Contact Team
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-6 flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-terracotta" />
                            <h2 className="font-playfair text-3xl font-bold">Open Roles</h2>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {roles.map((role) => (
                                <motion.article
                                    key={role.title}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl border border-beigeMuted bg-white p-6 shadow-soft dark:border-charcoalMuted dark:bg-charcoal"
                                >
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-terracotta/10 px-3 py-1 font-semibold text-terracotta">{role.type}</span>
                                        <span className="rounded-full bg-beigeSecondary px-3 py-1 font-semibold text-textSecondary dark:bg-charcoalMuted dark:text-gray-300">{role.mode}</span>
                                        <span className="rounded-full bg-beigeSecondary px-3 py-1 font-semibold text-textSecondary dark:bg-charcoalMuted dark:text-gray-300">{role.level}</span>
                                    </div>

                                    <h3 className="mt-4 font-outfit text-xl font-semibold">{role.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-textSecondary dark:text-gray-400">{role.summary}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {role.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-lg border border-beigeMuted bg-beigePrimary px-2.5 py-1 text-xs text-textSecondary dark:border-charcoalMuted dark:bg-charcoalDark dark:text-gray-400"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={`mailto:careers@planorah.me?subject=${encodeURIComponent(`Application - ${role.title}`)}`}
                                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracottaHover"
                                    >
                                        Apply for this role
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-beigeMuted bg-beigeSecondary px-6 py-20 dark:border-charcoalMuted dark:bg-charcoal">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="text-center font-playfair text-3xl font-bold sm:text-4xl">How we work</h2>
                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {values.map((value) => {
                                const Icon = value.icon;
                                return (
                                    <motion.article
                                        key={value.title}
                                        whileHover={{ y: -4 }}
                                        className="rounded-2xl border border-beigeMuted bg-white p-6 shadow-soft dark:border-charcoalMuted dark:bg-charcoalDark"
                                    >
                                        <div className="mb-4 inline-flex rounded-xl bg-terracotta/15 p-3 text-terracotta">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-outfit text-xl font-semibold">{value.title}</h3>
                                        <p className="mt-2 text-sm text-textSecondary dark:text-gray-400">{value.description}</p>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-20">
                    <div className="mx-auto grid max-w-5xl gap-6 rounded-3xl border border-beigeMuted bg-white p-8 shadow-soft dark:border-charcoalMuted dark:bg-charcoal sm:grid-cols-2 sm:p-10">
                        <div>
                            <h2 className="font-playfair text-3xl font-bold">Not seeing your role?</h2>
                            <p className="mt-3 text-sm text-textSecondary dark:text-gray-400">
                                We are always interested in meeting builders who care about student outcomes and product excellence.
                            </p>
                        </div>
                        <div className="flex flex-col items-start justify-center gap-3 sm:items-end">
                            <a
                                href="mailto:careers@planorah.me?subject=General%20Application%20-%20Planorah"
                                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracottaHover"
                            >
                                Send General Application
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <span className="inline-flex items-center gap-2 text-xs text-textSecondary dark:text-gray-400">
                                <Globe className="h-3.5 w-3.5" />
                                Remote-friendly across time zones
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            <PublicSiteFooter />
        </div>
    );
}
