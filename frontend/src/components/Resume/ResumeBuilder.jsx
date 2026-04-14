import React, { useState, useEffect, useCallback, useRef } from "react";
import AssistantWidget from '../Mentoring/AssistantWidget';
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axios";
import { getTemplateById } from "./templates";
import TemplateModal from "./TemplateModal";

// Collapsible Section Component
const AccordionSection = ({
    id,
    title,
    icon,
    isOpen,
    onToggle,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    order,
    children
}) => (
    <div className="border-b border-gray-200 dark:border-charcoalMuted" style={{ order }}>
        <button
            onClick={() => onToggle(id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-charcoalMuted/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{title}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (canMoveUp) {
                            onMoveUp(id);
                        }
                    }}
                    className="h-6 w-6 rounded border border-gray-200 bg-white text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-charcoalMuted dark:bg-charcoalMuted dark:text-gray-300"
                    aria-label={`Move ${title} up`}
                >
                    ↑
                </button>
                <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (canMoveDown) {
                            onMoveDown(id);
                        }
                    }}
                    className="h-6 w-6 rounded border border-gray-200 bg-white text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-charcoalMuted dark:bg-charcoalMuted dark:text-gray-300"
                    aria-label={`Move ${title} down`}
                >
                    ↓
                </button>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
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
            className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoalMuted border border-gray-200 dark:border-charcoalMuted rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
        />
    </div>
);

const createEmptyEducation = () => ({
    institution: "",
    degree: "",
    field: "",
    start_date: "",
    end_date: "",
    score_type: "percentage",
    percentage: "",
    cgpa: ""
});

const DEFAULT_SECTION_ORDER = [
    "personal",
    "education",
    "experience",
    "skills",
    "projects",
    "links"
];

export default function ResumeBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [activeTab, setActiveTab] = useState("details");
    const [openSections, setOpenSections] = useState(["personal"]);
    const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
    const [saving, setSaving] = useState(false);
    const [zoom, setZoom] = useState(75);
    const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
    const [generatedHtml, setGeneratedHtml] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("professional");
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [mobileView, setMobileView] = useState("editor"); // "editor" or "preview"
    const [previewPageHeightPx, setPreviewPageHeightPx] = useState(0);
    const [previewPageCount, setPreviewPageCount] = useState(1);

    const pageProbeRef = useRef(null);
    const hiddenPreviewRef = useRef(null);

    const [formData, setFormData] = useState({
        personal: {
            first_name: "", last_name: "", email: "", phone: "",
            address: "", job_title: ""
        },
        education: [createEmptyEducation()],
        experience: [{ company: "", title: "", location: "", start_date: "", end_date: "", description: "" }],
        skills: [{ category: "Programming Languages", items: "" }],
        projects: [{ name: "", description: "", technologies: "", link: "" }],
        links: [{ type: "GitHub", url: "" }]
    });

    const fetchResume = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
            const response = await axios.get(`/resume/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resume = response.data;
            setResumeTitle(resume.title);
            setGeneratedHtml(resume.generated_content || "");

            // Map backend data to form
            setFormData({
                personal: resume.personal_info || {},
                education: resume.education?.length
                    ? resume.education.map(edu => {
                        const normalizedEdu = { ...createEmptyEducation(), ...edu };
                        if (!normalizedEdu.score_type) {
                            normalizedEdu.score_type = normalizedEdu.cgpa && !normalizedEdu.percentage
                                ? "cgpa"
                                : "percentage";
                        }
                        return normalizedEdu;
                    })
                    : [createEmptyEducation()],
                experience: resume.experience?.length ? resume.experience : [{}],
                skills: resume.skills?.length ? resume.skills : [{ category: "Programming Languages", items: "" }],
                projects: resume.projects?.length ? resume.projects : [{}],
                links: [{ type: "GitHub", url: "" }]
            });
        } catch (error) {
            console.error("Failed to fetch resume:", error);
        }
    }, [id]);

    // Fetch existing resume if editing
    useEffect(() => {
        if (isEditing) {
            fetchResume();
        }
    }, [isEditing, fetchResume]);

    const toggleSection = (id) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const moveSection = (id, direction) => {
        setSectionOrder(prev => {
            const currentIndex = prev.indexOf(id);
            if (currentIndex === -1) {
                return prev;
            }

            const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
            if (nextIndex < 0 || nextIndex >= prev.length) {
                return prev;
            }

            const reordered = [...prev];
            [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
            return reordered;
        });
    };

    const getSectionPosition = (id) => {
        const index = sectionOrder.indexOf(id);
        return index === -1 ? DEFAULT_SECTION_ORDER.length : index;
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
                await axios.put(`/resume/${id}/update/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                const response = await axios.post(`/resume/generate/`, payload, {
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
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                        }
                        body {
                            background: #fff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .resume-print-root {
                            width: 21cm;
                            min-height: 29.7cm;
                            margin: 0 auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="resume-print-root">${generatedHtml}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const measurePreviewPages = useCallback(() => {
        if (!pageProbeRef.current || !hiddenPreviewRef.current) {
            return;
        }

        const onePageHeight = pageProbeRef.current.getBoundingClientRect().height;
        const contentHeight = hiddenPreviewRef.current.scrollHeight;

        if (!onePageHeight || !contentHeight) {
            setPreviewPageHeightPx(0);
            setPreviewPageCount(1);
            return;
        }

        setPreviewPageHeightPx(onePageHeight);
        setPreviewPageCount(Math.max(1, Math.ceil(contentHeight / onePageHeight)));
    }, []);

    useEffect(() => {
        measurePreviewPages();
    }, [generatedHtml, measurePreviewPages]);

    useEffect(() => {
        const handleResize = () => {
            measurePreviewPages();
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [measurePreviewPages]);

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100dvh-80px)] md:h-[calc(100vh-80px)] bg-gray-100 dark:bg-charcoalDark overflow-hidden">
            <AssistantWidget contextSource="resume" />
            {/* Mobile View Toggle - only visible on mobile */}
            <div className="md:hidden flex bg-white dark:bg-charcoal border-b border-gray-200 dark:border-charcoalMuted">
                <button
                    onClick={() => setMobileView("editor")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileView === "editor"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "text-gray-600 dark:text-gray-400"
                        }`}
                >
                    ✏️ Editor
                </button>
                <button
                    onClick={() => setMobileView("preview")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileView === "preview"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "text-gray-600 dark:text-gray-400"
                        }`}
                >
                    👁️ Preview
                </button>
            </div>

            {/* LEFT PANEL - Editor */}
            <div className={`${mobileView === "editor" ? "flex" : "hidden"} md:flex w-full md:w-[400px] flex-shrink-0 bg-white dark:bg-charcoal border-r border-gray-200 dark:border-charcoalMuted flex-col h-full`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-charcoalMuted">
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
                <div className="flex border-b border-gray-200 dark:border-charcoalMuted">
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
                <div className="flex-1 overflow-y-auto overscroll-y-contain">
                    {activeTab === 'details' && (
                        <div className="flex flex-col">
                            {/* Personal Info */}
                            <AccordionSection
                                id="personal"
                                title="Personal Info"
                                icon="👤"
                                isOpen={openSections.includes("personal")}
                                onToggle={toggleSection}
                                order={getSectionPosition("personal")}
                                canMoveUp={getSectionPosition("personal") > 0}
                                canMoveDown={getSectionPosition("personal") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
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
                                order={getSectionPosition("education")}
                                canMoveUp={getSectionPosition("education") > 0}
                                canMoveDown={getSectionPosition("education") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                            >
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-charcoalMuted/30 p-3 rounded-lg space-y-2 relative">
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
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Score Type</label>
                                                <select
                                                    value={edu.score_type || "percentage"}
                                                    onChange={(e) => {
                                                        const nextType = e.target.value;
                                                        handleArrayChange("education", idx, "score_type", nextType);
                                                        if (nextType === "cgpa") {
                                                            handleArrayChange("education", idx, "percentage", "");
                                                        } else {
                                                            handleArrayChange("education", idx, "cgpa", "");
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoalMuted border border-gray-200 dark:border-charcoalMuted rounded-lg text-sm text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                                >
                                                    <option value="percentage">Percentage</option>
                                                    <option value="cgpa">CGPA</option>
                                                </select>
                                            </div>
                                        </div>
                                        {(edu.score_type || "percentage") === "cgpa" ? (
                                            <InputField
                                                label="CGPA"
                                                value={edu.cgpa}
                                                onChange={(e) => handleArrayChange("education", idx, "cgpa", e.target.value)}
                                                placeholder="8.5 / 10"
                                            />
                                        ) : (
                                            <InputField
                                                label="Percentage"
                                                value={edu.percentage}
                                                onChange={(e) => handleArrayChange("education", idx, "percentage", e.target.value)}
                                                placeholder="85%"
                                            />
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addItem("education", createEmptyEducation())} className="w-full py-2 border border-dashed border-gray-300 dark:border-charcoalMuted rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
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
                                order={getSectionPosition("experience")}
                                canMoveUp={getSectionPosition("experience") > 0}
                                canMoveDown={getSectionPosition("experience") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                            >
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-charcoalMuted/30 p-3 rounded-lg space-y-2 relative">
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
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoalMuted border border-gray-200 dark:border-charcoalMuted rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                                                placeholder="Developed web applications using React..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addItem("experience", {})} className="w-full py-2 border border-dashed border-gray-300 dark:border-charcoalMuted rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
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
                                order={getSectionPosition("skills")}
                                canMoveUp={getSectionPosition("skills") > 0}
                                canMoveDown={getSectionPosition("skills") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                            >
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-charcoalMuted/30 p-3 rounded-lg space-y-2 relative">
                                        {formData.skills.length > 1 && (
                                            <button onClick={() => removeItem("skills", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs">✕</button>
                                        )}
                                        <InputField label="Category" value={skill.category} onChange={(e) => handleArrayChange("skills", idx, "category", e.target.value)} placeholder="Programming Languages" />
                                        <InputField label="Skills (comma separated)" value={skill.items} onChange={(e) => handleArrayChange("skills", idx, "items", e.target.value)} placeholder="Python, Java, JavaScript" />
                                    </div>
                                ))}
                                <button onClick={() => addItem("skills", { category: "", items: "" })} className="w-full py-2 border border-dashed border-gray-300 dark:border-charcoalMuted rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
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
                                order={getSectionPosition("projects")}
                                canMoveUp={getSectionPosition("projects") > 0}
                                canMoveDown={getSectionPosition("projects") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                            >
                                {formData.projects.map((proj, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-charcoalMuted/30 p-3 rounded-lg space-y-2 relative">
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
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoalMuted border border-gray-200 dark:border-charcoalMuted rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addItem("projects", {})} className="w-full py-2 border border-dashed border-gray-300 dark:border-charcoalMuted rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
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
                                order={getSectionPosition("links")}
                                canMoveUp={getSectionPosition("links") > 0}
                                canMoveDown={getSectionPosition("links") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                            >
                                {formData.links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="w-28">
                                            <select
                                                value={link.type}
                                                onChange={(e) => handleArrayChange("links", idx, "type", e.target.value)}
                                                className="w-full px-2 py-2 bg-gray-50 dark:bg-charcoalMuted border border-gray-200 dark:border-charcoalMuted rounded-lg text-sm text-gray-900 dark:text-white"
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
                                <button onClick={() => addItem("links", { type: "GitHub", url: "" })} className="w-full py-2 border border-dashed border-gray-300 dark:border-charcoalMuted rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                                    + Add Link
                                </button>
                            </AccordionSection>
                        </div>
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
                <div className="p-4 border-t border-gray-200 dark:border-charcoalMuted">
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
            <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-1 bg-gray-200 dark:bg-charcoalDark flex-col`}>
                {/* Top Bar */}
                <div className="bg-white dark:bg-charcoal border-b border-gray-200 dark:border-charcoalMuted px-4 md:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-charcoalMuted rounded-lg px-3 py-1 justify-center sm:justify-start">
                        <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold">−</button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold">+</button>
                        <button onClick={() => setZoom(75)} className="text-xs text-gray-400 hover:text-gray-600 ml-2 px-2 py-1 bg-gray-200 dark:bg-charcoalMuted rounded">Reset</button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-3 py-2 border border-gray-300 dark:border-charcoalMuted rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoalMuted transition-colors"
                        >
                            Template
                        </button>
                        <button className="hidden sm:block px-3 py-2 border border-gray-300 dark:border-charcoalMuted rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoalMuted transition-colors">
                            AI Review
                        </button>
                        <button
                            onClick={downloadPdf}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2"
                        >
                            Download ▾
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
                    <div className="relative">
                        <div
                            ref={pageProbeRef}
                            className="absolute opacity-0 pointer-events-none"
                            style={{ width: "21cm", height: "29.7cm" }}
                        />
                        <div
                            ref={hiddenPreviewRef}
                            className="fixed -left-[10000px] top-0 opacity-0 pointer-events-none"
                            style={{ width: "21cm" }}
                            dangerouslySetInnerHTML={{ __html: generatedHtml }}
                        />

                        <div
                            className="space-y-6 origin-top transition-transform duration-200"
                            style={{
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: "top center"
                            }}
                        >
                            {Array.from({ length: previewPageCount }).map((_, pageIndex) => (
                                <div
                                    key={pageIndex}
                                    className="bg-white shadow-2xl overflow-hidden"
                                    style={{ width: "21cm", height: "29.7cm" }}
                                >
                                    <div
                                        className="w-full"
                                        style={{
                                            transform: previewPageHeightPx
                                                ? `translateY(-${pageIndex * previewPageHeightPx}px)`
                                                : "none"
                                        }}
                                        dangerouslySetInnerHTML={{ __html: generatedHtml }}
                                    />
                                </div>
                            ))}
                        </div>
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
        </div >
    );
}

