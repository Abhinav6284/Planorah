import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { setTokens } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import env from "../config/env";
import {
  Sun, Moon, ArrowRight, Eye, EyeOff,
  CheckCircle2, AlertCircle, BarChart2, BookOpen, Sparkles,
} from "lucide-react";

const PHRASES = [
  "Start your journey today.",
  "Build your career roadmap.",
  "Unlock your full potential.",
  "Your goals, our platform.",
];

const FLOAT_CARDS = [
  {
    icon: Sparkles,
    title: "AI Goal Planner",
    sub: "Built just for you ✨",
    gradient: "from-[#D96C4A] to-[#E8956A]",
    pos: "top-[6%] right-[5%]",
    delay: 0,
  },
  {
    icon: BarChart2,
    title: "Progress Dashboard",
    sub: "See growth in real time 📊",
    gradient: "from-[#8B9681] to-[#a3b99a]",
    pos: "top-[8%] left-[4%]",
    delay: 1.5,
  },
  {
    icon: BookOpen,
    title: "Resume Builder",
    sub: "ATS-ready in minutes 🚀",
    gradient: "from-[#C4A44A] to-[#D4B86A]",
    pos: "bottom-[10%] right-[5%]",
    delay: 3,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const prefillEmail = location.state?.prefillEmail;
    if (prefillEmail) setFormData((prev) => ({ ...prev, email: prefillEmail }));
  }, [location.state]);

  useEffect(() => {
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        console.error("Google OAuth Error:", err.response?.data);
        const d = err.response?.data;
        const details = d?.details ? ` (${d.details})` : "";
        setMessage(d?.error ? `${d.error}${details}` : "Google signup failed.");
      } finally { setLoading(false); }
    },
    onError: () => { setMessage("Google signup failed."); setLoading(false); },
  });

  const isSuccess = message.startsWith("success:");

  const fieldClass = (field) =>
    `relative rounded-xl border transition-all duration-200 ${
      focusedField === field
        ? "border-[#D96C4A] ring-2 ring-[#D96C4A]/15 bg-white dark:bg-white/[0.08]"
        : "border-black/[0.09] dark:border-white/[0.09] bg-white dark:bg-white/[0.04]"
    }`;

  return (
    <div className="h-screen flex overflow-hidden font-outfit">

      {/* ════════════════════════════════════════
          LEFT — Immersive visual panel
          ════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[54%] relative bg-[#080808] overflow-hidden flex-col">

        {/* Animated ambient orbs */}
        <motion.div
          className="absolute w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,150,129,0.26) 0%, transparent 65%)", top: "-18%", left: "-12%" }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[580px] h-[580px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(217,108,74,0.22) 0%, transparent 65%)", bottom: "-18%", right: "-10%" }}
          animate={{ scale: [1, 1.22, 1], x: [0, 25, 0], y: [0, -35, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,164,74,0.13) 0%, transparent 65%)", top: "30%", right: "15%" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-sm overflow-hidden flex items-center justify-center">
              <img src="/planorah_logo.png" alt="Planorah" className="w-7 h-7 object-contain invert" />
            </div>
            <span className="text-xl font-semibold font-cormorant text-white/90 tracking-wide">Planorah</span>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center relative">

            {/* Floating cards */}
            {FLOAT_CARDS.map((card, i) => (
              <motion.div
                key={i}
                className={`absolute ${card.pos} z-20`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 + i * 0.2 },
                  scale: { duration: 0.6, delay: 0.6 + i * 0.2 },
                  y: { duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: card.delay },
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-white/90 leading-none mb-1">{card.title}</div>
                    <div className="text-[11px] text-white/50 leading-none">{card.sub}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Cycling headline */}
            <div className="relative z-10 px-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[13px] font-medium text-white/40 uppercase tracking-[0.2em] mb-5"
              >
                Join 10,000+ Achievers
              </motion.p>

              <div className="h-[140px] flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[52px] font-playfair font-bold text-white leading-[1.1] tracking-tight"
                  >
                    {PHRASES[phraseIdx]}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-base text-white/45 max-w-sm leading-relaxed mt-4"
              >
                AI-powered goal planning, resume builder, interview prep
                and mentorship — everything in one place.
              </motion.p>
            </div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex items-center gap-10 pt-8 border-t border-white/[0.08]"
          >
            {[["Free", "Forever Plan"], ["2 min", "Setup Time"], ["10k+", "Active Users"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-[22px] font-bold text-white leading-none">{val}</div>
                <div className="text-[12px] text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Form panel
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-[#FDFBF7] dark:bg-[#0F0F0F] overflow-y-auto">

        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group lg:invisible">
            <div className="w-7 h-7 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/planorah_logo.png" alt="Planorah" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-semibold font-cormorant text-charcoal dark:text-white">Planorah</span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "light" ? <Moon className="w-[15px] h-[15px]" /> : <Sun className="w-[15px] h-[15px] text-yellow-400" />}
            </button>
            <Link
              to="/login"
              className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[360px] space-y-7"
          >
            {/* Heading */}
            <div>
              <h1 className="text-[26px] font-semibold text-charcoal dark:text-white tracking-[-0.4px] leading-tight">
                Create your account
              </h1>
              <p className="mt-1.5 text-[14px] text-gray-500 dark:text-gray-400">
                Free forever — no credit card required
              </p>
            </div>

            {/* Social buttons */}
            <div className="space-y-2.5">
              <motion.button
                whileTap={{ scale: 0.985 }}
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/[0.06] border border-black/[0.09] dark:border-white/[0.09] hover:bg-gray-50 dark:hover:bg-white/[0.10] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.09)]"
              >
                <svg className="w-[17px] h-[17px] flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[13.5px] font-medium text-charcoal dark:text-gray-200">Continue with Google</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  const clientId = env.GITHUB_CLIENT_ID;
                  const redirectUri = encodeURIComponent(window.location.origin + "/auth/github/callback");
                  const scope = encodeURIComponent("read:user user:email");
                  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent("signup")}`;
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/[0.06] border border-black/[0.09] dark:border-white/[0.09] hover:bg-gray-50 dark:hover:bg-white/[0.10] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.09)]"
              >
                <svg className="w-[17px] h-[17px] text-charcoal dark:text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="text-[13.5px] font-medium text-charcoal dark:text-gray-200">Continue with GitHub</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <span className="text-[11.5px] font-medium text-gray-400 dark:text-gray-500 tracking-wide">or sign up with email</span>
              <div className="flex-1 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className={fieldClass("username")}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 bg-transparent text-[14px] text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none rounded-xl"
                  required
                />
              </div>

              <div className={fieldClass("email")}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  className="w-full px-4 py-3 bg-transparent text-[14px] text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none rounded-xl"
                  required
                />
              </div>

              <div className={fieldClass("password")}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-11 bg-transparent text-[14px] text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Feedback */}
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium overflow-hidden ${
                      isSuccess
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    {message.replace("success:", "")}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 rounded-xl bg-charcoal dark:bg-white text-white dark:text-charcoal text-[14px] font-semibold transition-all duration-200 hover:bg-[#2a2a2a] dark:hover:bg-gray-100 disabled:opacity-60 flex items-center justify-center gap-2 group shadow-[0_2px_12px_rgba(26,26,26,0.18)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
              >
                {loading ? (
                  <div className="w-[17px] h-[17px] border-2 border-white/20 dark:border-charcoal/20 border-t-white dark:border-t-charcoal rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-[15px] h-[15px] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-[11.5px] text-gray-400 dark:text-gray-500 leading-relaxed">
                By signing up you agree to our{" "}
                <Link to="/terms" className="underline hover:text-charcoal dark:hover:text-gray-300 transition-colors">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="underline hover:text-charcoal dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>.
              </p>
            </form>

            {/* Login link */}
            <p className="text-center text-[13px] text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#D96C4A] hover:text-[#C45B3A] transition-colors">
                Sign in →
              </Link>
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-5 px-8 py-4 flex-shrink-0">
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Help", "/contact"]].map(([label, to]) => (
            <Link key={label} to={to} className="text-[11.5px] text-gray-400 dark:text-gray-500 hover:text-charcoal dark:hover:text-gray-300 transition-colors">
              {label}
            </Link>
          ))}
          <span className="text-[11.5px] text-gray-300 dark:text-gray-600">© Planorah 2025</span>
        </footer>
      </div>
    </div>
  );
}
