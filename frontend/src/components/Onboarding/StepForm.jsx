import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingLayout from "./OnboardingLayout";
import { API_BASE_URL } from "../../api/axios";

const STEPS = [
    {
        id: "field",
        title: "What's your field of study?",
        subtitle: "We'll tailor your career path based on this.",
        fields: [
            { name: "field_of_study", label: "Field (e.g. CS, Business)", placeholder: "Computer Science" },
            { name: "role", label: "Current Status", options: ["Student", "Graduate", "Professional"] }
        ]
    },
    {
        id: "target",
        title: "What are you aiming for?",
        subtitle: "Tell us about your dream role.",
        fields: [
            { name: "target_role", label: "Target Role", placeholder: "Full Stack Developer" },
            { name: "experience_level", label: "Your Level", options: ["Beginner", "Intermediate", "Advanced"] }
        ]
    },
    {
        id: "skills",
        title: "What are your skills?",
        subtitle: "Add skills you already know or are learning.",
        fields: [
            { name: "skills", label: "Skills (comma separated)", placeholder: "Python, React, Django" }
        ]
    },
    {
        id: "intent",
        title: "What is your main goal?",
        subtitle: "How can we help you best?",
        fields: [
            { name: "career_intent", label: "Goal", options: ["Get a Job", "Find Internship", "Build Portfolio", "Learn Skills"] }
        ]
    }
];

export default function StepForm() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        field_of_study: "",
        role: "Student", // Default
        target_role: "",
        experience_level: "Beginner", // Default
        skills: "",
        career_intent: "Get a Job" // Default
    });

    const stepData = STEPS[currentStep];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Submit
            setLoading(true);
            try {
                // Parse skills to array
                const payload = {
                    ...formData,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
                };

                const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                await axios.patch(`${API_BASE_URL}/api/users/update-profile/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Redirect to dashboard
                navigate("/dashboard");
            } catch (error) {
                console.error("Error updating profile:", error);

                // Handle Auth Errors
                if (error.response?.status === 401 || error.response?.data?.code === 'token_not_valid') {
                    alert("Your session has expired. Please login again.");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    sessionStorage.removeItem("access_token");
                    sessionStorage.removeItem("refresh_token");
                    navigate("/login");
                    return;
                }

                if (error.response) {
                    console.error("Response data:", error.response.data);
                    alert(`Failed to update profile: ${JSON.stringify(error.response.data)}`);
                } else {
                    alert("Failed to update profile. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <OnboardingLayout title={stepData.title} subtitle={stepData.subtitle}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {stepData.fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                            {field.options ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none bg-gray-50 focus:bg-white"
                                >
                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none bg-gray-50 focus:bg-white"
                                />
                            )}
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex gap-4">
                {currentStep > 0 && (
                    <button
                        onClick={handleBack}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all shadow-lg shadow-black/20"
                >
                    {loading ? "Saving..." : (currentStep === STEPS.length - 1 ? "Finish" : "Next")}
                </button>
            </div>

            <div className="mt-6 flex justify-center gap-2">
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i <= currentStep ? "w-8 bg-black" : "w-2 bg-gray-200"}`}
                    />
                ))}
            </div>
        </OnboardingLayout>
    );
}
