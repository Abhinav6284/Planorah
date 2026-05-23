const resumeJsonSchema = {
    type: "object",
    required: ["personal", "education", "experience", "skills", "projects", "links"],
    properties: {
        personal: {
            type: "object",
            properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                job_title: { type: "string" },
                summary: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                address: { type: "string" }
            }
        },
        education: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    institution: { type: "string" },
                    degree: { type: "string" },
                    field: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    score_type: { type: "string", enum: ["percentage", "cgpa"] },
                    percentage: { type: "string" },
                    cgpa: { type: "string" }
                }
            }
        },
        experience: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    company: { type: "string" },
                    title: { type: "string" },
                    location: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    description: { type: "string" }
                }
            }
        },
        skills: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: { type: "string" },
                    items: { type: "string" }
                }
            }
        },
        projects: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    technologies: { type: "string" },
                    description: { type: "string" },
                    link: { type: "string" }
                }
            }
        },
        certifications: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    issuer: { type: "string" },
                    year: { type: "string" },
                    link: { type: "string" }
                }
            }
        },
        achievements: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    detail: { type: "string" }
                }
            }
        },
        links: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    type: { type: "string" },
                    url: { type: "string" }
                }
            }
        }
    }
};

const exampleDataBase = {
    personal: {
        first_name: "Aarav",
        last_name: "Mehta",
        job_title: "Senior Software Engineer",
        summary:
            "Product-focused engineer with 6+ years building low-latency platforms, data products, and growth-facing user experiences.",
        email: "aarav.mehta@planorah.com",
        phone: "+1 415 555 0129",
        address: "San Francisco, CA"
    },
    education: [
        {
            institution: "Indian Institute of Technology Bombay",
            degree: "B.Tech",
            field: "Computer Science",
            start_date: "2014",
            end_date: "2018",
            score_type: "cgpa",
            cgpa: "9.1/10"
        }
    ],
    experience: [
        {
            company: "Stripe",
            title: "Senior Software Engineer",
            location: "San Francisco, CA",
            start_date: "2022",
            end_date: "Present",
            description:
                "Built event-driven payout reconciliation pipeline reducing failed payouts by 38%.\nMentored 4 engineers and improved release confidence with contract testing."
        },
        {
            company: "Atlassian",
            title: "Software Engineer",
            location: "Bengaluru, India",
            start_date: "2018",
            end_date: "2022",
            description:
                "Scaled search ranking service for 8M monthly users.\nImproved dashboard render performance by 42% through bundle and cache optimization."
        }
    ],
    skills: [
        { category: "Languages", items: "Python, TypeScript, Go, SQL" },
        { category: "Frameworks", items: "React, Next.js, Django, FastAPI" },
        { category: "Cloud", items: "AWS, Docker, Kubernetes, Terraform" }
    ],
    projects: [
        {
            name: "Planorah ATS Optimizer",
            technologies: "React, Python, LLMs",
            description:
                "Built AI resume recommendation flow with contextual scoring, increasing interview callbacks by 29%.",
            link: "github.com/planorah/ats-optimizer"
        }
    ],
    certifications: [
        {
            name: "AWS Solutions Architect Professional",
            issuer: "Amazon Web Services",
            year: "2024",
            link: "credly.com/aarav-mehta"
        }
    ],
    achievements: [
        {
            title: "Patent",
            detail: "Co-inventor on adaptive ranking patent filed in US market."
        },
        {
            title: "Hackathon Winner",
            detail: "Won internal ML hackathon among 200+ participants."
        }
    ],
    links: [
        { type: "LinkedIn", url: "linkedin.com/in/aarav-mehta" },
        { type: "GitHub", url: "github.com/aaravmehta" },
        { type: "Portfolio", url: "aaravmehta.dev" }
    ]
};

const escapeHtml = (value) =>
    String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const splitBullets = (text) =>
    String(text || "")
        .split("\n")
        .map((line) => line.replace(/^\s*[-\u2022]\s*/, "").trim())
        .filter(Boolean);

const getEducationScoreText = (educationItem = {}) => {
    const percentage = educationItem?.percentage ? String(educationItem.percentage).trim() : "";
    const cgpa = educationItem?.cgpa ? String(educationItem.cgpa).trim() : "";

    if (percentage && cgpa) {
        return `${percentage} | CGPA ${cgpa}`;
    }
    if (cgpa) {
        return `CGPA ${cgpa}`;
    }
    return percentage;
};

const renderList = (items, className = "") => {
    if (!items.length) {
        return "";
    }

    return `<ul class="${className}">${items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`;
};

const styleByTemplate = {
    "faang-minimal": {
        font: "Inter, Arial, sans-serif",
        accent: "#111827",
        muted: "#374151",
        headingSpacing: "1.5px",
        headerRule: "2px solid #111827"
    },
    "modern-executive": {
        font: "Manrope, Inter, Arial, sans-serif",
        accent: "#0f172a",
        muted: "#334155",
        headingSpacing: "2px",
        headerRule: "2px solid #0f172a"
    },
    "software-engineer-ats": {
        font: "IBM Plex Sans, Inter, Arial, sans-serif",
        accent: "#0b1220",
        muted: "#334155",
        headingSpacing: "1.2px",
        headerRule: "2px solid #0b1220"
    },
    "product-manager-elite": {
        font: "Manrope, Inter, Arial, sans-serif",
        accent: "#111827",
        muted: "#475569",
        headingSpacing: "1.8px",
        headerRule: "2px solid #111827"
    },
    "data-scientist-clean": {
        font: "IBM Plex Sans, Inter, Arial, sans-serif",
        accent: "#1f2937",
        muted: "#475569",
        headingSpacing: "1.3px",
        headerRule: "2px solid #1f2937"
    },
    "student-fresher-ats": {
        font: "Inter, Arial, sans-serif",
        accent: "#111827",
        muted: "#4b5563",
        headingSpacing: "1.3px",
        headerRule: "2px solid #111827"
    },
    "luxury-minimal-bw": {
        font: "IBM Plex Sans, Arial, sans-serif",
        accent: "#000000",
        muted: "#333333",
        headingSpacing: "2.4px",
        headerRule: "3px solid #000000"
    },
    "startup-founder-style": {
        font: "Manrope, Inter, Arial, sans-serif",
        accent: "#111827",
        muted: "#334155",
        headingSpacing: "1.7px",
        headerRule: "2px solid #111827"
    },
    "google-clean": {
        font: "Inter, Arial, sans-serif",
        accent: "#202124",
        muted: "#3c4043",
        headingSpacing: "1.2px",
        headerRule: "2px solid #202124"
    },
    "harvard-ats": {
        font: "IBM Plex Serif, Georgia, Times New Roman, serif",
        accent: "#111111",
        muted: "#333333",
        headingSpacing: "2.2px",
        headerRule: "2px solid #111111"
    }
};

const createTemplateRenderer = (templateId) => {
    return (data, options = {}) => {
        const style = styleByTemplate[templateId] || styleByTemplate["faang-minimal"];
        const sectionOrder =
            options.sectionOrder && options.sectionOrder.length
                ? options.sectionOrder
                : ["experience", "projects", "skills", "education", "certifications", "achievements", "links"];

        const accent = options.accentColor || style.accent;
        const fontFamily = options.fontFamily || style.font;

        const personal = data.personal || {};
        const experience = (data.experience || []).filter((entry) => entry.company || entry.title);
        const projects = (data.projects || []).filter((entry) => entry.name);
        const education = (data.education || []).filter((entry) => entry.institution);
        const skills = (data.skills || []).filter((entry) => entry.items);
        const links = (data.links || []).filter((entry) => entry.url);
        const certifications = (data.certifications || []).filter((entry) => entry.name);
        const achievements = (data.achievements || []).filter((entry) => entry.title || entry.detail);

        const sectionTitle = (label) => `
            <h2 style="
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: ${style.headingSpacing};
                color: ${accent};
                margin: 0 0 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #d1d5db;
            ">${label}</h2>
        `;

        const sectionMap = {
            experience: experience.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Experience")}
                        ${experience
                            .map((exp) => {
                                const bullets = splitBullets(exp.description);
                                return `
                                    <article style="margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; gap: 8px; align-items: baseline;">
                                            <strong style="font-size: 12.5px; color: ${style.accent};">${escapeHtml(exp.title || "Role")}</strong>
                                            <span style="font-size: 10.5px; color: ${style.muted};">${escapeHtml(exp.start_date)} - ${escapeHtml(exp.end_date || "Present")}</span>
                                        </div>
                                        <div style="font-size: 11px; color: ${style.muted}; margin: 2px 0 4px;">
                                            ${escapeHtml(exp.company || "")} ${exp.location ? `| ${escapeHtml(exp.location)}` : ""}
                                        </div>
                                        ${renderList(bullets, "resume-bullets")}
                                    </article>
                                `;
                            })
                            .join("")}
                    </section>
                `
                : "",
            projects: projects.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Projects")}
                        ${projects
                            .map((project) => `
                                <article style="margin-bottom: 10px;">
                                    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                                        <strong style="font-size: 12px; color: ${style.accent};">${escapeHtml(project.name)}</strong>
                                        <span style="font-size: 10px; color: ${style.muted};">${escapeHtml(project.technologies || "")}</span>
                                    </div>
                                    <p style="font-size: 11px; margin: 2px 0; color: ${style.muted};">${escapeHtml(project.description || "")}</p>
                                    ${project.link ? `<p style="font-size: 10px; margin: 0; color: ${style.muted};">Link: ${escapeHtml(project.link)}</p>` : ""}
                                </article>
                            `)
                            .join("")}
                    </section>
                `
                : "",
            skills: skills.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Skills")}
                        ${skills
                            .map(
                                (skill) => `
                                    <p style="margin: 0 0 4px; font-size: 11px; color: ${style.muted};">
                                        <strong style="color: ${style.accent};">${escapeHtml(skill.category)}:</strong>
                                        ${escapeHtml(skill.items)}
                                    </p>
                                `
                            )
                            .join("")}
                    </section>
                `
                : "",
            education: education.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Education")}
                        ${education
                            .map(
                                (edu) => `
                                    <article style="margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; gap: 8px; align-items: baseline;">
                                            <strong style="font-size: 12px; color: ${style.accent};">${escapeHtml(edu.institution)}</strong>
                                            <span style="font-size: 10px; color: ${style.muted};">${escapeHtml(edu.start_date)} - ${escapeHtml(edu.end_date)}</span>
                                        </div>
                                        <p style="margin: 2px 0; font-size: 11px; color: ${style.muted};">
                                            ${escapeHtml(edu.degree || "")}${edu.field ? ` in ${escapeHtml(edu.field)}` : ""}
                                            ${getEducationScoreText(edu) ? ` | ${escapeHtml(getEducationScoreText(edu))}` : ""}
                                        </p>
                                    </article>
                                `
                            )
                            .join("")}
                    </section>
                `
                : "",
            certifications: certifications.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Certifications")}
                        ${certifications
                            .map(
                                (cert) => `
                                    <p style="margin: 0 0 4px; font-size: 11px; color: ${style.muted};">
                                        <strong style="color: ${style.accent};">${escapeHtml(cert.name)}</strong>
                                        ${cert.issuer ? ` | ${escapeHtml(cert.issuer)}` : ""}
                                        ${cert.year ? ` | ${escapeHtml(cert.year)}` : ""}
                                    </p>
                                `
                            )
                            .join("")}
                    </section>
                `
                : "",
            achievements: achievements.length
                ? `
                    <section style="margin-bottom: 14px;">
                        ${sectionTitle("Achievements")}
                        ${achievements
                            .map(
                                (achievement) => `
                                    <p style="margin: 0 0 4px; font-size: 11px; color: ${style.muted};">
                                        <strong style="color: ${style.accent};">${escapeHtml(achievement.title)}:</strong>
                                        ${escapeHtml(achievement.detail || "")}
                                    </p>
                                `
                            )
                            .join("")}
                    </section>
                `
                : "",
            links: links.length
                ? `
                    <section style="margin-bottom: 0;">
                        ${sectionTitle("Links")}
                        <p style="margin: 0; font-size: 11px; color: ${style.muted};">
                            ${links
                                .map((link) => `${escapeHtml(link.type)}: ${escapeHtml(link.url)}`)
                                .join(" | ")}
                        </p>
                    </section>
                `
                : ""
        };

        return `
            <div style="
                width: 21cm;
                min-height: 29.7cm;
                box-sizing: border-box;
                padding: 20mm 17mm;
                margin: 0 auto;
                background: #ffffff;
                color: ${style.accent};
                font-family: ${fontFamily};
                line-height: 1.35;
            ">
                <style>
                    .resume-bullets {
                        margin: 4px 0 0 16px;
                        padding: 0;
                        font-size: 11px;
                        color: ${style.muted};
                    }
                    .resume-bullets li { margin-bottom: 2px; }
                    @media print {
                        .resume-bullets li { page-break-inside: avoid; }
                    }
                </style>

                <header style="margin-bottom: 14px; padding-bottom: 8px; border-bottom: ${style.headerRule};">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.4px;">${escapeHtml(personal.first_name || "First")} ${escapeHtml(personal.last_name || "Last")}</h1>
                    <p style="margin: 4px 0 6px; font-size: 13px; color: ${style.muted}; text-transform: uppercase; letter-spacing: 1.2px;">${escapeHtml(personal.job_title || "Professional")}</p>
                    <p style="margin: 0; font-size: 11px; color: ${style.muted};">
                        ${[personal.email, personal.phone, personal.address].filter(Boolean).map(escapeHtml).join(" | ")}
                    </p>
                </header>

                ${personal.summary ? `<section style="margin-bottom: 14px;"><p style="margin: 0; font-size: 11px; color: ${style.muted};">${escapeHtml(personal.summary)}</p></section>` : ""}

                ${sectionOrder.map((sectionKey) => sectionMap[sectionKey] || "").join("")}
            </div>
        `;
    };
};

const withTemplateMeta = (template) => ({
    ...template,
    jsonSchema: resumeJsonSchema,
    exampleData: {
        ...exampleDataBase,
        personal: {
            ...exampleDataBase.personal,
            job_title: template.sampleRole
        }
    }
});

export const TEMPLATES = {
    "faang-minimal": withTemplateMeta({
        id: "faang-minimal",
        name: "FAANG Minimal",
        description: "High-density, zero-distraction layout optimized for engineering screens.",
        designPhilosophy: "Dense signal over decorative noise for top-tier technical recruiting.",
        atsScore: 99,
        bestRoles: ["Software Engineer", "Backend Engineer", "Staff Engineer"],
        sampleRole: "Senior Software Engineer",
        render: createTemplateRenderer("faang-minimal")
    }),
    "modern-executive": withTemplateMeta({
        id: "modern-executive",
        name: "Modern Executive",
        description: "Premium leadership style balancing clarity and authority.",
        designPhilosophy: "Executive-grade hierarchy with concise storytelling.",
        atsScore: 97,
        bestRoles: ["Engineering Manager", "Director", "VP Product"],
        sampleRole: "Engineering Director",
        render: createTemplateRenderer("modern-executive")
    }),
    "software-engineer-ats": withTemplateMeta({
        id: "software-engineer-ats",
        name: "Software Engineer ATS",
        description: "Project-forward format with measurable engineering outcomes.",
        designPhilosophy: "Technical outcomes and impact metrics first.",
        atsScore: 99,
        bestRoles: ["Full Stack Engineer", "Platform Engineer", "SRE"],
        sampleRole: "Software Engineer",
        render: createTemplateRenderer("software-engineer-ats")
    }),
    "product-manager-elite": withTemplateMeta({
        id: "product-manager-elite",
        name: "Product Manager Elite",
        description: "Outcome-focused PM format emphasizing product impact and scope.",
        designPhilosophy: "Business impact and roadmap ownership made scannable.",
        atsScore: 96,
        bestRoles: ["Product Manager", "Senior PM", "Group PM"],
        sampleRole: "Senior Product Manager",
        render: createTemplateRenderer("product-manager-elite")
    }),
    "data-scientist-clean": withTemplateMeta({
        id: "data-scientist-clean",
        name: "Data Scientist Clean",
        description: "Model, experiment, and metrics-centric clean profile.",
        designPhilosophy: "Prioritize statistical impact and experimentation evidence.",
        atsScore: 97,
        bestRoles: ["Data Scientist", "ML Engineer", "Applied Scientist"],
        sampleRole: "Senior Data Scientist",
        render: createTemplateRenderer("data-scientist-clean")
    }),
    "student-fresher-ats": withTemplateMeta({
        id: "student-fresher-ats",
        name: "Student / Fresher ATS",
        description: "Internship-ready template optimized for new graduates.",
        designPhilosophy: "Potential, projects, and skill depth for early-career profiles.",
        atsScore: 95,
        bestRoles: ["Intern", "Graduate Engineer", "Associate PM"],
        sampleRole: "Software Engineer Intern",
        render: createTemplateRenderer("student-fresher-ats")
    }),
    "luxury-minimal-bw": withTemplateMeta({
        id: "luxury-minimal-bw",
        name: "Luxury Minimal Black & White",
        description: "Monochrome premium format with refined typography rhythm.",
        designPhilosophy: "Luxury feel using typography and white space only.",
        atsScore: 98,
        bestRoles: ["Principal Engineer", "Head of Product", "Consultant"],
        sampleRole: "Principal Engineer",
        render: createTemplateRenderer("luxury-minimal-bw")
    }),
    "startup-founder-style": withTemplateMeta({
        id: "startup-founder-style",
        name: "Startup Founder Style",
        description: "Velocity-centric profile for builders and startup leaders.",
        designPhilosophy: "Demonstrate ownership, momentum, and shipped outcomes.",
        atsScore: 96,
        bestRoles: ["Founder", "Founding Engineer", "Growth Lead"],
        sampleRole: "Founder & Product Engineer",
        render: createTemplateRenderer("startup-founder-style")
    }),
    "google-clean": withTemplateMeta({
        id: "google-clean",
        name: "Google-like Clean",
        description: "Simple, legible, and precise format inspired by modern Google style.",
        designPhilosophy: "Clarity and scannability with strict content discipline.",
        atsScore: 99,
        bestRoles: ["Software Engineer", "TPM", "Program Manager"],
        sampleRole: "Software Engineer",
        render: createTemplateRenderer("google-clean")
    }),
    "harvard-ats": withTemplateMeta({
        id: "harvard-ats",
        name: "Harvard-inspired ATS",
        description: "Classic elite format tuned for modern ATS readability.",
        designPhilosophy: "Traditional authority with machine-readable section clarity.",
        atsScore: 98,
        bestRoles: ["Consulting", "Finance", "Operations", "MBA hiring"],
        sampleRole: "Product Strategy Manager",
        render: createTemplateRenderer("harvard-ats")
    })
};

export const DEFAULT_TEMPLATE_ID = "faang-minimal";

export const getTemplateById = (id) => TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE_ID];

export const getAllTemplates = () => Object.values(TEMPLATES);

export const getTemplateSchema = (id) => getTemplateById(id).jsonSchema;

export const getTemplateExampleData = (id) => getTemplateById(id).exampleData;
