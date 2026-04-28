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
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}>
    <defs>
      <pattern id="authGrid2" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0H0V44" fill="none" stroke="var(--fg-muted)" strokeWidth="1" />
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
  
  // Semantic colors based on score level
  const colorMap = {
    1: "#ef4444", // Red (Weak)
    2: "#f59e0b", // Orange (Okay)
    3: "#10b981", // Green (Strong)
    4: "#059669", // Dark Green (Excellent)
  };
  const activeColor = colorMap[score] || "var(--charcoal)";

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? activeColor : "var(--border-subtle)",
            transition: "background 0.25s ease",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: activeColor !== "var(--charcoal)" ? activeColor : "var(--fg-muted)", marginTop: 4, fontWeight: score > 2 ? 500 : 400 }}>
        {value ? label : <span style={{ color: "var(--fg-muted)" }}>8+ characters recommended, with a number or symbol.</span>}
      </div>
    </div>
  );
};

// ── Brand panel (register variant) ───────────────────────────────────────

const BrandPanel = () => (
  <div
    className="hidden lg:flex flex-col justify-between overflow-y-auto"
    style={{
      position: "relative",
      background: "var(--surface)",
      color: "var(--fg)",
      padding: "28px 40px",
      overflow: "hidden",
    }}
  >
    <GridBackdrop />

    {/* Logo */}
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--fg-deep)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          overflow: 'hidden'
        }}>
          <img 
            src="/planorah_logo.png" 
            alt="P" 
            style={{ 
              width: 18, 
              height: 18, 
              objectFit: 'contain',
              filter: 'invert(1)' // Always invert since container is var(--fg-deep)
            }} 
          />
        </div>
        <span style={{ fontFamily: "'Cal Sans', sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em", color: "var(--fg-deep)" }}>Planorah</span>
      </Link>
      <Link to="/" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Back to site
      </Link>
    </div>

    {/* Headline + bullets */}
    <div style={{ position: "relative", maxWidth: 440 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 12,
      }}>
        Start for free
      </div>
      <div style={{
        fontFamily: "'Cal Sans', sans-serif", fontWeight: 600,
        fontSize: 34, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18,
      }}>
        Master your time.<br />Maximize your learning.
      </div>
      <div style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
        Join thousands of students who turned a semester of chaos into a calm weekly plan.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "Free for students — no credit card",
          "Import your syllabi in under a minute",
          "AI study assistant grounded in your plan",
        ].map((line) => (
          <div key={line} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--fg)" }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "1px solid var(--border-subtle)",
              background: "var(--light-gray)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-deep)", flexShrink: 0,
            }}>
              <CheckIcon />
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>

    {/* Testimonial */}
    <div style={{ position: "relative", borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
      <div style={{ fontFamily: "'Cal Sans', sans-serif", fontSize: 15, lineHeight: 1.4, marginBottom: 10, maxWidth: 460 }}>
        "I stopped keeping a bullet journal. Planorah does the hard part — deciding what to work on — so I can just work."
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--fg-muted)" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--light-gray)",
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
      className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-screen w-full"
      style={{ background: "var(--bg)" }}
    >
      <BrandPanel />

      {/* ── Form panel ── */}
      <div className="overflow-y-auto" style={{ display: "flex", flexDirection: "column", background: "var(--bg)", height: "100%" }}>

        {/* Top bar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 24px", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>Already have an account?</span>
          <Link to="/login" style={{
            fontSize: 13, fontWeight: 500,
            color: "var(--fg-deep)", textDecoration: "none",
            borderBottom: "1px solid var(--fg-deep)",
          }}>
            Sign in →
          </Link>
        </header>

        {/* Form body */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 24px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>

            <h2 style={{
              fontFamily: "'Cal Sans', sans-serif", fontWeight: 600,
              fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em",
              marginBottom: 6, color: "var(--fg-deep)",
            }}>
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 20 }}>
              Takes less than a minute. Free while you're a student.
            </p>

            {/* SSO */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg-muted)", fontSize: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                or with email
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Username */}
              <div>
                <label htmlFor="register-username" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--fg-deep)", marginBottom: 4 }}>
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

              {/* Email */}
              <div>
                <label htmlFor="register-email" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--fg-deep)", marginBottom: 4 }}>
                  Email
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="register-email"
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--fg-deep)", marginBottom: 4 }}>
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
                      color: "var(--fg-muted)", padding: "4px 8px",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <PwStrength value={formData.password} />
                </div>
              </div>

              {/* Terms checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--fg-deep)", cursor: "pointer", userSelect: "none", lineHeight: 1.5, marginTop: 12 }}>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                  <div
                    onClick={() => setAgree((v) => !v)}
                    role="checkbox"
                    aria-checked={agree}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setAgree((v) => !v); } }}
                    style={{
                      width: 16, height: 16, borderRadius: 4,
                      boxShadow: "var(--shadow-ring)",
                      background: agree ? "var(--fg-deep)" : "transparent",
                      color: "var(--bg)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "background 0.15s ease",
                    }}
                  >
                    {agree && <CheckIcon />}
                  </div>
                </div>
                <span>
                  I agree to the{" "}
                  <Link to="/terms" style={{ color: "var(--fg-deep)", borderBottom: "1px solid var(--border-subtle)", textDecoration: "none" }}>Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" style={{ color: "var(--fg-deep)", borderBottom: "1px solid var(--border-subtle)", textDecoration: "none" }}>Privacy Policy</Link>.
                </span>
              </label>

              {/* Error / success banner */}
              {message && (
                <div style={{
                  padding: "10px 12px",
                  marginTop: 8,
                  background: isSuccess ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  borderRadius: 8, fontSize: 13,
                  color: isSuccess ? "#166534" : "#991b1b",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.replace("success:", "")}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between px-8 group disabled:opacity-70"
              >
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                <span className="bg-gray-400 dark:bg-gray-600 p-2 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-500 transition-colors">
                  <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </form>

            <p style={{ marginTop: 20, fontSize: 11, color: "var(--fg-muted)", textAlign: "center" }}>
              Protected by industry-standard encryption. Your syllabi never train third-party models.
            </p>
          </div>
        </main>

          {/* Right Column: Social Login */}
          <div className="flex-1 w-full space-y-4 flex flex-col justify-center">
            {/* Google Button */}
            <button
              onClick={() => login()}
              className="w-full py-4 px-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-start gap-4 group bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Sign up with Gmail Account</span>
            </button>



            {/* GitHub Button */}
            <button
              onClick={() => {
                const clientId = env.GITHUB_CLIENT_ID;
                const redirectUri = encodeURIComponent(window.location.origin + '/auth/github/callback');
                const scope = encodeURIComponent('read:user user:email');
                const state = encodeURIComponent('signup');
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
              }}
              className="w-full py-4 px-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-start gap-4 group bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Sign up with GitHub account</span>
            </button>

            {/* Placeholder for more buttons (Apple, Facebook etc) */}
            <div className="w-full py-4 px-8 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-start gap-4 opacity-50 cursor-not-allowed">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.02 2.68.75 3.37 1.74-2.69 1.63-2.12 5.04.5 6.13-.57 1.4-1.31 2.76-2.46 3.16zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.29-2.08 4.28-3.74 4.25z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-400">Sign up Apple Secure ID</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-16 text-center">
          <Link to="/contact" className="text-lg font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors border-b-2 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white pb-0.5">
            Need Help?
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500 mt-12 py-4 border-t border-gray-100 dark:border-gray-800 md:border-none">
        <div className="flex gap-6">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
        <div className="text-center sm:text-right">
          Copyrights @Planorah 2025
        </div>
      </footer>
    </div>
  );
}
