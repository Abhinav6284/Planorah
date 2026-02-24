import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function ResetPassword() {
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!email) {
            setMessage({ text: "Session expired. Please try again.", type: "error" });
            setTimeout(() => navigate("/forgot-password"), 2000);
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirm) {
            setMessage({ text: "Please fill in all fields.", type: "error" });
            return;
        }
        if (password !== confirm) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }
        if (password.length < 8) {
            setMessage({ text: "Password must be at least 8 characters.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await axios.post(
                `/api/users/reset-password/`,
                { email, new_password: password }
            );

            setMessage({ text: res.data.message || "Password reset successfully.", type: "success" });
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || "Failed to reset password.",
                type: "error",
            });
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
                    <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">Reset your password</h2>
                    <p className="text-gray-500 text-sm">Choose a strong password you can remember</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-2 uppercase">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-xs font-semibold text-gray-700 hover:text-black"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-2 uppercase">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-xs font-semibold text-gray-700 hover:text-black"
                            >
                                {showConfirm ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                        <p className={password.length >= 8 ? "text-green-600 font-semibold" : ""}>
                            • At least 8 characters
                        </p>
                        <p className={password === confirm && password ? "text-green-600 font-semibold" : ""}>
                            • Passwords match
                        </p>
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
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Password reset?{" "}
                        <Link to="/login" className="font-medium text-black hover:text-gray-600 transition-colors">
                            Go to login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
