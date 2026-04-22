import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PublicSiteNav from './public/PublicSiteNav';
import PublicSiteFooter from './public/PublicSiteFooter';

const PricingPublicPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [currency, setCurrency] = useState(null); // null = loading
  const [manualOverride, setManualOverride] = useState(false);

  const PRICING_DATA = {
    USD: {
      symbol: '$',
      tiers: [
        {
          name: 'Free',
          price: 'Free',
          priceNote: 'Forever free',
          description: 'Get started with the basics',
          features: [
            '1 Career Roadmap',
            'Basic Resume Generator',
            'Job Finder (limited listings)',
            'Quicky AI (5 queries/day)',
            'Task Management (basic)',
          ],
          cta: 'Start Free',
          popular: false,
        },
        {
          name: 'Starter',
          price: '1.99',
          priceNote: '/month',
          description: 'For students building momentum',
          features: [
            '5 Career Roadmaps/month',
            'Full Resume Generator',
            'Job Finder (unlimited)',
            'Quicky AI (unlimited)',
            'Task & Project Management',
            'Portfolio Live (addon at $0.95)',
          ],
          cta: 'Get Started',
          popular: false,
        },
        {
          name: 'Pro',
          price: '4.99',
          priceNote: '/month',
          description: 'For serious students ready to execute',
          features: [
            '15 Career Roadmaps/month',
            'Everything in Starter',
            'ATS Scanner (unlimited)',
            'Resources Hub (50+ tools)',
            'Portfolio Live (included)',
            '5 x 1:1 Sessions/month (30 min)',
          ],
          cta: 'Start Free Trial',
          popular: true,
        },
        {
          name: 'Elite',
          price: '9.99',
          priceNote: '/month',
          description: 'For the obsessed — full coaching & priority access',
          features: [
            'Unlimited Career Roadmaps',
            'Everything in Pro',
            '10 x 1:1 Sessions/month (45 min)',
            'Priority booking',
            'Async support (WhatsApp/Discord)',
            'Early access to new features',
          ],
          cta: 'Go Elite',
          popular: false,
        },
      ],
    },
    INR: {
      symbol: '₹',
      tiers: [
        {
          name: 'Free',
          price: 'Free',
          priceNote: 'Forever free',
          description: 'Get started with the basics',
          features: [
            '1 Career Roadmap',
            'Basic Resume Generator',
            'Job Finder (limited listings)',
            'Quicky AI (5 queries/day)',
            'Task Management (basic)',
          ],
          cta: 'Start Free',
          popular: false,
        },
        {
          name: 'Starter',
          price: '99',
          priceNote: '/month',
          description: 'For students building momentum',
          features: [
            '5 Career Roadmaps/month',
            'Full Resume Generator',
            'Job Finder (unlimited)',
            'Quicky AI (unlimited)',
            'Task & Project Management',
            'Portfolio Live (addon at ₹79)',
          ],
          cta: 'Get Started',
          popular: false,
        },
        {
          name: 'Pro',
          price: '249',
          priceNote: '/month',
          description: 'For serious students ready to execute',
          features: [
            '15 Career Roadmaps/month',
            'Everything in Starter',
            'ATS Scanner (unlimited)',
            'Resources Hub (50+ tools)',
            'Portfolio Live (included)',
            '5 x 1:1 Sessions/month (30 min)',
          ],
          cta: 'Start Free Trial',
          popular: true,
        },
        {
          name: 'Elite',
          price: '499',
          priceNote: '/month',
          description: 'For the obsessed — full coaching & priority access',
          features: [
            'Unlimited Career Roadmaps',
            'Everything in Pro',
            '10 x 1:1 Sessions/month (45 min)',
            'Priority booking',
            'Async support (WhatsApp/Discord)',
            'Early access to new features',
          ],
          cta: 'Go Elite',
          popular: false,
        },
      ],
    },
  };

  // Detect country from IP geolocation
  useEffect(() => {
    if (manualOverride) return; // Skip auto-detect if user manually selected

    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const detectedCurrency = data.country_code === 'IN' ? 'INR' : 'USD';
        setCurrency(detectedCurrency);
      } catch (error) {
        // Fallback to USD on error
        setCurrency('USD');
      }
    };

    detectCountry();
  }, [manualOverride]);

  // If currency not detected yet, show loading state
  if (!currency) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-charcoalDark text-white' : 'bg-beigePrimary text-textPrimary'}`}>
        <PublicSiteNav />
        <div className="pt-32 px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-textSecondary'}>Loading pricing...</p>
          </div>
        </div>
        <PublicSiteFooter />
      </div>
    );
  }

  const pricingTiers = PRICING_DATA[currency].tiers;
  const faqItems = [
    {
      q: 'Do you offer a free trial?',
      a: 'Yes! Pro and Elite plans come with a 14-day free trial. No credit card required.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Absolutely. Cancel your subscription anytime with no questions asked. Your data stays with you.',
    },
    {
      q: 'Is there a student discount?',
      a: 'Yes! Message us at support@planorah.me with proof of enrollment (student ID) for 30% off Pro.',
    },
    {
      q: 'What if I need a team plan?',
      a: 'The Elite plan includes team collaboration (Inner Circle). Contact us for custom team pricing.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, Amex) and local payment methods in your region.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-charcoalDark text-white' : 'bg-beigePrimary text-textPrimary'}`}>
      <PublicSiteNav />

      <main className="pt-32">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`px-6 py-20 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">
            Simple, <span className="text-terracotta">Student-Friendly</span> Pricing
          </h1>
          <p className="text-lg md:text-xl text-textSecondary max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. All plans include a 14-day free trial on paid tiers.
          </p>

          {/* Currency Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <Globe className="w-5 h-5 text-terracotta" />
            <div className="flex gap-2 bg-beigeSecondary dark:bg-charcoalMuted rounded-full p-1">
              {['USD', 'INR'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrency(curr);
                    setManualOverride(true);
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    currency === curr
                      ? 'bg-terracotta text-white'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="px-6 py-20 max-w-7xl mx-auto"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`rounded-2xl p-8 border-2 flex flex-col ${
                tier.popular
                  ? `border-terracotta ${isDark ? 'bg-charcoal' : 'bg-white'} ring-2 ring-terracotta/20`
                  : `border-terracotta/20 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="inline-block bg-terracotta text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="font-playfair text-2xl font-bold mb-2">{tier.name}</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>{tier.description}</p>

              <div className="mb-6">
                {tier.price === 'Free' ? (
                  <div>
                    <p className="font-playfair text-4xl font-bold">Free</p>
                    <p className="text-sm text-terracotta font-semibold">{tier.priceNote}</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-5xl font-bold">
                      {PRICING_DATA[currency].symbol}
                      {tier.price}
                    </span>
                    <p className="text-sm text-terracotta font-semibold">{tier.priceNote}</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 ${
                  tier.popular
                    ? 'bg-terracotta hover:bg-terracottaHover text-white shadow-lg'
                    : `border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white`
                }`}
              >
                {tier.cta}
              </motion.button>

              <div className="space-y-4 flex-1">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-textSecondary'}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`px-6 py-20 ${isDark ? 'bg-charcoal' : 'bg-beigeSecondary'}`}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`rounded-lg p-6 border border-terracotta/20 ${isDark ? 'bg-charcoalMuted' : 'bg-white'}`}
              >
                <h3 className="font-semibold text-lg mb-2 text-terracotta">{item.q}</h3>
                <p className={isDark ? 'text-gray-400' : 'text-textSecondary'}>{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6 py-20 max-w-2xl mx-auto text-center"
      >
        <h2 className="font-playfair text-4xl font-bold mb-6">
          <span className="text-terracotta">Ready to unlock</span> your potential?
        </h2>
        <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
          All plans start with a 14-day free trial on Pro and Elite. No credit card required to start.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
          className="bg-terracotta hover:bg-terracottaHover text-white px-8 py-4 rounded-lg font-outfit font-semibold transition-all shadow-lg"
        >
          Get Started Free Today
        </motion.button>
      </motion.section>
      </main>

      <PublicSiteFooter />
    </div>
  );
};

export default PricingPublicPage;
