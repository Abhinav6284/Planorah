import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/register/`, formData);
      setMessage("success:" + (res.data.message || "OTP sent successfully!"));
      if (res.data.message.includes("OTP")) {
        setTimeout(() => navigate("/verify-otp", { state: { ...formData } }), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/google/login/`, {
        token: credentialResponse.credential
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setMessage("success:Google signup successful!");
      if (res.data.onboarding_complete) {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google signup failed. Please try again.");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-3xl opacity-80" />

        {/* Road/Path SVG */}
        <svg className="absolute inset-0 w-full h-full text-black/5" viewBox="0 0 400 800" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Winding path */}
          <motion.path
            d="M 350 800 Q 300 700 200 650 Q 100 600 150 500 Q 200 400 100 350 Q 50 300 150 200 Q 250 100 200 0"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="40"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          {/* Center line of path */}
          <motion.path
            d="M 350 800 Q 300 700 200 650 Q 100 600 150 500 Q 200 400 100 350 Q 50 300 150 200 Q 250 100 200 0"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="20 10"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>

        {/* Milestone markers on the path */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-24 right-20 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-200"
        >
          <span className="text-blue-600 text-xs font-bold">1</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="absolute top-1/2 left-16 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-200"
        >
          <span className="text-blue-600 text-xs font-bold">2</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="absolute top-1/4 right-1/3 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300"
        >
          <span className="text-sm font-bold">🎯</span>
        </motion.div>

        {/* Floating diamond shape */}
        <motion.div
          animate={{ rotate: 45, y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-24 w-16 h-16 border-2 border-gray-200 rounded-lg"
        />

        {/* Floating circle */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-1/3 w-20 h-20 border-2 border-blue-200 rounded-full"
        />

        {/* Sparkle dots */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-40"
            style={{
              left: `${15 + (i * 5.5) % 70}%`,
              top: `${10 + (i * 4.2) % 80}%`,
            }}
          />
        ))}
      </div>

      {/* Centered Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 my-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Planorah.</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500">Struggling on projects? Let us help you succeed ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-center text-sm font-medium ${message.startsWith("success:")
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
                }`}
            >
              {message.replace("success:", "")}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-black/20 hover:shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const btn = document.querySelector('[data-google-login]');
              if (btn) btn.click();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          {/* Hidden Google Login Component */}
          <div className="hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              data-google-login
            />
          </div>

          <button
            onClick={() => {
              const clientId = 'Ov23liVToka1aLne9uVb';
              const redirectUri = encodeURIComponent(window.location.origin + '/auth/github/callback');
              const scope = encodeURIComponent('read:user user:email');
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-bold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
