import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getTemplateById } from "./templates";
import TemplateModal from "./TemplateModal";

// Collapsible Section Component
const AccordionSection = ({ id, title, icon, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <button
            onClick={() => onToggle(id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{title}</span>
            </div>
            <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0 space-y-3">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// Input Field Component
const InputField = ({ label, value, onChange, placeholder, type = "text", className = "" }) => (
    <div className={className}>
        {label && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>}
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
        />
    </div>
);

export default function ResumeBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [activeTab, setActiveTab] = useState("details");
    const [openSections, setOpenSections] = useState(["personal"]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [zoom, setZoom] = useState(75);
    const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
    const [generatedHtml, setGeneratedHtml] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("professional");
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const [formData, setFormData] = useState({
        personal: {
            first_name: "", last_name: "", email: "", phone: "",
            address: "", job_title: ""
        },
        education: [{ institution: "", degree: "", field: "", start_date: "", end_date: "", percentage: "" }],
        experience: [{ company: "", title: "", location: "", start_date: "", end_date: "", description: "" }],
        skills: [{ category: "Programming Languages", items: "" }],
        projects: [{ name: "", description: "", technologies: "", link: "" }],
        links: [{ type: "GitHub", url: "" }]
    });

    // Fetch existing resume if editing
    useEffect(() => {
        if (isEditing) {
            fetchResume();
        }
    }, [id]);

    const fetchResume = async () => {
        try {
            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
            const response = await axios.get(`http://127.0.0.1:8000/api/resume/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resume = response.data;
            setResumeTitle(resume.title);
            setGeneratedHtml(resume.generated_content || "");

            // Map backend data to form
            setFormData({
                personal: resume.personal_info || {},
                education: resume.education?.length ? resume.education : [{}],
                experience: resume.experience?.length ? resume.experience : [{}],
                skills: resume.skills?.length ? resume.skills : [{ category: "Programming Languages", items: "" }],
                projects: resume.projects?.length ? resume.projects : [{}],
                links: [{ type: "GitHub", url: "" }]
            });
        } catch (error) {
            console.error("Failed to fetch resume:", error);
        }
    };

    const toggleSection = (id) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handlePersonalChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
    };

    const handleArrayChange = (section, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[section]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [section]: newArray };
        });
    };

    const addItem = (section, template) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], template]
        }));
    };

    const removeItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    // Generate live preview HTML using selected template
    const generatePreviewHtml = useCallback(() => {
        const template = getTemplateById(selectedTemplate);
        return template.render(formData);
    }, [formData, selectedTemplate]);

    // Update preview on form change
    useEffect(() => {
        const html = generatePreviewHtml();
        setGeneratedHtml(html);
    }, [formData, generatePreviewHtml]);

    const saveResume = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
            const payload = {
                title: resumeTitle,
                personal_info: formData.personal,
                education: formData.education,
                experience: formData.experience,
                skills: formData.skills,
                projects: formData.projects,
                generated_content: generatedHtml
            };

            if (isEditing) {
                await axios.put(`http://127.0.0.1:8000/api/resume/${id}/update/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                const response = await axios.post("http://127.0.0.1:8000/api/resume/generate/", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate(`/resume/${response.data.id}`);
            }
        } catch (error) {
            console.error("Failed to save resume:", error);
        } finally {
            setSaving(false);
        }
    };

    const downloadPdf = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${resumeTitle}</title>
                    <style>
                        body { margin: 0; padding: 0; }
                        @media print { body { -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>${generatedHtml}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* LEFT PANEL - Editor */}
            <div className="w-[400px] flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/resume')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            ←
                        </button>
                        <input
                            type="text"
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className="flex-1 text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                            {isEditing ? 'Editing' : 'New'}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {[{ id: 'details', label: 'Resume Details' }, { id: 'matcher', label: 'Resume Matcher' }].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'details' && (
                        <>
                            {/* Personal Info */}
                            <AccordionSection
                                id="personal"
                                title="Personal Info"
                                icon="👤"
                                isOpen={openSections.includes("personal")}
                                onToggle={toggleSection}
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="First Name" value={formData.personal.first_name} onChange={(e) => handlePersonalChange("first_name", e.target.value)} />
                                    <InputField label="Last Name" value={formData.personal.last_name} onChange={(e) => handlePersonalChange("last_name", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Email" type="email" value={formData.personal.email} onChange={(e) => handlePersonalChange("email", e.target.value)} />
                                    <InputField label="Phone" value={formData.personal.phone} onChange={(e) => handlePersonalChange("phone", e.target.value)} />
                                </div>
                                <InputField label="Address" value={formData.personal.address} onChange={(e) => handlePersonalChange("address", e.target.value)} />
                                <InputField label="Job Title" value={formData.personal.job_title} onChange={(e) => handlePersonalChange("job_title", e.target.value)} placeholder="e.g. Software Developer (Fresher)" />
                            </AccordionSection>

                            {/* Education */}
                            <AccordionSection
                                id="education"
                                title="Education"
                                icon="🎓"
                                isOpen={openSections.includes("education")}
                                onToggle={toggleSection}
                            >
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg space-y-2 relative">
                                        {formData.education.length > 1 && (
                                            <button onClick={() => removeItem("education", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs">✕</button>
                                        )}
                                        <InputField label="Institution" value={edu.institution} onChange={(e) => handleArrayChange("education", idx, "institution", e.target.value)} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <InputField label="Degree" value={edu.degree} onChange={(e) => handleArrayChange("education", idx, "degree", e.target.value)} />
                                            <InputField label="Field" value={edu.field} onChange={(e) => handleArrayChange("education", idx, "field", e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <InputField label="Start" value={edu.start_date} onChange={(e) => handleArrayChange("education", idx, "start_date", e.target.value)} placeholder="2020" />
                                            <InputField label="End" value={edu.end_date} onChange={(e) => handleArrayChange("education", idx, "end_date", e.target.value)} placeholder="2024" />
                                            <InputField label="Percentage" value={edu.percentage} onChange={(e) => handleArrayChange("education", idx, "percentage", e.target.value)} placeholder="85%" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addItem("education", {})} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Education
                                </button>
                            </AccordionSection>

                            {/* Experience */}
                            <AccordionSection
                                id="experience"
                                title="Experience"
                                icon="💼"
                                isOpen={openSections.includes("experience")}
                                onToggle={toggleSection}
                            >
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg space-y-2 relative">
                                        {formData.experience.length > 1 && (
                                            <button onClick={() => removeItem("experience", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs">✕</button>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <InputField label="Company" value={exp.company} onChange={(e) => handleArrayChange("experience", idx, "company", e.target.value)} />
                                            <InputField label="Title" value={exp.title} onChange={(e) => handleArrayChange("experience", idx, "title", e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <InputField label="Location" value={exp.location} onChange={(e) => handleArrayChange("experience", idx, "location", e.target.value)} />
                                            <InputField label="Start" value={exp.start_date} onChange={(e) => handleArrayChange("experience", idx, "start_date", e.target.value)} />
                                            <InputField label="End" value={exp.end_date} onChange={(e) => handleArrayChange("experience", idx, "end_date", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description (one bullet per line)</label>
                                            <textarea
                                                value={exp.description || ""}
                                                onChange={(e) => handleArrayChange("experience", idx, "description", e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                                                placeholder="Developed web applications using React..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addItem("experience", {})} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Experience
                                </button>
                            </AccordionSection>

                            {/* Skills */}
                            <AccordionSection
                                id="skills"
                                title="Skills"
                                icon="🛠️"
                                isOpen={openSections.includes("skills")}
                                onToggle={toggleSection}
                            >
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg space-y-2 relative">
                                        {formData.skills.length > 1 && (
                                            <button onClick={() => removeItem("skills", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs">✕</button>
                                        )}
                                        <InputField label="Category" value={skill.category} onChange={(e) => handleArrayChange("skills", idx, "category", e.target.value)} placeholder="Programming Languages" />
                                        <InputField label="Skills (comma separated)" value={skill.items} onChange={(e) => handleArrayChange("skills", idx, "items", e.target.value)} placeholder="Python, Java, JavaScript" />
                                    </div>
                                ))}
                                <button onClick={() => addItem("skills", { category: "", items: "" })} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Skill Category
                                </button>
                            </AccordionSection>

                            {/* Projects */}
                            <AccordionSection
                                id="projects"
                                title="Projects"
                                icon="🚀"
                                isOpen={openSections.includes("projects")}
                                onToggle={toggleSection}
                            >
                                {formData.projects.map((proj, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg space-y-2 relative">
                                        {formData.projects.length > 1 && (
                                            <button onClick={() => removeItem("projects", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs">✕</button>
                                        )}
                                        <InputField label="Project Name" value={proj.name} onChange={(e) => handleArrayChange("projects", idx, "name", e.target.value)} />
                                        <InputField label="Technologies" value={proj.technologies} onChange={(e) => handleArrayChange("projects", idx, "technologies", e.target.value)} placeholder="React, Node.js, MongoDB" />
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                                            <textarea
                                                value={proj.description || ""}
                                                onChange={(e) => handleArrayChange("projects", idx, "description", e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addItem("projects", {})} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Project
                                </button>
                            </AccordionSection>

                            {/* Links */}
                            <AccordionSection
                                id="links"
                                title="Links"
                                icon="🔗"
                                isOpen={openSections.includes("links")}
                                onToggle={toggleSection}
                            >
                                {formData.links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="w-28">
                                            <select
                                                value={link.type}
                                                onChange={(e) => handleArrayChange("links", idx, "type", e.target.value)}
                                                className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                            >
                                                <option>GitHub</option>
                                                <option>LinkedIn</option>
                                                <option>LeetCode</option>
                                                <option>Portfolio</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <InputField className="flex-1" value={link.url} onChange={(e) => handleArrayChange("links", idx, "url", e.target.value)} placeholder="https://github.com/username" />
                                        {formData.links.length > 1 && (
                                            <button onClick={() => removeItem("links", idx)} className="text-red-400 hover:text-red-500 text-sm pb-2">✕</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addItem("links", { type: "GitHub", url: "" })} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Link
                                </button>
                            </AccordionSection>
                        </>
                    )}

                    {activeTab === 'matcher' && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-4">📋</div>
                            <p>Resume Matcher coming soon!</p>
                            <p className="text-sm mt-2">Match your resume against job descriptions.</p>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={saveResume}
                        disabled={saving}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? "Saving..." : (isEditing ? "Save Changes" : "Create Resume")}
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL - Preview */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-900 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
                        <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold">−</button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold">+</button>
                        <button onClick={() => setZoom(75)} className="text-xs text-gray-400 hover:text-gray-600 ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Reset</button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Change Template
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Try AI Review
                        </button>
                        <button
                            onClick={downloadPdf}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Download ▾
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    <div
                        className="bg-white shadow-2xl origin-top transition-transform duration-200"
                        style={{
                            width: "21cm",
                            minHeight: "29.7cm",
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: "top center"
                        }}
                    >
                        <div
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: generatedHtml }}
                        />
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            <TemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                currentTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
            />
        </div>
    );
}
