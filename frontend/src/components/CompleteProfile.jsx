import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api/axios";

export default function CompleteProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        date_of_birth: "",
        phone_number: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Helper to retrieve token (assuming user is logged in after OTP)
    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token");
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
            if (!localStorage.getItem("access_token")) {
                setMessage("Session expired. Please login again.");
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            await axios.patch(
                `${API_BASE_URL}/api/users/update-profile/`,
                formData,
                getAuthHeaders()
            );

            setMessage("success:Profile updated successfully!");
            // Proceed to the original intended destination (Onboarding or Dashboard)
            setTimeout(() => navigate("/onboarding"), 1500);

        } catch (err) {
            console.error("Profile update error:", err);
            const serverMsg = err.response?.data?.error || err.response?.data?.message || "Something went wrong.";
            setMessage(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-100 flex flex-col justify-center items-center p-6">

            {/* Header / Nav simulation */}
            <div className="absolute top-8 left-8">
                <span className="text-2xl font-bold tracking-tight">Planorah.</span>
            </div>

            <main className="w-full max-w-2xl">
                <div className="text-center mb-12 relative">
                    <span className="inline-block py-1 px-3 rounded-full bg-green-50 text-xs font-medium text-green-700 mb-6 border border-green-100">
                        One last step
                    </span>
                    <h1 className="text-5xl md:text-6xl font-serif leading-tight relative z-10">
                        Complete Your <br />
                        <span className="relative inline-block">
                            Profile
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
                    <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto">
                        Help us personalize your experience by providing a few more details.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full bg-white p-8 md:p-12"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black outline-none transition-all placeholder-gray-400 text-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black outline-none transition-all text-gray-700 text-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black outline-none transition-all placeholder-gray-400 text-lg"
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`text-center p-4 rounded-2xl ${message.startsWith("success:") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {message.replace("success:", "")}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-black text-white rounded-full font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 shadow-lg shadow-black/10"
                        >
                            <span>{loading ? "Saving Profile..." : "Complete Setup"}</span>
                            {!loading && (
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
