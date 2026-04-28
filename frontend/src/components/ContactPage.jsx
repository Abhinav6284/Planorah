import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, CheckCircle2, Headphones, Mail, MessageSquare, Send } from "lucide-react";

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

  const cards = [
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
  ];

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Contact Planorah</div>
          <h1 style={{ marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
            Reach out and get support from the team
          </h1>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            Have a question, partnership idea, or product feedback? Send us a message and we will get back to you. For technical help, you can also use our support center.
          </p>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/support" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Open Help Center <ArrowRight size={16} />
            </Link>
            <a href="mailto:support@planorah.me" className="btn btn-plain" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} /> support@planorah.me
            </a>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: 'var(--surface)', display: 'inline-flex', padding: 12, borderRadius: 12, marginBottom: 20, alignSelf: 'flex-start' }}>
                    <Icon size={24} color="var(--fg-deep)" />
                  </div>
                  <h2 style={{ fontSize: 20, marginBottom: 12 }}>{card.title}</h2>
                  <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>{card.text}</p>
                  
                  {card.isMail ? (
                    <a href={card.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)', textDecoration: 'none' }}>
                      {card.ctaLabel} <ArrowRight size={14} />
                    </a>
                  ) : (
                    <Link to={card.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--fg-deep)', textDecoration: 'none' }}>
                      {card.ctaLabel} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-sm">
        <div className="container-narrow">
          <div className="card" style={{ padding: 48 }}>
            <h2 style={{ fontSize: 32, marginBottom: 12 }}>Send a direct message</h2>
            <p style={{ fontSize: 15, color: 'var(--fg-muted)', marginBottom: 32 }}>
              This form opens your default email app with your message prefilled so you can send it instantly.
            </p>

            {submitted && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <CheckCircle2 size={16} /> Draft opened in your email app. Send it to complete your request.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--surface)', color: 'var(--fg-deep)', fontSize: 15 }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--surface)', color: 'var(--fg-deep)', fontSize: 15 }}
                />
              </div>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--surface)', color: 'var(--fg-deep)', fontSize: 15 }}
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                rows={5}
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--surface)', color: 'var(--fg-deep)', fontSize: 15, fontFamily: 'inherit' }}
              />

              <button type="submit" className="btn" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
