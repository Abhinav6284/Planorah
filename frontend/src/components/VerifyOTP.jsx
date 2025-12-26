import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      setMessage("⚠️ Email not provided. Please register again.");
      setTimeout(() => navigate("/register"), 2000);
    }

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setMessage("⚠️ Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/verify-otp/", {
        email: email.trim(),
        otp: otpString,
      });

      if (response.status === 201) {
        setMessage("✅ OTP verified successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "❌ Invalid OTP or expired.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/users/resend-otp/", { email });
      setMessage("✅ A new OTP has been sent to your email.");
    } catch (err) {
      setMessage("❌ Error resending OTP.");
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
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-black/5"
            style={{
              width: `${60 + i * 25}px`,
              height: `${60 + i * 25}px`,
              left: `${(i * 15) % 100}%`,
              top: `${(i * 20) % 100}%`,
              animation: `float-random ${7 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
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
          VERIFY OTP
        </h2>
        <div className="h-1 w-20 bg-black mx-auto mb-4" />

        {email && (
          <p className="text-center text-xs font-mono mb-8 text-black/60">
            CODE SENT TO: <span className="font-black text-black">{email}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 border-4 border-black text-center text-2xl font-black focus:bg-black focus:text-white outline-none transition-all duration-300"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-black text-white font-black text-lg tracking-widest uppercase transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-white hover:text-black hover:border-4 hover:border-black"
              }`}
          >
            {loading ? "VERIFYING..." : "VERIFY OTP"}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3 border-2 border-black bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
          >
            RESEND OTP
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 p-3 border-2 text-center font-mono text-sm ${message.includes("✅")
              ? "border-black bg-black text-white"
              : "border-black bg-white text-black"
              }`}
          >
            {message}
          </div>
        )}

        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-black" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-black" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-black" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-black" />
      </div>
    </div>
  );
}