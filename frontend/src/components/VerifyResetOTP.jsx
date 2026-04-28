import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle2, AlertCircle, Sun, Moon } from "lucide-react";

export default function VerifyResetOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Determine email from State OR URL
  const params = new URLSearchParams(location.search);
  const effectiveEmail = email || params.get("email");
  const urlOtp = params.get("otp");

  useEffect(() => {
    if (!effectiveEmail) {
      setMessage("Email not found. Please try again.");
      setTimeout(() => navigate("/forgot-password"), 2000);
      return;
    }

    // Auto-fill OTP if present in URL
    if (urlOtp && urlOtp.length === 6 && otp[0] === "") {
      setOtp(urlOtp.split(""));
    }
  }, [effectiveEmail, navigate, urlOtp, otp]);

  const extractErrorMessage = (err, fallback) => {
    const responseData = err?.response?.data;
    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }
    return responseData?.message || responseData?.error || responseData?.detail || fallback;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setMessage("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `/api/users/verify-reset-otp/`,
        { email: effectiveEmail, otp: otpString }
      );
      setMessage("success:" + (res.data.message || "OTP verified successfully."));
      setTimeout(() => navigate("/reset-password", { state: { email: effectiveEmail } }), 1500);
    } catch (err) {
      setMessage(extractErrorMessage(err, "Invalid OTP. Try again."));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage("");

    try {
      await axios.post(`/api/users/request-password-reset/`, { email: effectiveEmail });
      setMessage("success:A new OTP has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const retryAfterSeconds = Number(err?.response?.headers?.["retry-after"]);
      const throttledMessage = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? `Too many requests. Try again in ${Math.ceil(retryAfterSeconds)} seconds.`
        : "Error resending OTP.";

      setMessage(extractErrorMessage(err, throttledMessage));
    } finally {
      setResending(false);
    }
  };

  const isSuccess = message.startsWith("success:");

  return (
    <div className="h-screen flex overflow-hidden font-outfit">
      {/* Left — Immersive panel */}
      <div className="hidden lg:flex lg:w-[54%] relative bg-[#080808] overflow-hidden flex-col">
        {/* Animated ambient orbs */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(217,108,74,0.28) 0%, transparent 65%)", top: "-15%", right: "-10%" }}
          animate={{ scale: [1, 1.18, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,150,129,0.22) 0%, transparent 65%)", bottom: "-20%", left: "-15%" }}
          animate={{ scale: [1, 1.25, 1], x: [0, -30, 0], y: [0, 35, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* Dot grid overlay */}
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
            <div className="relative z-10 px-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[13px] font-medium text-white/40 uppercase tracking-[0.2em] mb-5 font-outfit"
              >
                Verification
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="text-[52px] font-playfair font-bold text-white leading-[1.1] tracking-tight mb-4"
              >
                Verify OTP
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-base text-white/45 max-w-sm leading-relaxed mt-4 font-outfit"
              >
                Enter the 6-digit code we sent to your email to proceed with resetting your password.
              </motion.p>
            </div>
          </div>

          {/* Stats row at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex items-center gap-10 pt-8 border-t border-white/[0.08]"
          >
            {[["30 sec", "Code TTL"], ["6 Digits", "Required"], ["2 Attempts", "Remaining"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-[22px] font-bold text-white font-outfit leading-none">{val}</div>
                <div className="text-[12px] text-white/40 mt-1 font-outfit">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col bg-[#FDFBF7] dark:bg-[#0F0F0F] overflow-y-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group lg:invisible">
            <div className="w-7 h-7 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/planorah_logo.png" alt="Planorah" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-semibold font-cormorant text-charcoal dark:text-white">Planorah</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === "light" ? <Moon className="w-[15px] h-[15px]" /> : <Sun className="w-[15px] h-[15px] text-yellow-400" />}
          </button>
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
              <h1 className="text-[26px] font-semibold text-charcoal dark:text-white tracking-[-0.4px] font-outfit leading-tight">
                Verify OTP
              </h1>
              <p className="mt-1.5 text-[14px] text-gray-500 dark:text-gray-400">
                Enter the code sent to {effectiveEmail}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-11 h-11 border rounded-lg text-center text-lg font-bold border-black/[0.09] dark:border-white/[0.09] bg-white dark:bg-white/[0.04] text-charcoal dark:text-white focus:border-[#D96C4A] focus:ring-2 focus:ring-[#D96C4A]/15 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Feedback message */}
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

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 rounded-xl bg-charcoal dark:bg-white text-white dark:text-charcoal text-[14px] font-semibold transition-all duration-200 hover:bg-[#2a2a2a] dark:hover:bg-gray-100 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(26,26,26,0.18)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
              >
                {loading ? (
                  <div className="w-[17px] h-[17px] border-2 border-white/20 dark:border-charcoal/20 border-t-white dark:border-t-charcoal rounded-full animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </motion.button>

              {/* Resend section */}
              <div className="text-center pt-2">
                <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-2">Didn't receive the code?</p>
                <motion.button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resending}
                  whileTap={{ scale: 0.95 }}
                  className="text-[12.5px] font-medium text-[#D96C4A] hover:text-[#C45B3A] disabled:opacity-60 transition-colors"
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </motion.button>
              </div>
            </form>

            {/* Back link */}
            <p className="text-center text-[13px] text-gray-500 dark:text-gray-400">
              Wrong email?{" "}
              <Link to="/forgot-password" className="font-semibold text-[#D96C4A] hover:text-[#C45B3A] transition-colors">
                Try again →
              </Link>
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-5 px-8 py-4 flex-shrink-0">
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Support", "/support"]].map(([label, to]) => (
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

