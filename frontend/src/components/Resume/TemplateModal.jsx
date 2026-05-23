import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, BadgeCheck } from "lucide-react";
import { getAllTemplates } from "./templates";

const getTemplateTone = (id) => {
    const toneMap = {
        "faang-minimal": "from-slate-900 to-slate-700",
        "modern-executive": "from-slate-900 to-zinc-600",
        "software-engineer-ats": "from-slate-800 to-sky-900",
        "product-manager-elite": "from-zinc-900 to-slate-700",
        "data-scientist-clean": "from-slate-900 to-cyan-800",
        "student-fresher-ats": "from-slate-700 to-slate-500",
        "luxury-minimal-bw": "from-black to-zinc-700",
        "startup-founder-style": "from-zinc-900 to-amber-700",
        "google-clean": "from-slate-800 to-stone-600",
        "harvard-ats": "from-zinc-950 to-zinc-600"
    };

    return toneMap[id] || "from-slate-800 to-slate-600";
};

const TemplateMiniPreview = ({ template }) => {
    return (
        <div className="w-full h-full bg-white p-3 text-left border border-gray-100 rounded-xl">
            <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${getTemplateTone(template.id)} mb-2`} />
            <div className="text-[8px] tracking-wide text-gray-900 font-semibold uppercase">Aarav Mehta</div>
            <div className="text-[6px] text-gray-500 mb-2">{template.sampleRole}</div>
            <div className="space-y-1">
                <div className="h-1 w-20 rounded bg-gray-200" />
                <div className="h-1 w-28 rounded bg-gray-200" />
                <div className="h-1 w-24 rounded bg-gray-200" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
                <div className="h-4 rounded bg-gray-50 border border-gray-100" />
                <div className="h-4 rounded bg-gray-50 border border-gray-100" />
            </div>
        </div>
    );
};

export default function TemplateModal({ isOpen, onClose, currentTemplate, onSelect }) {
    const templates = getAllTemplates();

    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 24, stiffness: 280 }}
                    className="bg-[var(--el-bg-secondary)] rounded-3xl shadow-[var(--el-shadow-card)] max-w-6xl w-full max-h-[90vh] overflow-hidden border border-[var(--el-border)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--el-border-subtle)] bg-[var(--el-bg)]">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--el-text)]">ATS Resume Templates</h2>
                            <p className="text-sm text-[var(--el-text-muted)] mt-1">
                                Recruiter-first layouts for fast scanning and ATS parsing.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl hover:bg-[var(--el-bg-secondary)] border border-transparent hover:border-[var(--el-border)] flex items-center justify-center text-[var(--el-text-secondary)] transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[var(--el-bg-secondary)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {templates.map((template) => {
                                const selected = currentTemplate === template.id;
                                return (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            onSelect(template.id);
                                            onClose();
                                        }}
                                        className={`group relative text-left p-4 rounded-2xl border transition-all ${
                                            selected
                                                ? "border-[var(--color-success)] bg-[var(--color-success-light)]"
                                                : "border-[var(--el-border)] bg-[var(--el-bg)] hover:border-[var(--el-text-muted)]"
                                        }`}
                                    >
                                        <div className="aspect-[1.1/1] rounded-xl overflow-hidden mb-3 bg-white border border-[var(--el-border-subtle)]">
                                            <TemplateMiniPreview template={template} />
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-[var(--el-text)] text-sm leading-tight">{template.name}</h3>
                                            <span className="text-[10px] rounded-full px-2 py-1 bg-white/80 border border-[var(--el-border)] text-[var(--el-text-muted)]">
                                                ATS {template.atsScore}/100
                                            </span>
                                        </div>

                                        <p className="text-xs text-[var(--el-text-muted)] mt-1 line-clamp-2">{template.description}</p>
                                        <p className="text-[11px] text-[var(--el-text-secondary)] mt-2 line-clamp-2">{template.designPhilosophy}</p>

                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {(template.bestRoles || []).slice(0, 3).map((role) => (
                                                <span
                                                    key={role}
                                                    className="text-[10px] px-2 py-1 rounded-md bg-[var(--el-bg-secondary)] border border-[var(--el-border-subtle)] text-[var(--el-text-muted)]"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>

                                        {selected && (
                                            <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--color-success)] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-8 py-4 border-t border-[var(--el-border-subtle)] bg-[var(--el-bg)] text-center text-[10px] font-bold uppercase tracking-widest text-[var(--el-text-muted)] flex items-center justify-center gap-2">
                        <BadgeCheck size={14} className="text-[var(--color-success)]" />
                        Planorah ATS Templates For FAANG-Grade Applications
                    </div>
                </motion.div>

                <style jsx="true">{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: var(--el-border);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: var(--el-text-muted);
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
}
