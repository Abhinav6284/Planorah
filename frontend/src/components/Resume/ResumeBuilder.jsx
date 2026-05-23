import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronLeft, 
    ChevronDown, 
    Plus, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Layout as LayoutIcon, 
    Sparkles, 
    Minus,
    User,
    GraduationCap,
    Briefcase,
    Wrench,
    Rocket,
    Award,
    Trophy,
    GripVertical,
    Link as LinkIcon,
    X
} from "lucide-react";
import axios from "../../api/axios";
import { DEFAULT_TEMPLATE_ID, getTemplateById } from "./templates";
import TemplateModal from "./TemplateModal";

// Collapsible Section Component
const AccordionSection = ({
    id,
    title,
    icon: Icon,
    isOpen,
    onToggle,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onDragStart,
    onDragOver,
    onDrop,
    isDragging,
    order,
    children
}) => (
    <div
        className={`border-b border-[var(--el-border-subtle)] ${isDragging ? "opacity-60" : ""}`}
        style={{ order }}
        draggable
        onDragStart={(event) => onDragStart(event, id)}
        onDragOver={(event) => onDragOver(event, id)}
        onDrop={(event) => onDrop(event, id)}
    >
        <button
            onClick={() => onToggle(id)}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--el-bg-secondary)] transition-colors text-left"
        >
            <div className="flex items-center gap-3">
                <span className="text-[var(--el-text-muted)]">
                    <GripVertical size={14} />
                </span>
                <div className="text-[var(--el-text-secondary)]">
                    <Icon size={18} />
                </div>
                <span className="font-semibold text-sm text-[var(--el-text)]">{title}</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="flex items-center bg-[var(--el-bg-secondary)] border border-[var(--el-border)] rounded-md mr-2">
                    <button
                        type="button"
                        disabled={!canMoveUp}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canMoveUp) onMoveUp(id);
                        }}
                        className="p-1 hover:text-[var(--el-text)] text-[var(--el-text-muted)] disabled:opacity-20 transition-colors"
                    >
                        <ArrowUp size={14} />
                    </button>
                    <button
                        type="button"
                        disabled={!canMoveDown}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canMoveDown) onMoveDown(id);
                        }}
                        className="p-1 border-l border-[var(--el-border)] hover:text-[var(--el-text)] text-[var(--el-text-muted)] disabled:opacity-20 transition-colors"
                    >
                        <ArrowDown size={14} />
                    </button>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-[var(--el-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0 space-y-4">
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
        {label && <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">{label}</label>}
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] placeholder-[var(--el-text-muted)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all shadow-sm"
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

const createEmptyCertification = () => ({
    name: "",
    issuer: "",
    year: "",
    link: ""
});

const createEmptyAchievement = () => ({
    title: "",
    detail: ""
});

const DEFAULT_SECTION_ORDER = [
    "personal",
    "education",
    "experience",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "links"
];

const FONT_OPTIONS = [
    { value: "Inter, Arial, sans-serif", label: "Inter" },
    { value: "Manrope, Inter, Arial, sans-serif", label: "Manrope" },
    { value: "IBM Plex Sans, Arial, sans-serif", label: "IBM Plex Sans" }
];

const ACCENT_COLORS = [
    "#111827",
    "#1f2937",
    "#0f172a",
    "#1d4ed8",
    "#0f766e"
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
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_ID);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [mobileView, setMobileView] = useState("editor"); // "editor" or "preview"
    const [previewPageHeightPx, setPreviewPageHeightPx] = useState(0);
    const [previewPageCount, setPreviewPageCount] = useState(1);
    const [quickyVisible, setQuickyVisible] = useState(true);
    const [draggedSectionId, setDraggedSectionId] = useState(null);
    const [selectedFontFamily, setSelectedFontFamily] = useState(FONT_OPTIONS[0].value);
    const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);

    const pageProbeRef = useRef(null);
    const hiddenPreviewRef = useRef(null);

    const [formData, setFormData] = useState({
        personal: {
            first_name: "", last_name: "", email: "", phone: "",
            address: "", job_title: "", summary: ""
        },
        education: [createEmptyEducation()],
        experience: [{ company: "", title: "", location: "", start_date: "", end_date: "", description: "" }],
        skills: [{ category: "Programming Languages", items: "" }],
        projects: [{ name: "", description: "", technologies: "", link: "" }],
        certifications: [createEmptyCertification()],
        achievements: [createEmptyAchievement()],
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
                certifications: resume.certifications?.length ? resume.certifications : [createEmptyCertification()],
                achievements: resume.achievements?.length ? resume.achievements : [createEmptyAchievement()],
                links: resume.links?.length ? resume.links : [{ type: "GitHub", url: "" }]
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

    const handleSectionDragStart = (_, id) => {
        setDraggedSectionId(id);
    };

    const handleSectionDragOver = (event) => {
        event.preventDefault();
    };

    const handleSectionDrop = (_, targetId) => {
        if (!draggedSectionId || draggedSectionId === targetId) {
            return;
        }

        setSectionOrder((previous) => {
            const next = [...previous];
            const fromIndex = next.indexOf(draggedSectionId);
            const toIndex = next.indexOf(targetId);
            if (fromIndex === -1 || toIndex === -1) {
                return previous;
            }
            const [dragged] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, dragged);
            return next;
        });
        setDraggedSectionId(null);
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
        const orderedSectionsForTemplate = sectionOrder
            .filter((section) => section !== "personal")
            .map((section) => (section === "certifications" ? "certifications" : section));

        return template.render(formData, {
            sectionOrder: orderedSectionsForTemplate,
            fontFamily: selectedFontFamily,
            accentColor
        });
    }, [formData, selectedTemplate, sectionOrder, selectedFontFamily, accentColor]);

    // Update preview on form change
    useEffect(() => {
        const html = generatePreviewHtml();
        setGeneratedHtml(html);
    }, [formData, generatePreviewHtml, selectedTemplate, selectedFontFamily, accentColor, sectionOrder]);

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
                links: formData.links,
                certifications: formData.certifications,
                achievements: formData.achievements,
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
        <div className="flex flex-col md:flex-row h-screen bg-[var(--el-bg)] overflow-hidden">
            {/* Mobile View Toggle - only visible on mobile */}
            <div className="md:hidden flex bg-[var(--el-bg-secondary)] border-b border-[var(--el-border)]">
                <button
                    onClick={() => setMobileView("editor")}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobileView === "editor"
                        ? "text-[var(--color-success)] border-b-2 border-[var(--color-success)]"
                        : "text-[var(--el-text-muted)]"
                        }`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setMobileView("preview")}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobileView === "preview"
                        ? "text-[var(--color-success)] border-b-2 border-[var(--color-success)]"
                        : "text-[var(--el-text-muted)]"
                        }`}
                >
                    Preview
                </button>
            </div>

            {/* LEFT PANEL - Editor */}
            <div className={`${mobileView === "editor" ? "flex" : "hidden"} md:flex w-full md:w-[420px] lg:w-[480px] flex-shrink-0 bg-[var(--el-bg-secondary)] border-r border-[var(--el-border)] flex-col h-full shadow-lg z-10`}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--el-border-subtle)] bg-[var(--el-bg)]">
                    <div className="flex items-center gap-3">
                        <Link to="/resume" className="p-2 hover:bg-[var(--el-bg-secondary)] rounded-full transition-colors text-[var(--el-text-secondary)]">
                            <ChevronLeft size={20} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                value={resumeTitle}
                                onChange={(e) => setResumeTitle(e.target.value)}
                                className="w-full text-lg font-bold bg-transparent border-none outline-none text-[var(--el-text)] placeholder-[var(--el-text-muted)]"
                                placeholder="Untitled Resume"
                            />
                        </div>
                        <div className="flex items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isEditing ? 'bg-[var(--color-accent-blue-light)] text-[var(--color-accent-blue-dark)]' : 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'}`}>
                                {isEditing ? 'Saved' : 'New'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--el-border-subtle)] bg-[var(--el-bg)]">
                    {[{ id: 'details', label: 'Resume Details' }, { id: 'matcher', label: 'Resume Matcher' }].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--el-text-muted)] hover:text-[var(--el-text-secondary)]'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="tab-underline"
                                    className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--color-success)]" 
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="flex flex-col">
                            {/* Personal Info */}
                            <AccordionSection
                                id="personal"
                                title="Personal Info"
                                icon={User}
                                isOpen={openSections.includes("personal")}
                                onToggle={toggleSection}
                                order={getSectionPosition("personal")}
                                canMoveUp={getSectionPosition("personal") > 0}
                                canMoveDown={getSectionPosition("personal") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "personal"}
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="First Name" value={formData.personal.first_name} onChange={(e) => handlePersonalChange("first_name", e.target.value)} placeholder="Jane" />
                                    <InputField label="Last Name" value={formData.personal.last_name} onChange={(e) => handlePersonalChange("last_name", e.target.value)} placeholder="Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Email" type="email" value={formData.personal.email} onChange={(e) => handlePersonalChange("email", e.target.value)} placeholder="jane@example.com" />
                                    <InputField label="Phone" value={formData.personal.phone} onChange={(e) => handlePersonalChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                                </div>
                                <InputField label="Address" value={formData.personal.address} onChange={(e) => handlePersonalChange("address", e.target.value)} placeholder="City, Country" />
                                <InputField label="Job Title" value={formData.personal.job_title} onChange={(e) => handlePersonalChange("job_title", e.target.value)} placeholder="e.g. Software Developer (Fresher)" />
                                <div>
                                    <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">Summary</label>
                                    <textarea
                                        value={formData.personal.summary || ""}
                                        onChange={(e) => handlePersonalChange("summary", e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] placeholder-[var(--el-text-muted)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all resize-none shadow-sm"
                                        placeholder="2-3 lines on your impact, strengths, and career focus"
                                    />
                                </div>
                            </AccordionSection>

                            {/* Education */}
                            <AccordionSection
                                id="education"
                                title="Education"
                                icon={GraduationCap}
                                isOpen={openSections.includes("education")}
                                onToggle={toggleSection}
                                order={getSectionPosition("education")}
                                canMoveUp={getSectionPosition("education") > 0}
                                canMoveDown={getSectionPosition("education") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "education"}
                            >
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button 
                                            onClick={() => removeItem("education", idx)} 
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                            title="Remove Education"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <InputField label="Institution" value={edu.institution} onChange={(e) => handleArrayChange("education", idx, "institution", e.target.value)} placeholder="University Name" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Degree" value={edu.degree} onChange={(e) => handleArrayChange("education", idx, "degree", e.target.value)} placeholder="Bachelor of Science" />
                                            <InputField label="Field" value={edu.field} onChange={(e) => handleArrayChange("education", idx, "field", e.target.value)} placeholder="Computer Science" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <InputField label="Start Date" value={edu.start_date} onChange={(e) => handleArrayChange("education", idx, "start_date", e.target.value)} placeholder="2020" />
                                            <InputField label="End Date" value={edu.end_date} onChange={(e) => handleArrayChange("education", idx, "end_date", e.target.value)} placeholder="2024" />
                                            <div>
                                                <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">Score Type</label>
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
                                                    className="w-full px-3 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all shadow-sm"
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
                                <button 
                                    onClick={() => addItem("education", createEmptyEducation())} 
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Education
                                </button>
                            </AccordionSection>

                            {/* Experience */}
                            <AccordionSection
                                id="experience"
                                title="Experience"
                                icon={Briefcase}
                                isOpen={openSections.includes("experience")}
                                onToggle={toggleSection}
                                order={getSectionPosition("experience")}
                                canMoveUp={getSectionPosition("experience") > 0}
                                canMoveDown={getSectionPosition("experience") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "experience"}
                            >
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button 
                                            onClick={() => removeItem("experience", idx)} 
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Company" value={exp.company} onChange={(e) => handleArrayChange("experience", idx, "company", e.target.value)} placeholder="Company Name" />
                                            <InputField label="Job Title" value={exp.title} onChange={(e) => handleArrayChange("experience", idx, "title", e.target.value)} placeholder="Software Engineer" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <InputField label="Location" value={exp.location} onChange={(e) => handleArrayChange("experience", idx, "location", e.target.value)} placeholder="City, State" />
                                            <InputField label="Start Date" value={exp.start_date} onChange={(e) => handleArrayChange("experience", idx, "start_date", e.target.value)} placeholder="MM/YYYY" />
                                            <InputField label="End Date" value={exp.end_date} onChange={(e) => handleArrayChange("experience", idx, "end_date", e.target.value)} placeholder="Present" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">Description (bullet points)</label>
                                            <textarea
                                                value={exp.description || ""}
                                                onChange={(e) => handleArrayChange("experience", idx, "description", e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] placeholder-[var(--el-text-muted)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all resize-none shadow-sm"
                                                placeholder="• Developed full-stack applications...&#10;• Collaborated with cross-functional teams..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => addItem("experience", { company: "", title: "", location: "", start_date: "", end_date: "", description: "" })} 
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Experience
                                </button>
                            </AccordionSection>

                            {/* Skills */}
                            <AccordionSection
                                id="skills"
                                title="Skills"
                                icon={Wrench}
                                isOpen={openSections.includes("skills")}
                                onToggle={toggleSection}
                                order={getSectionPosition("skills")}
                                canMoveUp={getSectionPosition("skills") > 0}
                                canMoveDown={getSectionPosition("skills") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "skills"}
                            >
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button 
                                            onClick={() => removeItem("skills", idx)} 
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <InputField label="Category" value={skill.category} onChange={(e) => handleArrayChange("skills", idx, "category", e.target.value)} placeholder="e.g. Programming Languages" />
                                        <InputField label="Skills (comma separated)" value={skill.items} onChange={(e) => handleArrayChange("skills", idx, "items", e.target.value)} placeholder="React, Node.js, Python, Java" />
                                    </div>
                                ))}
                                <button 
                                    onClick={() => addItem("skills", { category: "", items: "" })} 
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Skill Category
                                </button>
                            </AccordionSection>

                            {/* Projects */}
                            <AccordionSection
                                id="projects"
                                title="Projects"
                                icon={Rocket}
                                isOpen={openSections.includes("projects")}
                                onToggle={toggleSection}
                                order={getSectionPosition("projects")}
                                canMoveUp={getSectionPosition("projects") > 0}
                                canMoveDown={getSectionPosition("projects") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "projects"}
                            >
                                {formData.projects.map((proj, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button 
                                            onClick={() => removeItem("projects", idx)} 
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <InputField label="Project Name" value={proj.name} onChange={(e) => handleArrayChange("projects", idx, "name", e.target.value)} placeholder="Planorah Platform" />
                                        <InputField label="Technologies" value={proj.technologies} onChange={(e) => handleArrayChange("projects", idx, "technologies", e.target.value)} placeholder="React, Node.js, MongoDB" />
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">Description</label>
                                            <textarea
                                                value={proj.description || ""}
                                                onChange={(e) => handleArrayChange("projects", idx, "description", e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] placeholder-[var(--el-text-muted)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all resize-none shadow-sm"
                                                placeholder="Describe your project achievements..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => addItem("projects", { name: "", description: "", technologies: "", link: "" })} 
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Project
                                </button>
                            </AccordionSection>

                            <AccordionSection
                                id="certifications"
                                title="Certifications"
                                icon={Award}
                                isOpen={openSections.includes("certifications")}
                                onToggle={toggleSection}
                                order={getSectionPosition("certifications")}
                                canMoveUp={getSectionPosition("certifications") > 0}
                                canMoveDown={getSectionPosition("certifications") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "certifications"}
                            >
                                {formData.certifications.map((cert, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button
                                            onClick={() => removeItem("certifications", idx)}
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <InputField label="Certification" value={cert.name} onChange={(e) => handleArrayChange("certifications", idx, "name", e.target.value)} placeholder="AWS Solutions Architect" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Issuer" value={cert.issuer} onChange={(e) => handleArrayChange("certifications", idx, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                                            <InputField label="Year" value={cert.year} onChange={(e) => handleArrayChange("certifications", idx, "year", e.target.value)} placeholder="2025" />
                                        </div>
                                        <InputField label="Credential Link" value={cert.link} onChange={(e) => handleArrayChange("certifications", idx, "link", e.target.value)} placeholder="https://credly.com/..." />
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem("certifications", createEmptyCertification())}
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Certification
                                </button>
                            </AccordionSection>

                            <AccordionSection
                                id="achievements"
                                title="Achievements"
                                icon={Trophy}
                                isOpen={openSections.includes("achievements")}
                                onToggle={toggleSection}
                                order={getSectionPosition("achievements")}
                                canMoveUp={getSectionPosition("achievements") > 0}
                                canMoveDown={getSectionPosition("achievements") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "achievements"}
                            >
                                {formData.achievements.map((item, idx) => (
                                    <div key={idx} className="bg-[var(--el-bg)] p-4 rounded-xl border border-[var(--el-border)] space-y-3 relative shadow-sm group">
                                        <button
                                            onClick={() => removeItem("achievements", idx)}
                                            className="absolute top-2 right-2 text-[var(--color-error)] opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--color-error-light)] rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <InputField label="Title" value={item.title} onChange={(e) => handleArrayChange("achievements", idx, "title", e.target.value)} placeholder="Hackathon Winner" />
                                        <InputField label="Detail" value={item.detail} onChange={(e) => handleArrayChange("achievements", idx, "detail", e.target.value)} placeholder="Won first place among 150 teams" />
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem("achievements", createEmptyAchievement())}
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Achievement
                                </button>
                            </AccordionSection>

                            {/* Links */}
                            <AccordionSection
                                id="links"
                                title="Links"
                                icon={LinkIcon}
                                isOpen={openSections.includes("links")}
                                onToggle={toggleSection}
                                order={getSectionPosition("links")}
                                canMoveUp={getSectionPosition("links") > 0}
                                canMoveDown={getSectionPosition("links") < sectionOrder.length - 1}
                                onMoveUp={(sectionId) => moveSection(sectionId, "up")}
                                onMoveDown={(sectionId) => moveSection(sectionId, "down")}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isDragging={draggedSectionId === "links"}
                            >
                                {formData.links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-end relative group">
                                        <div className="w-32">
                                            <label className="block text-[11px] font-semibold text-[var(--el-text-muted)] uppercase tracking-wider mb-1.5 ml-0.5">Platform</label>
                                            <select
                                                value={link.type}
                                                onChange={(e) => handleArrayChange("links", idx, "type", e.target.value)}
                                                className="w-full px-2 py-2.5 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-lg text-sm text-[var(--el-text)] focus:border-[var(--color-success)] focus:ring-1 focus:ring-[var(--color-success)] outline-none transition-all shadow-sm"
                                            >
                                                <option>GitHub</option>
                                                <option>LinkedIn</option>
                                                <option>LeetCode</option>
                                                <option>Portfolio</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <InputField 
                                            className="flex-1" 
                                            label="URL" 
                                            value={link.url} 
                                            onChange={(e) => handleArrayChange("links", idx, "url", e.target.value)} 
                                            placeholder="https://..." 
                                        />
                                        <button 
                                            onClick={() => removeItem("links", idx)} 
                                            className="p-2.5 text-[var(--color-error)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-error-light)] rounded-lg transition-all mb-0.5"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => addItem("links", { type: "GitHub", url: "" })} 
                                    className="w-full py-3 border-2 border-dashed border-[var(--el-border)] rounded-xl text-sm font-semibold text-[var(--el-text-muted)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-light)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Link
                                </button>
                            </AccordionSection>
                        </div>
                    )}

                    {activeTab === 'matcher' && (
                        <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-20 h-20 bg-[var(--el-bg)] rounded-3xl flex items-center justify-center mb-6 shadow-md border border-[var(--el-border)]">
                                <Sparkles size={32} className="text-[var(--color-success)]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--el-text)] mb-2">Resume Matcher</h3>
                            <p className="text-[var(--el-text-muted)] text-sm max-w-[240px] leading-relaxed">
                                Our AI will match your resume against job descriptions to help you stand out.
                            </p>
                            <div className="mt-8 px-4 py-2 bg-[var(--color-success-light)] text-[var(--color-success-dark)] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Coming Soon
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="p-4 border-t border-[var(--el-border-subtle)] bg-[var(--el-bg)]">
                    <button
                        onClick={saveResume}
                        disabled={saving}
                        className="w-full py-3.5 bg-[var(--color-success)] hover:brightness-105 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-success-light)]"
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            isEditing ? "Save Changes" : "Create Resume"
                        )}
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL - Preview */}
            <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-1 bg-[var(--el-bg)] flex-col relative`}>
                {/* Top Bar */}
                <div className="bg-[var(--el-bg-secondary)] border-b border-[var(--el-border)] px-4 md:px-8 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-10 shadow-sm">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-[var(--el-bg)] border border-[var(--el-border)] rounded-xl p-1 shadow-sm mx-auto sm:mx-0">
                        <button 
                            onClick={() => setZoom(z => Math.max(25, z - 10))} 
                            className="w-8 h-8 flex items-center justify-center text-[var(--el-text-secondary)] hover:bg-[var(--el-bg-secondary)] rounded-lg transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <div className="px-3 min-w-[60px] text-center">
                            <span className="text-xs font-bold text-[var(--el-text)]">{zoom}%</span>
                        </div>
                        <button 
                            onClick={() => setZoom(z => Math.min(150, z + 10))} 
                            className="w-8 h-8 flex items-center justify-center text-[var(--el-text-secondary)] hover:bg-[var(--el-bg-secondary)] rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                        <div className="w-px h-4 bg-[var(--el-border)] mx-1" />
                        <button 
                            onClick={() => setZoom(75)} 
                            className="px-3 h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[var(--el-text-muted)] hover:text-[var(--el-text)] hover:bg-[var(--el-bg-secondary)] rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <select
                            value={selectedFontFamily}
                            onChange={(e) => setSelectedFontFamily(e.target.value)}
                            className="px-3 py-2 border border-[var(--el-border)] bg-[var(--el-bg)] rounded-xl text-xs font-semibold text-[var(--el-text-secondary)]"
                        >
                            {FONT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1 p-1 border border-[var(--el-border)] bg-[var(--el-bg)] rounded-xl">
                            {ACCENT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setAccentColor(color)}
                                    className={`w-5 h-5 rounded-full border ${accentColor === color ? "border-white ring-2 ring-slate-500" : "border-transparent"}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2 border border-[var(--el-border)] bg-[var(--el-bg)] rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--el-text-secondary)] hover:text-[var(--el-text)] hover:border-[var(--el-text-secondary)] transition-all flex items-center gap-2 shadow-sm"
                        >
                            <LayoutIcon size={14} />
                            Template
                        </button>
                        <button className="px-4 py-2 border border-[var(--el-border)] bg-[var(--el-bg)] rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--el-text-secondary)] hover:text-[var(--el-text)] hover:border-[var(--el-text-secondary)] transition-all flex items-center gap-2 shadow-sm">
                            <Sparkles size={14} />
                            AI Review
                        </button>
                        <button
                            onClick={downloadPdf}
                            className="px-5 py-2.5 bg-[var(--color-success)] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-success-light)] hover:brightness-105"
                        >
                            Download
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-4 md:p-12 lg:p-16 flex justify-center bg-[var(--el-bg-secondary)] relative">
                    {/* Measurement Probes */}
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

                    {/* Paper Container */}
                    <div
                        className="space-y-12 origin-top transition-all duration-300"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: "top center"
                        }}
                    >
                        {Array.from({ length: previewPageCount }).map((_, pageIndex) => (
                            <div
                                key={pageIndex}
                                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-[var(--el-border-subtle)]"
                                style={{ width: "21cm", height: "29.7cm" }}
                            >
                                <div
                                    className="w-full h-full"
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

                    {/* Quicky Assistant Suggestion Tooltip */}
                    <AnimatePresence>
                        {quickyVisible && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="fixed bottom-24 right-8 z-50 max-w-[280px]"
                            >
                                <div className="bg-[var(--el-bg)] border border-[var(--el-border)] rounded-2xl p-4 shadow-2xl relative">
                                    <button 
                                        onClick={() => setQuickyVisible(false)}
                                        className="absolute top-2 right-2 p-1 text-[var(--el-text-muted)] hover:text-[var(--el-text)] transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🦉</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--el-text-muted)]">Quicky</span>
                                    </div>
                                    <p className="text-sm text-[var(--el-text)] leading-relaxed">
                                        Check your resume against a job description for better matching!
                                    </p>
                                    {/* Arrow */}
                                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--el-bg)] border-r border-b border-[var(--el-border)] rotate-45" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Template Modal */}
            <TemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                currentTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
            />

            {/* Global Custom Styles */}
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
        </div >
    );
}

