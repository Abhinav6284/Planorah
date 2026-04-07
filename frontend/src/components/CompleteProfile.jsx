import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAccessToken } from "../utils/auth";

export default function CompleteProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        date_of_birth: "",
        phone_number: "",
        gender: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = getAccessToken();
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (!getAccessToken()) {
                setMessage("Session expired. Please login again.");
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            await axios.patch(
                `/users/update-profile/`,
                formData,
                getAuthHeaders()
            );

            setMessage("success:Profile updated successfully!");
            setTimeout(() => navigate("/onboarding"), 1500);

        } catch (err) {
            console.error("Profile update error:", err);
            const serverMsg = err.response?.data?.error || err.response?.data?.message || "Something went wrong.";
            setMessage(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-5 py-3.5 rounded-xl bg-white dark:bg-charcoalMuted border border-borderMuted dark:border-white/10 text-textPrimary dark:text-white placeholder-textSecondary dark:placeholder-gray-500 text-[15px] font-outfit focus:outline-none focus:border-terracotta dark:focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 transition-all";
    const labelClass = "block text-[13px] font-semibold text-textSecondary dark:text-gray-400 uppercase tracking-wider mb-2 font-outfit";

    return (
        <div className="min-h-screen bg-beigePrimary dark:bg-charcoalDark font-outfit flex flex-col">

            {/* Header */}
            <header className="fixed top-0 left-0 w-full px-8 py-5 z-50 bg-beigePrimary/80 dark:bg-charcoalDark/80 backdrop-blur-md border-b border-borderMuted dark:border-white/5">
                <span className="text-xl font-bold font-cormorant tracking-tight text-textPrimary dark:text-white">
                    Planorah<span className="text-terracotta">.</span>
                </span>
            </header>

            {/* Main */}
            <main className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-lg"
                >
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold uppercase tracking-widest border border-terracotta/20">
                            One last step
                        </span>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-cormorant font-bold text-textPrimary dark:text-white leading-tight mb-3">
                            Complete Your Profile
                        </h1>
                        <p className="text-textSecondary dark:text-gray-400 text-base font-outfit">
                            Help us personalise your experience with a few more details.
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="bg-beigeSecondary dark:bg-charcoal border border-borderMuted dark:border-white/5 rounded-2xl p-8 shadow-soft dark:shadow-darkDepth">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>

                            {message && (
                                <div className={`text-center px-4 py-3 rounded-xl text-sm font-medium ${
                                    message.startsWith("success:")
                                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30"
                                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30"
                                }`}>
                                    {message.replace("success:", "")}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-4 bg-terracotta hover:bg-terracottaHover disabled:opacity-60 text-white rounded-xl font-semibold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group shadow-md shadow-terracotta/20"
                            >
                                <span>{loading ? "Saving..." : "Complete Setup"}</span>
                                {!loading && (
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
