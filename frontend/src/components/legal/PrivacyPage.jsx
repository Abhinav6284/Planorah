import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const PrivacyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sections = [
    {
      title: '1. Introduction',
      content: `Planorah ("we", "our", or "us") operates the www.planorah.me website and mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.

We use your data to provide and improve the Service. By using Planorah, you agree to the collection and use of information in accordance with this policy.`,
    },
    {
      title: '2. Information Collection and Use',
      content: `We collect several different types of information for various purposes to provide and improve our Service to you.

Types of Data Collected:
- Personal Data: Email address, first and last name, phone number, profile information, usage data
- OAuth Data: Google and GitHub account information (if you choose to sign up via OAuth)
- Usage Data: Pages visited, time spent, features used, IP address, browser type, referring/exit pages
- Session Data: Authentication tokens stored in your browser's localStorage

We collect this data to:
- Provide and maintain our Service
- Notify you about changes to our Service
- Allow you to participate in interactive features of our Service
- Provide customer support
- Gather analysis or valuable information so that we can improve our Service
- Monitor the usage of our Service
- Detect, prevent and address technical and security issues`,
    },
    {
      title: '3. Security of Data',
      content: `The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.

Our security measures include:
- HTTPS encryption for all data in transit
- Secure password hashing (bcrypt) for user credentials
- OAuth token encryption
- Regular security audits
- Restricted database access`,
    },
    {
      title: '4. Third-Party Services',
      content: `Planorah integrates with the following third-party services:

- Google OAuth: For authentication and account creation
- Stripe/Payment Processors: For subscription and payment processing
- Email Services: For transactional emails (verification, password reset, etc.)
- Analytics: For understanding usage patterns (Vercel Analytics)

These third parties have access only to the data necessary to perform their specific functions and are contractually obligated to maintain the confidentiality and security of your data.`,
    },
    {
      title: '5. Data Retention',
      content: `Planorah will retain your personal data only for as long as necessary to provide the Service and to comply with legal obligations. When you delete your account:
- Your profile and personal information is deleted within 30 days
- Your planning data (brain dumps, roadmaps, tasks) is deleted within 30 days
- Your resume and portfolio data remains accessible for 90 days before final deletion
- We retain anonymized usage data for analytics purposes

If you have questions about data retention, contact us at support@planorah.me.`,
    },
    {
      title: '6. User Rights',
      content: `You have the right to:
- Access: Request a copy of all personal data we hold about you
- Correction: Update or correct your personal information
- Deletion: Request deletion of your account and associated data (right to be forgotten)
- Portability: Receive your data in a structured, commonly used format
- Opt-out: Stop receiving marketing emails at any time

To exercise any of these rights, contact us at support@planorah.me.`,
    },
    {
      title: '7. Children\'s Privacy',
      content: `Planorah is designed for students aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information and terminate the child's account.

For users aged 13-18, parental consent is not required under COPPA, but we recommend that parents monitor their student's usage.`,
    },
    {
      title: '8. GDPR Compliance (EU Users)',
      content: `If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):
- Right to access your personal data
- Right to rectification of inaccurate data
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object to processing
- Rights related to automated decision-making

Planorah is GDPR compliant. Our legal basis for processing your data is performance of contract (providing the Service) and legitimate interests.`,
    },
    {
      title: '9. California Privacy Rights (CCPA)',
      content: `If you are a California resident, you have the following rights:
- Right to know: What personal information we collect, use, and share
- Right to delete: Request deletion of your personal information
- Right to opt-out: Opt-out of the sale of your personal information
- Right to non-discrimination: We do not discriminate against users who exercise their privacy rights

Planorah does NOT sell your personal information. We do not share data for monetary consideration.`,
    },
    {
      title: '10. Contact Us',
      content: `If you have any questions about this Privacy Policy, please contact us at:

Email: support@planorah.me
Website: www.planorah.me
Mailing Address: Planorah, India

Last Updated: April 9, 2026

We will respond to privacy inquiries within 14 business days.`,
    },
  ];

  return (
    <main>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ padding: "80px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div style={{ maxWidth: 896, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 60px)", fontWeight: 700, marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ fontSize: 18, color: "var(--fg-muted)" }}>
            Last updated: April 9, 2026
          </p>
        </div>
      </motion.section>

      {/* Content */}
      <section style={{ padding: "80px 24px", maxWidth: 896, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, marginBottom: 16, color: "var(--fg-deep)" }}>{section.title}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 16, lineHeight: 1.6, color: "var(--fg-muted)" }}>
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} style={{ whiteSpace: "pre-wrap" }}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginTop: 64, padding: 24, borderRadius: 12, border: "1px solid var(--border-subtle)", background: "var(--surface)" }}
        >
          <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6 }}>
            This Privacy Policy is effective as of April 9, 2026, and may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of Planorah constitutes your acceptance of our updated Privacy Policy.
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default PrivacyPage;
