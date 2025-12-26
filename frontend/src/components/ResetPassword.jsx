import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        if (!email) {
            setMessage("⚠️ Session expired. Please try again.");
            setTimeout(() => navigate("/forgot-password"), 2000);
        }

        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirm) {
            setMessage("⚠️ Please fill in all fields.");
            return;
        }
        if (password !== confirm) {
            setMessage("⚠️ Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setMessage("⚠️ Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/users/reset-password/",
                { email, new_password: password }
            );

            setMessage("✅ " + res.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "❌ Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center">
            {/* Animated gradient */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%, black, transparent)`,
                }}
            />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute border border-black/5"
                        style={{
                            width: `${70 + i * 30}px`,
                            height: `${70 + i * 30}px`,
                            left: `${(i * 16) % 100}%`,
                            top: `${(i * 21) % 100}%`,
                            animation: `float-random ${8 + i}s ease-in-out infinite`,
                            animationDelay: `${i * 0.35}s`,
                        }}
                    />
                ))}
            </div>

            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-black/20" />
            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-black/20" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-black/20" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-black/20" />

            {/* Main content */}
            <div
                className={`relative z-10 bg-white border-4 border-black p-12 w-full max-w-md transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                    }`}
            >
                <h2 className="text-5xl font-black text-center mb-2 tracking-tighter">
                    RESET
                </h2>
                <h3 className="text-3xl font-black text-center mb-4 tracking-tighter text-black/60">
                    PASSWORD
                </h3>
                <div className="h-1 w-20 bg-black mx-auto mb-8" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-black tracking-widest mb-2 uppercase">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white outline-none transition-all duration-300 font-mono"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-xs font-black hover:scale-110 transition-transform"
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-black tracking-widest mb-2 uppercase">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white outline-none transition-all duration-300 font-mono"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-xs font-black hover:scale-110 transition-transform"
                            >
                                {showConfirm ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs font-mono text-black/60 space-y-1">
                        <p className={password.length >= 8 ? "text-green-600 font-bold" : ""}>
                            • At least 8 characters
                        </p>
                        <p className={password === confirm && password ? "text-green-600 font-bold" : ""}>
                            • Passwords match
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-black text-white font-black text-lg tracking-widest uppercase transition-all duration-300 ${loading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-white hover:text-black hover:border-4 hover:border-black"
                            }`}
                    >
                        {loading ? "RESETTING..." : "RESET PASSWORD"}
                    </button>
                </form>

                {/* Message */}
                {message && (
                    <div
                        className={`mt-6 p-3 border-2 text-center font-mono text-sm ${message.includes("✅")
                            ? "border-black bg-black text-white"
                            : message.includes("⚠️")
                                ? "border-black bg-yellow-100 text-black"
                                : "border-black bg-white text-black"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Back to Login */}
                <p className="text-center text-xs mt-8 font-bold tracking-wider">
                    PASSWORD RESET?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-black underline hover:no-underline"
                    >
                        GO TO LOGIN
                    </button>
                </p>

                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-black" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-black" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-black" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-black" />
            </div>
        </div>
    );
}