import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PlanoraLogo from "../assets/Planora.svg";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      setMessage("⚠️ Please enter both email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = { identifier: identifier.trim(), password };
      const res = await axios.post("http://127.0.0.1:8000/api/users/login/", payload);

      if (rememberMe) {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
      } else {
        sessionStorage.setItem("access_token", res.data.access);
        sessionStorage.setItem("refresh_token", res.data.refresh);
      }

      setMessage("✅ Welcome back!");
      setMessage("✅ Welcome back!");

      if (res.data.onboarding_complete) {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "❌ Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/google/login/", {
        token: credentialResponse.credential
      });

      if (rememberMe) {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
      } else {
        sessionStorage.setItem("access_token", res.data.access);
        sessionStorage.setItem("refresh_token", res.data.refresh);
      }

      setMessage("✅ Google login successful!");

      if (res.data.onboarding_complete) {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "❌ Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("❌ Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 w-full max-w-md p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={PlanoraLogo} alt="Planorah" className="h-8 w-auto dark:invert" />
            <span className="text-xl font-serif font-bold text-gray-900 dark:text-white">Planorah.</span>
          </Link>
          <h2 className="text-3xl font-serif font-medium text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 dark:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-400 dark:text-gray-500">or continue with</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* OAuth Sign-In Buttons */}
        <div className="space-y-3">
          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* GitHub Sign-In Button */}
          <button
            onClick={() => {
              const clientId = 'Ov23liVToka1aLne9uVb';
              const redirectUri = encodeURIComponent('http://localhost:5173/auth/github/callback');
              const scope = encodeURIComponent('read:user user:email');
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            }}
            disabled={loading}
            className="w-full py-3 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-3 rounded-xl text-center text-sm font-medium ${message.includes("✅") ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
          >
            {message}
          </motion.div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-black dark:text-white font-medium hover:underline"
          >
            Create account
          </button>
        </div>
      </motion.div>
    </div>
  );
}