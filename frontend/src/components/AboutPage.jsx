import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  GraduationCap,
  Mail,
  Rocket,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicSiteNav from './public/PublicSiteNav';
import PublicSiteFooter from './public/PublicSiteFooter';

const founder = {
  name: 'Abhinav Goyal',
  role: 'Founder and Builder, Planorah',
  intro:
    'I built Planorah to help students stop drowning in planning chaos and start executing with clarity every single day.',
  location: 'India',
  email: 'support@planorah.me',
};

const founderStats = [
  { label: 'Students impacted', value: '10,000+' },
  { label: 'Core modules shipped', value: '12+' },
  { label: 'Execution mindset', value: 'Student-first' },
];

const principles = [
  {
    icon: Brain,
    title: 'Clarity Over Complexity',
    description:
      'Great products reduce mental load. Every Planorah feature should make the next step obvious.',
  },
  {
    icon: Target,
    title: 'Execution Beats Intention',
    description:
      'Planning is useful only when it ends in action. The product is built to push daily execution.',
  },
  {
    icon: Users,
    title: 'Built With Real Users',
    description:
      'Roadmaps are shaped by student feedback loops, not by assumptions inside a boardroom.',
  },
  {
    icon: Sparkles,
    title: 'AI With Accountability',
    description:
      'AI should guide, not control. Recommendations stay practical, transparent, and measurable.',
  },
];

const journey = [
  {
    period: '2024',
    title: 'From Personal Chaos To First Prototype',
    detail:
      'Planorah started as a personal system to survive coursework, projects, and career prep without burnout.',
  },
  {
    period: '2024 Q3',
    title: 'First Student Users',
    detail:
      'Friends from college started using it and shared the same outcome: less confusion, better consistency.',
  },
  {
    period: '2025',
    title: 'Growth Through Word Of Mouth',
    detail:
      'Students invited other students because the product solved a painful everyday problem.',
  },
  {
    period: 'Now',
    title: 'Building The Student Execution OS',
    detail:
      'Planorah is evolving into a full stack for roadmap planning, focus, accountability, and career momentum.',
  },
];

const focusAreas = [
  'AI planning that translates big goals into daily missions',
  'Cleaner focus workflows that remove decision fatigue',
  'Proof-of-work outputs for resumes, portfolios, and hiring',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-beigePrimary text-textPrimary dark:bg-charcoalDark dark:text-white">
      <PublicSiteNav />

      <main className="pt-32">
      <section className="relative overflow-hidden border-b border-beigeMuted px-6 pb-16 pt-16 dark:border-charcoalMuted">
        <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-terracotta/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sage/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <BadgeCheck className="h-4 w-4" />
              Founder Spotlight
            </div>

            <h1 className="font-playfair text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Meet the founder behind
              <span className="ml-2 bg-gradient-to-r from-terracotta to-[#e99b74] bg-clip-text text-transparent">
                Planorah
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-textSecondary dark:text-gray-300 sm:text-lg">
              {founder.intro}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-7 py-3 text-sm font-semibold text-beigePrimary transition-all hover:bg-charcoalMuted dark:bg-beigePrimary dark:text-charcoal dark:hover:bg-beigeSecondary"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`mailto:${founder.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-beigeMuted bg-white px-7 py-3 text-sm font-semibold text-textPrimary transition-all hover:border-terracotta/40 hover:text-terracotta dark:border-charcoalMuted dark:bg-charcoal dark:text-gray-200 dark:hover:border-terracotta/50 dark:hover:text-orange-300"
              >
                <Mail className="h-4 w-4" />
                Contact Founder
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {founderStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-beigeMuted bg-white p-4 shadow-soft dark:border-charcoalMuted dark:bg-charcoal"
                >
                  <p className="text-xl font-bold text-textPrimary dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-textSecondary dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-3xl border border-beigeMuted bg-white p-8 shadow-soft dark:border-charcoalMuted dark:bg-charcoal">
              <div className="rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/10 to-[#e5d8c5] p-6 dark:from-terracotta/20 dark:to-charcoalMuted">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-charcoal text-2xl font-bold text-beigePrimary dark:bg-beigePrimary dark:text-charcoal">
                  AG
                </div>

                <h2 className="font-playfair text-3xl font-bold text-textPrimary dark:text-white">
                  {founder.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-terracotta">{founder.role}</p>

                <div className="mt-6 space-y-3 text-sm text-textSecondary dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-terracotta" />
                    Built from real student pain points
                  </p>
                  <p className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-terracotta" />
                    Shipping fast, iterating weekly
                  </p>
                  <p className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-terracotta" />
                    Based in {founder.location}
                  </p>
                </div>

                <p className="mt-6 rounded-xl border border-terracotta/20 bg-white/80 p-4 text-sm italic leading-relaxed text-textPrimary dark:bg-charcoal/70 dark:text-gray-200">
                  "Students do not fail because they lack ambition. They fail because their systems are broken. Planorah exists to fix that system."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <h2 className="font-playfair text-3xl font-bold sm:text-4xl">
              Why I Started Planorah
            </h2>
            <p className="text-base leading-relaxed text-textSecondary dark:text-gray-300">
              I was doing everything students are told to do: taking notes, setting goals, building timetables, and trying productivity apps. But I still felt scattered. The real issue was not motivation. It was system friction.
            </p>
            <p className="text-base leading-relaxed text-textSecondary dark:text-gray-300">
              Most tools require students to be project managers of their own lives. That adds overhead instead of removing it. I wanted a product where students could think less about organizing and more about executing.
            </p>
            <p className="text-base leading-relaxed text-textSecondary dark:text-gray-300">
              Planorah is my answer: a product that turns messy thoughts into structured action, then pushes consistency with clear feedback loops.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="rounded-3xl border border-beigeMuted bg-white p-8 shadow-soft dark:border-charcoalMuted dark:bg-charcoal"
          >
            <h3 className="font-playfair text-2xl font-bold">What I Am Building Right Now</h3>
            <ul className="mt-6 space-y-3">
              {focusAreas.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-beigeMuted bg-beigeSecondary/70 px-4 py-3 text-sm text-textPrimary dark:border-charcoalMuted dark:bg-charcoalMuted/40 dark:text-gray-200"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-terracotta/25 bg-terracotta/10 p-4 text-sm text-textPrimary dark:bg-terracotta/15 dark:text-gray-200">
              Want to collaborate, share feedback, or feature Planorah in your community? Reach out and I will personally review it.
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-beigeMuted bg-beigeSecondary px-6 py-20 dark:border-charcoalMuted dark:bg-charcoal">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-playfair text-3xl font-bold sm:text-4xl">Founder Principles</h2>
            <p className="mx-auto mt-3 max-w-2xl text-textSecondary dark:text-gray-400">
              The product decisions at Planorah are driven by these operating principles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-beigeMuted bg-white p-6 shadow-soft dark:border-charcoalMuted dark:bg-charcoalDark"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-terracotta/15 p-3 text-terracotta">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-outfit text-xl font-semibold text-textPrimary dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-textSecondary dark:text-gray-400">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-playfair text-3xl font-bold sm:text-4xl">Journey So Far</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {journey.map((item) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-beigeMuted bg-white p-6 dark:border-charcoalMuted dark:bg-charcoal"
              >
                <p className="mb-3 inline-flex rounded-full bg-terracotta/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  {item.period}
                </p>
                <h3 className="font-outfit text-xl font-semibold text-textPrimary dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-textSecondary dark:text-gray-400">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-beigeMuted bg-beigeSecondary px-6 py-20 dark:border-charcoalMuted dark:bg-charcoal">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl rounded-3xl border border-beigeMuted bg-white p-10 text-center shadow-soft dark:border-charcoalMuted dark:bg-charcoalDark"
        >
          <h2 className="font-playfair text-3xl font-bold sm:text-4xl">
            If this mission resonates, build with me
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-textSecondary dark:text-gray-400">
            Join Planorah, share feedback, and help shape a product that gives students clarity, confidence, and consistent execution.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracottaHover"
            >
              Join Planorah
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-beigeMuted bg-beigePrimary px-7 py-3 text-sm font-semibold text-textPrimary transition-colors hover:border-terracotta/40 hover:text-terracotta dark:border-charcoalMuted dark:bg-charcoal dark:text-gray-200 dark:hover:border-terracotta/50 dark:hover:text-orange-300"
            >
              Read My Guides
            </Link>
          </div>
        </motion.div>
      </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
