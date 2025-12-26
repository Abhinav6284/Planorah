import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage("⚠️ Please enter your email address.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/users/request-password-reset/",
                { email }
            );

            setMessage("✅ " + res.data.message);
            setTimeout(() => {
                navigate("/verify-reset-otp", { state: { email } });
            }, 1500);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "❌ Unable to send OTP. Please try again later.";
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center">
            {/* Animated gradient following mouse */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%, black, transparent)`,
                }}
            />

            {/* Floating geometric shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute border border-black/5"
                        style={{
                            width: `${80 + i * 35}px`,
                            height: `${80 + i * 35}px`,
                            left: `${(i * 18) % 100}%`,
                            top: `${(i * 22) % 100}%`,
                            animation: `float-random ${9 + i * 1.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.4}s`,
                            transform: `rotate(${i * 25}deg)`,
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
                {/* Title */}
                <h2 className="text-5xl font-black text-center mb-2 tracking-tighter">
                    FORGOT
                </h2>
                <h3 className="text-3xl font-black text-center mb-4 tracking-tighter text-black/60">
                    PASSWORD?
                </h3>
                <div className="h-1 w-20 bg-black mx-auto mb-6" />

                <p className="text-center text-xs font-mono mb-8 text-black/60">
                    ENTER YOUR EMAIL TO RECEIVE AN OTP
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-black tracking-widest mb-2 uppercase">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white outline-none transition-all duration-300 font-mono"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full py-4 bg-black text-white font-black text-lg tracking-widest uppercase overflow-hidden transition-all duration-300 ${loading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-white hover:text-black hover:border-4 hover:border-black"
                            }`}
                    >
                        <span className="relative z-10">
                            {loading ? "SENDING OTP..." : "SEND OTP"}
                        </span>
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
                    REMEMBERED YOUR PASSWORD?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-black underline hover:no-underline"
                    >
                        BACK TO LOGIN
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