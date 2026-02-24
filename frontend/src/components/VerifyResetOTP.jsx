import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function VerifyResetOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Parse Query Params (Magic Link Support)
        const params = new URLSearchParams(location.search);
        const urlEmail = params.get("email");
        if (urlEmail && !email) {
            // Email is provided by URL; handled via effectiveEmail below.
        }
    }, [location.search, email]);

    // NEW LOGIC: Determine email from State OR URL
    const params = new URLSearchParams(location.search);
    const effectiveEmail = email || params.get("email");
    const urlOtp = params.get("otp");

    useEffect(() => {
        if (!effectiveEmail) {
            setMessage({ text: "Email not found. Please try again.", type: "error" });
            setTimeout(() => navigate("/forgot-password"), 2000);
            return;
        }

        // Auto-fill OTP if present in URL
        if (urlOtp && urlOtp.length === 6 && otp[0] === "") {
            setOtp(urlOtp.split(""));
            // Optional: Auto-submit
            // handleSubmit(new Event('submit')); // Tricky to invoke directly due to event usage
        }

    }, [effectiveEmail, navigate, urlOtp, otp]);

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
            setMessage({ text: "Please enter all 6 digits.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await axios.post(
                `/api/users/verify-reset-otp/`,
                { email: effectiveEmail, otp: otpString }
            );
            setMessage({ text: res.data.message || "OTP verified successfully.", type: "success" });
            setTimeout(() => navigate("/reset-password", { state: { email: effectiveEmail } }), 1500);
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || "Invalid OTP. Try again.",
                type: "error",
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await axios.post(`/api/users/request-password-reset/`, { email: effectiveEmail });
            setMessage({ text: "A new OTP has been sent to your email.", type: "success" });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setMessage({ text: "Error resending OTP.", type: "error" });
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
                    <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">Verify reset OTP</h2>
                    <p className="text-gray-500 text-sm">Enter the 6-digit code sent to</p>
                    {effectiveEmail && (
                        <p className="text-gray-900 font-medium mt-1">{effectiveEmail}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 sm:w-14 sm:h-16 border-2 border-gray-200 rounded-xl text-center text-xl sm:text-2xl font-bold text-gray-900 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white"
                                autoFocus={index === 0}
                            />
                        ))}
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
                        disabled={loading || otp.join("").length !== 6}
                        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 ${loading || otp.join("").length !== 6
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            className="text-sm font-medium transition-colors text-black hover:text-gray-600"
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Wrong email?{" "}
                        <Link to="/forgot-password" className="font-medium text-black hover:text-gray-600 transition-colors">
                            Try again
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
