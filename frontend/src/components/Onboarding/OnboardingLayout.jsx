import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PlanoraLogo from "../../assets/Planora.svg";

export default function OnboardingLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="p-6">
                <Link to="/" className="inline-flex items-center gap-2">
                    <img src={PlanoraLogo} alt="Planorah" className="h-8 w-auto" />
                    <span className="text-xl font-serif font-bold text-gray-900">Planorah.</span>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <div className="mb-10 text-center">
                        {/* Support for Badge */}
                        {title.badge && (
                            <div className="flex justify-center mb-4">
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {title.badge}
                                </span>
                            </div>
                        )}

                        <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
                            {title.text || title}
                        </h1>
                        {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
