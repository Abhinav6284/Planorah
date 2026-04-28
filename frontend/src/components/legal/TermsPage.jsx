import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const TermsPage = () => {
  const { theme } = useTheme();
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using Planorah (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
    },
    {
      title: '2. Use License',
      content: `Permission is granted to temporarily download one copy of the materials (information or software) on Planorah for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to decompile or reverse engineer any software contained on Planorah
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server
- Violate any applicable laws or regulations`,
    },
    {
      title: '3. Account Responsibility',
      content: `When you create an account with Planorah, you must provide accurate, complete, and current information. You are responsible for:
- Maintaining the confidentiality of your password and account information
- Restricting access to your computer or device
- Accepting responsibility for all activities that occur under your account
- Immediately notifying us of any unauthorized use of your account

If you discover unauthorized access, contact support@planorah.me immediately.`,
    },
    {
      title: '4. Use of Service',
      content: `You agree to use Planorah only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of the Service. Prohibited behavior includes:
- Harassing or causing distress or inconvenience to any person
- Transmitting obscene or offensive content
- Disrupting the normal flow of dialogue within Planorah
- Attempting to gain unauthorized access to systems or data
- Using bots or automated scripts to access the Service
- Collecting or tracking personal information of others without consent
- Spamming or sending unsolicited messages`,
    },
    {
      title: '5. Intellectual Property Rights',
      content: `The Service and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by Planorah, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.

User-Generated Content:
- You retain ownership of any content you create (brain dumps, roadmaps, tasks, etc.)
- By uploading content to Planorah, you grant us a worldwide, non-exclusive license to use, reproduce, modify, and display your content for the purpose of providing the Service
- We do not claim ownership of your personal planning data
- You may export or delete your data at any time`,
    },
    {
      title: '6. Subscription and Billing',
      content: `If you subscribe to a paid plan:
- You authorize us to charge your payment method on a recurring basis
- Billing occurs on the date you first subscribe and on each anniversary thereafter
- Free trials: If offered, your trial period begins on the date you sign up. Paid billing starts at the end of the trial period unless you cancel beforehand
- Cancellation: You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing cycle
- No Refunds: Except as required by law, subscription fees are non-refundable. No refunds are issued for partial months
- Pricing Changes: We may change our pricing with 30 days' notice. You will be notified by email`,
    },
    {
      title: '7. Limitation of Liability',
      content: `Planorah is provided on an "as is" and "as available" basis. To the fullest extent permissible by applicable law:
- We disclaim all warranties, express or implied, including any implied warranties of merchantability, fitness for a particular purpose, or non-infringement
- Planorah does not warrant that the Service will be uninterrupted, error-free, or free of harmful components
- In no event shall Planorah, its founders, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service`,
    },
    {
      title: '8. Academic Use and Student Status',
      content: `Planorah is intended for use by students and educational purposes. By creating an account, you represent that:
- You are a student or using Planorah for legitimate educational purposes
- Your use of the Service complies with your school's acceptable use policy
- You will not use Planorah to violate academic integrity (e.g., plagiarism, cheating)
- You will not share your account login with others

Planorah does not participate in or condone academic dishonesty. Accounts found to be violating academic integrity may be terminated without refund.`,
    },
    {
      title: '9. Indemnification',
      content: `You agree to indemnify, defend, and hold harmless Planorah and its officers, directors, employees, agents, and successors from any and all claims, damages, losses, costs, and expenses (including reasonable attorney's fees) arising out of or related to:
- Your use or misuse of the Service
- Your violation of this Terms of Service
- Your violation of any applicable law or regulation
- Your infringement of any third-party rights`,
    },
    {
      title: '10. Termination',
      content: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if:
- You violate any provision of this Terms of Service
- You engage in harassment, abuse, or threatening behavior
- You attempt unauthorized access to systems or data
- We believe your use poses a security risk
- You violate applicable laws

Upon termination:
- Your right to use the Service ceases immediately
- You remain liable for any outstanding fees
- Provisions that should survive termination remain in effect`,
    },
    {
      title: '11. Modifications to Service',
      content: `Planorah reserves the right to modify or discontinue the Service (or any part thereof) at any time, with or without notice. We will attempt to provide advance notice of significant changes. You agree that Planorah shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.`,
    },
    {
      title: '12. Governing Law',
      content: `These Terms of Service and your use of Planorah are governed by and construed in accordance with the laws of India, without regard to its conflicts of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in India.`,
    },
    {
      title: '13. Contact Us',
      content: `If you have any questions about these Terms of Service, please contact us at:

Email: support@planorah.me
Website: www.planorah.me

Last Updated: April 9, 2026`,
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
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 60px)", fontWeight: 700, marginBottom: 16 }}>Terms of Service</h1>
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
            These Terms of Service are effective as of April 9, 2026, and may be updated from time to time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of Planorah constitutes your acceptance of these updated Terms.
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default TermsPage;
