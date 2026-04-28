import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { setTokens, setRememberMePreference, getTrustedDeviceToken } from "../utils/auth";
import env from "../config/env";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

// ── Shared brand-panel pieces ──────────────────────────────────────────────

const GridBackdrop = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}>
    <defs>
      <pattern id="authGrid" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0H0V44" fill="none" stroke="var(--fg-muted)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#authGrid)" />
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

// ── Brand panel (left half) ────────────────────────────────────────────────

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

    {/* Top: logo */}
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

    {/* Middle: headline + bullets */}
    <div style={{ position: "relative", maxWidth: 440 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 12,
      }}>
        Welcome back
      </div>
      <div style={{
        fontFamily: "'Cal Sans', sans-serif", fontWeight: 600,
        fontSize: 34, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18,
      }}>
        Your week,<br />already planned.
      </div>
      <div style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
        Pick up where you left off — your syllabi, schedule, and AI study assistant are waiting.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "Your plan syncs across every device",
          "Weekly focus score stays up to date",
          "Syllabus edits propagate automatically",
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

    {/* Bottom: testimonial */}
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

// ── Main component ─────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) { setMessage("Please enter both fields."); return; }
    setLoading(true); setMessage("");
    try {
      const res = await axios.post(`/api/users/login/`, { identifier: identifier.trim(), password });
      setTokens(res.data.access, res.data.refresh, rememberMe);
      setMessage("success:Welcome back!");
      setTimeout(() => navigate(res.data.onboarding_complete ? "/dashboard" : "/onboarding"), 1400);
    } catch (err) {
      const d = err.response?.data;
      if (d?.signup_required && d?.email) {
        setMessage("success:No account found. Taking you to sign up...");
        setTimeout(() => navigate("/register", { state: { prefillEmail: d.email } }), 1200);
        return;
      }
      if (d?.verify_required && d?.email) {
        setMessage("success:Please verify your email. Redirecting...");
        setTimeout(() => navigate("/verify-otp", { state: { email: d.email } }), 1200);
        return;
      }
      setMessage(d?.error || d?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setMessage("");
      try {
        const trustedToken = getTrustedDeviceToken();
        const res = await axios.post(`/api/users/google/login/`, {
          token: tokenResponse.access_token,
          mode: "login",
          ...(trustedToken && { trusted_device_token: trustedToken }),
        });
        if (res.data.two_factor_required) {
          setRememberMePreference(rememberMe);
          navigate("/verify-otp", { state: { email: res.data.email, isLogin: true } });
          return;
        }
        setTokens(res.data.access, res.data.refresh, rememberMe);
        setMessage("success:Google login successful!");
        setTimeout(() => navigate(res.data.onboarding_complete ? "/dashboard" : "/onboarding"), 1400);
      } catch (err) {
        const d = err.response?.data;
        if (d?.signup_required && d?.email) {
          setMessage("success:No account found. Taking you to sign up...");
          setTimeout(() => navigate("/register", { state: { prefillEmail: d.email } }), 1200);
          return;
        }
        const details = d?.details ? ` (${d.details})` : "";
        setMessage(d?.error ? `${d.error}${details}` : "Google login failed.");
      } finally { setLoading(false); }
    },
    onError: () => { setMessage("Google login failed."); setLoading(false); },
  });

  const handleGitHub = () => {
    setRememberMePreference(rememberMe);
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/github/callback");
    const scope = encodeURIComponent("read:user user:email");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent("login")}`;
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
      <div className="overflow-y-auto" style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        height: "100%"
      }}>
        {/* Top bar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 24px", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>Don't have an account?</span>
          <Link to="/register" style={{
            fontSize: 13, fontWeight: 500,
            color: "var(--fg-deep)", textDecoration: "none",
            borderBottom: "1px solid var(--fg-deep)",
          }}>
            Create one →
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
              Sign in to Planorah
            </h2>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 20 }}>
              Welcome back. Let's get your week moving.
            </p>

            {/* SSO buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <button type="button" className="sso-btn" onClick={() => googleLogin()}>
                <GoogleIcon />
                Continue with Google
              </button>
              <button type="button" className="sso-btn" onClick={handleGitHub}>
                <GitHubIcon />
                Continue with GitHub
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

            {/* Email + password form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Email field */}
              <div>
                <label htmlFor="login-identifier" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--fg-deep)", marginBottom: 4 }}>
                  Email or username
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="login-identifier"
                    className="auth-input"
                    type="text"
                    placeholder="you@school.edu or username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-deep)" }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 12, color: "var(--fg-muted)", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-wrap" style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {/* Remember me */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--fg-deep)", cursor: "pointer", userSelect: "none" }}>
                <div
                  onClick={() => setRememberMe((v) => !v)}
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRememberMe((v) => !v); } }}
                  style={{
                    width: 16, height: 16, borderRadius: 4,
                    boxShadow: "var(--shadow-ring)",
                    background: rememberMe ? "var(--charcoal)" : "transparent",
                    color: "var(--fg-deep)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "background 0.15s ease", flexShrink: 0,
                  }}
                >
                  {rememberMe && <CheckIcon />}
                </div>
                Keep me signed in on this device
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
                  {isSuccess
                    ? <CheckCircle2 size={14} />
                    : <AlertCircle size={14} />}
                  {message.replace("success:", "")}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between px-8 group disabled:opacity-70"
              >
                <span>{loading ? "Signing in..." : "Login to Your Account"}</span>
                <span className="bg-gray-400 dark:bg-gray-600 p-2 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-500 transition-colors">
                  <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </form>

            <p style={{ marginTop: 14, fontSize: 11, color: "var(--fg-muted)", textAlign: "center" }}>
              Protected by industry-standard encryption. Your syllabi never train third-party models.
            </p>
          </div>

        {/* Footer Link */}
        <div className="mt-16 text-center">
          <Link to="/forgot-password" className="text-lg font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors border-b-2 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white pb-0.5">
            Forgot Passcode?
          </Link>
        </div>

      </main>

        {/* Footer */}
        <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "10px 24px" }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Support", "/support"]].map(([label, to]) => (
            <Link key={label} to={to} style={{ fontSize: 11.5, color: "var(--fg-muted)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
          <span style={{ fontSize: 11.5, color: "var(--auth-border-subtle, rgba(34,42,53,0.3))" }}>© Planorah {new Date().getFullYear()}</span>
        </footer>
      </div>
    </motion.div>
  );
}
