import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage({ text: "Please enter your email address.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await axios.post(
                `/api/users/request-password-reset/`,
                { email: email.trim() }
            );

            setMessage({ text: res.data.message || "OTP sent successfully!", type: "success" });
            setTimeout(() => {
                navigate("/verify-reset-otp", { state: { email: email.trim() } });
            }, 1500);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "Unable to send OTP. Please try again later.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block text-xl font-serif font-bold text-gray-900 mb-6">
                        Planorah<span className="text-gray-400">.</span>
                    </Link>
                    <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">Forgot your password?</h2>
                    <p className="text-gray-500 text-sm">
                        Enter your email to receive a 6-digit OTP
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-2 uppercase">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 ${loading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Remembered your password?{" "}
                        <Link to="/login" className="font-medium text-black hover:text-gray-600 transition-colors">
                            Back to login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
