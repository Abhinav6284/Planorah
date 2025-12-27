import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import PlanoraLogo from "../assets/Planora.svg";
import { API_BASE_URL } from "../api/axios";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      setMessage({ text: "Email not provided. Redirecting to register...", type: "error" });
      setTimeout(() => navigate("/register"), 2000);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setMessage({ text: "Please enter all 6 digits", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/verify-otp/`, {
        email: email.trim(),
        otp: otpString,
      });

      if (response.status === 201) {
        // Auto-login: Save tokens
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        setMessage({ text: "Verified! Setting up profile...", type: "success" });
        setTimeout(() => navigate("/complete-profile"), 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid OTP. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_BASE_URL}/api/users/resend-otp/`, { email });
      setMessage({ text: "A new OTP has been sent to your email", type: "success" });
      setCountdown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setMessage({ text: "Failed to resend OTP. Please try again.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={PlanoraLogo} alt="Planorah" className="h-8 w-auto" />
            <span className="text-xl font-serif font-bold text-gray-900">Planorah.</span>
          </Link>
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-500 text-sm">
            We've sent a 6-digit code to
          </p>
          {email && (
            <p className="text-gray-900 font-medium mt-1">{email}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 sm:w-14 sm:h-16 border-2 border-gray-200 rounded-xl text-center text-xl sm:text-2xl font-bold text-gray-900 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-center text-sm ${message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {message.type === "success" ? "✓ " : "✕ "}
              {message.text}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 ${loading || otp.join("").length !== 6
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className={`text-sm font-medium transition-colors ${countdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:text-gray-600"
                }`}
            >
              {resending ? (
                "Sending..."
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        </form>

        {/* Back to Register Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Wrong email?{" "}
            <Link to="/register" className="font-medium text-black hover:text-gray-600 transition-colors">
              Go back to register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
