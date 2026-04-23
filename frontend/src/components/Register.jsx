import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { setTokens } from "../utils/auth";
import env from "../config/env";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

// ── Shared icons ──────────────────────────────────────────────────────────

const GridBackdrop = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}>
    <defs>
      <pattern id="authGrid2" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0H0V44" fill="none" stroke="white" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#authGrid2)" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// ── Password strength meter ───────────────────────────────────────────────

const PwStrength = ({ value }) => {
  const score = (() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  })();
  const label = ["Too short", "Weak", "Okay", "Strong", "Excellent"][score] || "";
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? "#242424" : "rgba(34,42,53,0.1)",
            transition: "background 0.25s ease",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--auth-mid-gray, #898989)" }}>
        {value ? label : "8+ characters recommended, with a number or symbol."}
      </div>
    </div>
  );
};

// ── Brand panel (register variant) ───────────────────────────────────────

const BrandPanel = () => (
  <div
    className="hidden lg:flex flex-col justify-between"
    style={{
      position: "relative",
      background: "#242424",
      color: "#ffffff",
      padding: "40px 56px",
      overflow: "hidden",
    }}
  >
    <GridBackdrop />

    {/* Logo */}
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "#ffffff", color: "#242424",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cal Sans', sans-serif", fontWeight: 600, fontSize: 15,
        }}>P</div>
        <span style={{ fontFamily: "'Cal Sans', sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em", color: "#ffffff" }}>Planorah</span>
      </Link>
      <Link to="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Back to site
      </Link>
    </div>

    {/* Headline + bullets */}
    <div style={{ position: "relative", maxWidth: 440 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 20,
      }}>
        Start for free
      </div>
      <div style={{
        fontFamily: "'Cal Sans', sans-serif", fontWeight: 600,
        fontSize: 44, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 28,
      }}>
        Master your time.<br />Maximize your learning.
      </div>
      <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 15, lineHeight: 1.55, marginBottom: 32 }}>
        Join thousands of students who turned a semester of chaos into a calm weekly plan.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          "Free for students — no credit card",
          "Import your syllabi in under a minute",
          "AI study assistant grounded in your plan",
        ].map((line) => (
          <div key={line} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.88)" }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", flexShrink: 0,
            }}>
              <CheckIcon />
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>

    {/* Testimonial */}
    <div style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
      <div style={{ fontFamily: "'Cal Sans', sans-serif", fontSize: 18, lineHeight: 1.4, marginBottom: 14, maxWidth: 460 }}>
        "I stopped keeping a bullet journal. Planorah does the hard part — deciding what to work on — so I can just work."
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600,
        }}>MS</div>
        Maya S. · Junior, Comp Sci — UC Berkeley
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const prefillEmail = location.state?.prefillEmail;
    if (prefillEmail) setFormData((prev) => ({ ...prev, email: prefillEmail }));
  }, [location.state]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) { setMessage("Please agree to the terms to continue."); return; }
    setLoading(true);
    try {
      const res = await axios.post(`/api/users/register/`, formData);
      const responseMessage = res.data.message || "OTP sent successfully!";
      setMessage(`success:${responseMessage}`);
      if (res.data.verify_required || /otp/i.test(responseMessage)) {
        setTimeout(() => navigate("/verify-otp", { state: { email: res.data.email || formData.email } }), 1200);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setMessage("");
      try {
        const res = await axios.post(`/api/users/google/login/`, { token: tokenResponse.access_token, mode: "signup" });
        if (res.data.two_factor_required) {
          navigate("/verify-otp", { state: { email: res.data.email, isLogin: true } });
          return;
        }
        setTokens(res.data.access, res.data.refresh, false);
        setMessage("success:Google signup successful!");
        setTimeout(() => navigate(res.data.onboarding_complete ? "/dashboard" : "/onboarding"), 1400);
      } catch (err) {
        const d = err.response?.data;
        const details = d?.details ? ` (${d.details})` : "";
        setMessage(d?.error ? `${d.error}${details}` : "Google signup failed.");
      } finally { setLoading(false); }
    },
    onError: () => { setMessage("Google signup failed."); setLoading(false); },
  });

  const handleGitHub = () => {
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/github/callback");
    const scope = encodeURIComponent("read:user user:email");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent("signup")}`;
  };

  const isSuccess = message.startsWith("success:");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2"
      style={{ minHeight: "100vh", background: "var(--auth-white, #fff)" }}
    >
      <BrandPanel />

      {/* ── Form panel ── */}
      <div style={{ display: "flex", flexDirection: "column", background: "var(--auth-white, #fff)", overflowY: "auto" }}>

        {/* Top bar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "20px 32px", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--auth-mid-gray, #898989)" }}>Already have an account?</span>
          <Link to="/login" style={{
            fontSize: 13, fontWeight: 500,
            color: "var(--auth-midnight, #111111)", textDecoration: "none",
            borderBottom: "1px solid var(--auth-midnight, #111111)",
          }}>
            Sign in →
          </Link>
        </header>

        {/* Form body */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            <h2 style={{
              fontFamily: "'Cal Sans', sans-serif", fontWeight: 600,
              fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.02em",
              marginBottom: 8, color: "var(--auth-midnight, #111111)",
            }}>
              Create your account
            </h2>
            <p style={{ fontSize: 15, color: "var(--auth-mid-gray, #898989)", marginBottom: 32 }}>
              Takes less than a minute. Free while you're a student.
            </p>

            {/* SSO */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              <button type="button" className="sso-btn" onClick={() => googleLogin()}>
                <GoogleIcon />
                Sign up with Google
              </button>
              <button type="button" className="sso-btn" onClick={handleGitHub}>
                <GitHubIcon />
                Sign up with GitHub
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--auth-mid-gray, #898989)", fontSize: 12, marginBottom: 22 }}>
              <div style={{ flex: 1, height: 1, background: "var(--auth-border-subtle, rgba(34,42,53,0.08))" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                or with email
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--auth-border-subtle, rgba(34,42,53,0.08))" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Username */}
              <div>
                <label htmlFor="register-username" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--auth-midnight, #111111)", marginBottom: 6 }}>
                  Username
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="register-username"
                    className="auth-input"
                    type="text"
                    name="username"
                    placeholder="alex_rivera"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* School email */}
              <div>
                <label htmlFor="register-email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--auth-midnight, #111111)", marginBottom: 6 }}>
                  School email
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="register-email"
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="you@school.edu"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ fontSize: 12, color: "var(--auth-mid-gray, #898989)", marginTop: 6 }}>
                  .edu emails unlock the free student plan automatically
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--auth-midnight, #111111)", marginBottom: 6 }}>
                  Password
                </label>
                <div className="auth-input-wrap" style={{ position: "relative" }}>
                  <input
                    id="register-password"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: 56 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: 0, cursor: "pointer",
                      color: "var(--auth-mid-gray, #898989)", padding: "4px 8px",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <PwStrength value={formData.password} />
                </div>
              </div>

              {/* Terms checkbox */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--auth-midnight, #111111)", cursor: "pointer", userSelect: "none", lineHeight: 1.5 }}>
                <div style={{ paddingTop: 2, flexShrink: 0 }}>
                  <div
                    onClick={() => setAgree((v) => !v)}
                    role="checkbox"
                    aria-checked={agree}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setAgree((v) => !v); } }}
                    style={{
                      width: 16, height: 16, borderRadius: 4,
                      boxShadow: "var(--auth-shadow-ring, rgba(34,42,53,0.1) 0px 0px 0px 1px)",
                      background: agree ? "#242424" : "transparent",
                      color: "#ffffff",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "background 0.15s ease",
                    }}
                  >
                    {agree && <CheckIcon />}
                  </div>
                </div>
                <span>
                  I agree to the{" "}
                  <Link to="/terms" style={{ color: "var(--auth-midnight, #111111)", borderBottom: "1px solid rgba(34,42,53,0.2)", textDecoration: "none" }}>Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" style={{ color: "var(--auth-midnight, #111111)", borderBottom: "1px solid rgba(34,42,53,0.2)", textDecoration: "none" }}>Privacy Policy</Link>.
                </span>
              </label>

              {/* Error / success banner */}
              {message && (
                <div style={{
                  padding: "10px 12px",
                  background: isSuccess ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  borderRadius: 8, fontSize: 13,
                  color: isSuccess ? "#166534" : "#991b1b",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.replace("success:", "")}
                </div>
              )}

              <button type="submit" className="auth-primary-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading
                  ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                  : <><span>Create account</span><ArrowRightIcon /></>
                }
              </button>
            </form>

            <p style={{ marginTop: 32, fontSize: 12, color: "var(--auth-mid-gray, #898989)", textAlign: "center" }}>
              Protected by industry-standard encryption. Your syllabi never train third-party models.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "16px 32px" }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Support", "/support"]].map(([label, to]) => (
            <Link key={label} to={to} style={{ fontSize: 11.5, color: "var(--auth-mid-gray, #898989)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
          <span style={{ fontSize: 11.5, color: "var(--auth-border-subtle, rgba(34,42,53,0.3))" }}>© Planorah {new Date().getFullYear()}</span>
        </footer>
      </div>
    </motion.div>
  );
}
