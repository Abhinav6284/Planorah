import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('.reveal,.reveal-fade,.reveal-left,.reveal-right,.reveal-scale')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── FAQ data ─────────────────────────────────────────────
const faqCategories = {
  General: [
    ['What is Planorah?', 'Planorah is an AI-powered execution system for students. It takes your goals, syllabi, or learning paths and turns them into daily actionable roadmaps — then keeps you consistent with focus tools, streak tracking, and adaptive rescheduling.'],
    ['Who is Planorah for?', 'Students preparing for competitive exams (IIT, GATE, GRE), college coursework, skill-building (coding, freelancing, AI), study abroad prep, or anyone who wants structured daily execution.'],
    ['Is Planorah a to-do app?', 'No. To-do apps give you a list. Planorah gives you a system — AI-generated roadmaps, daily task scheduling, focus mode, progress analytics, and adaptive replanning. It\'s the difference between writing down "study math" and having a specific 45-minute block for Chapter 3 problems at 4pm.'],
    ['How is Planorah different from Notion or Google Calendar?', 'Notion is a blank canvas — powerful but requires you to build everything yourself. Google Calendar shows time but doesn\'t plan for you. Planorah does the planning: it reads your syllabus, generates a roadmap, schedules daily tasks, and adapts when you fall behind.'],
  ],
  Pricing: [
    ['Is Planorah free?', 'Yes. The free plan gives you full access to AI roadmap generation, daily planning, and focus mode. No credit card required, no trial period — free means free.'],
    ['What does Pro add?', 'Pro unlocks unlimited AI generations, two-way calendar sync, advanced analytics, offline mode, and priority support. It\'s designed for students managing heavy course loads or multi-month prep plans.'],
    ['Can I cancel anytime?', 'Yes. No contracts, no cancellation fees. You can downgrade to Free at any time and keep all your existing roadmaps.'],
  ],
  Features: [
    ['How does the AI roadmap work?', 'You upload a syllabus (PDF, text, or link) or describe your goal. Planorah\'s AI breaks it into weekly milestones and daily tasks, respecting your available hours and deadlines.'],
    ['What is Focus Mode?', 'A built-in Pomodoro timer that starts from any task block. It removes distractions and tracks your actual study time per subject — data that feeds back into smarter scheduling.'],
    ['Does Planorah sync with Google Calendar?', 'Yes. Free plan supports one-way sync (Planorah → Calendar). Pro enables full two-way sync with Google Calendar and Outlook.'],
    ['Can I use Planorah offline?', 'Pro users can access their daily plan and focus mode offline. Changes sync when you reconnect.'],
  ],
  Privacy: [
    ['Is my data safe?', 'Yes. All uploaded documents are encrypted at rest and in transit. Your syllabi and study data are never used to train AI models.'],
    ['Can I delete my data?', 'Yes. You can delete individual roadmaps, uploaded documents, or your entire account from Settings at any time.'],
    ['Does Planorah sell my data?', 'No. Never. We make money from Pro subscriptions, not from selling your information.'],
  ],
};

// ─── FAQ Accordion ────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '20px 0'
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', gap: 16
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
          color: 'var(--fg-deep)', lineHeight: 1.3
        }}>{question}</div>
        <div style={{
          fontSize: 20, color: 'var(--fg-muted)', flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>+</div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, maxWidth: 700, color: 'var(--fg-muted)' }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main export ──────────────────────────────────────────
export default function FAQPage() {
  useScrollReveal();
  const categories = Object.keys(faqCategories);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>FAQ</div>
          <h1 className="reveal reveal-delay-1" style={{ marginBottom: 20 }}>
            Frequently asked<br />questions.
          </h1>
          <p className="reveal reveal-delay-2" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            Everything you need to know about Planorah, from pricing to privacy.
          </p>
        </div>
      </section>

      {/* Category tabs + FAQ */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container-narrow">
          {/* Category pills */}
          <div className="reveal" style={{
            display: 'flex', gap: 6, marginBottom: 48, flexWrap: 'wrap'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: 9999,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                  background: activeCategory === cat ? 'var(--fg-deep)' : 'var(--surface)',
                  color: activeCategory === cat ? 'var(--bg)' : 'var(--fg-deep)',
                  boxShadow: activeCategory === cat ? 'none' : 'var(--shadow-ring)',
                  transition: 'all 0.15s ease'
                }}
              >{cat}</button>
            ))}
          </div>

          {/* FAQ items */}
          <div>
            {faqCategories[activeCategory].map(([q, a], i) => (
              <FAQItem key={`${activeCategory}-${i}`} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
