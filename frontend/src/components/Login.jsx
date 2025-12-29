import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const payload = { identifier: identifier.trim(), password };
      const res = await axios.post(`${API_BASE_URL}/api/users/login/`, payload);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setMessage("success:Welcome back!");
      if (res.data.onboarding_complete) {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setMessage("");
      try {
        const res = await axios.post(`${API_BASE_URL}/api/users/google/login/`, {
          token: tokenResponse.access_token
        });
        if (res.data.two_factor_required) {
          // Redirect to OTP verification page
          navigate("/verify-otp", {
            state: {
              email: res.data.email,
              isLogin: true
            }
          });
          return;
        }

        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        setMessage("success:Google login successful!");
        if (res.data.onboarding_complete) {
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          setTimeout(() => navigate("/onboarding"), 1500);
        }
      } catch (err) {
        console.error('Google OAuth Error:', err.response?.data);
        const serverMsg = err.response?.data?.error || err.response?.data?.message;
        const details = err.response?.data?.details ? ` (${err.response.data.details})` : '';
        setMessage(serverMsg ? `${serverMsg}${details}` : "Google login failed.");
      } finally {
        if (!loading) setLoading(false);
      }
    },
    onError: () => {
      setMessage("Google login failed. Please try again.");
      setLoading(false);
    }
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/google/login/`, {
        token: credentialResponse.credential
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setMessage("success:Google login successful!");
      if (res.data.onboarding_complete) {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-100 flex flex-col justify-between p-4 md:p-6 lg:p-12">
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight">Planorah.</Link>
        <div className="flex items-center gap-3 md:gap-6">
          <Link to="/contact" className="hidden md:block text-sm font-medium hover:opacity-70">Support</Link>
          <Link to="/register" className="px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-full transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto mt-12 md:mt-0">

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-xs font-medium text-gray-500 mb-6">
            Welcome back to Planorah
          </span>
          <h1 className="text-5xl md:text-7xl font-serif max-w-4xl mx-auto leading-tight relative z-10">
            Login to Your <br />
            <span className="relative inline-block">
              Account
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 w-full h-4 text-yellow-300 -z-10"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </motion.svg>
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto">
            Uncover the untapped potential of your productivity and verify your growth.
          </p>
        </div>

        {/* Split Layout Form */}
        <div className="flex flex-col md:flex-row items-stretch justify-between w-full gap-12 md:gap-20">

          {/* Left Column: Manual Login */}
          <div className="flex-1 w-full space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username / Email"
                  className="w-full px-8 py-5 rounded-full bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 shadow-sm text-lg"
                  required
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-8 py-5 rounded-full bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 shadow-sm text-lg"
                  required
                />
              </div>

              {message && (
                <div className={`text-sm font-medium ${message.startsWith("success:") ? "text-green-600" : "text-red-500"}`}>
                  {message.replace("success:", "")}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between px-8 group disabled:opacity-70"
              >
                <span>{loading ? "Signing in..." : "Login to Your Account"}</span>
                <span className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="h-full w-px bg-gray-200/50"></div>
            <span className="py-4 text-gray-400 italic font-serif text-xl">/</span>
            <div className="h-full w-px bg-gray-200/50"></div>
          </div>
          <div className="md:hidden flex items-center gap-4 w-full">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 italic">or</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Right Column: Social Login */}
          <div className="flex-1 w-full space-y-4 flex flex-col justify-center">
            {/* Google Button */}
            <button
              onClick={() => login()}
              className="w-full py-4 px-8 rounded-full border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-start gap-4 group bg-white shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-gray-50 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-700">Sign in with Gmail Account</span>
            </button>



            {/* GitHub Button */}
            <button
              onClick={() => {
                const clientId = 'Ov23ctPC9ZlwUvXMuyWM';
                const redirectUri = encodeURIComponent(window.location.origin + '/auth/github/callback');
                const scope = encodeURIComponent('read:user user:email');
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
              }}
              className="w-full py-4 px-8 rounded-full border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-start gap-4 group bg-white shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-gray-50 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-700">Sign in with GitHub account</span>
            </button>

            {/* Placeholder for more buttons (Apple, Facebook etc) */}
            <div className="w-full py-4 px-8 rounded-full border border-gray-100 flex items-center justify-start gap-4 opacity-50 cursor-not-allowed">
              <div className="p-2 bg-gray-50 rounded-full">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.02 2.68.75 3.37 1.74-2.69 1.63-2.12 5.04.5 6.13-.57 1.4-1.31 2.76-2.46 3.16zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.29-2.08 4.28-3.74 4.25z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-400">Sign in Apple Secure ID</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-16 text-center">
          <Link to="/forgot-password" className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors border-b-2 border-black/10 hover:border-black pb-0.5">
            Forgot Passcode?
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400 mt-12 py-4 border-t border-gray-100 md:border-none">
        <div className="flex gap-6">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
        <div className="text-center sm:text-right">
          Copyrights @Planorah 2024
        </div>
      </footer>
    </div>
  );
}
