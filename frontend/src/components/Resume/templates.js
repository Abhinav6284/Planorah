// Resume Templates - Professional, ATS-friendly designs

export const TEMPLATES = {
    professional: {
        id: 'professional',
        name: 'Professional Classic',
        description: 'Traditional format, perfect for corporate roles',
        thumbnail: '📋',
        render: (data) => {
            const { personal, education, experience, skills, projects, links } = data;
            return `
                <div style="font-family: 'Times New Roman', Georgia, serif; padding: 40px; max-width: 100%; color: #1a1a1a; line-height: 1.4;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #2c3e50;">
                        <h1 style="font-size: 28px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 3px; color: #2c3e50;">
                            ${personal?.first_name || 'First'} ${personal?.last_name || 'Last'}
                        </h1>
                        <p style="font-size: 14px; color: #555; margin: 8px 0; font-style: italic;">
                            ${personal?.job_title || 'Software Developer'}
                        </p>
                        <p style="font-size: 11px; color: #666; margin: 5px 0;">
                            ${[personal?.email, personal?.phone, personal?.address].filter(Boolean).join(' • ') || 'email@example.com • +91 1234567890 • City, Country'}
                        </p>
                        ${links?.filter(l => l.url).length > 0 ? `
                            <p style="font-size: 11px; color: #3498db; margin: 5px 0;">
                                ${links.filter(l => l.url).map(l => `${l.type}: ${l.url}`).join(' | ')}
                            </p>
                        ` : ''}
                    </div>

                    <!-- Education -->
                    ${education?.some(e => e.institution) ? `
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 2px;">
                                Education
                            </h2>
                            ${education.filter(e => e.institution).map(edu => `
                                <div style="margin-bottom: 10px;">
                                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                        <strong style="font-size: 13px; color: #2c3e50;">${edu.institution}</strong>
                                        <span style="font-size: 11px; color: #7f8c8d;">${edu.start_date || ''} - ${edu.end_date || 'Present'}</span>
                                    </div>
                                    <p style="font-size: 12px; color: #444; margin: 3px 0;">
                                        ${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}
                                        ${edu.percentage ? ` • ${edu.percentage}` : ''}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Experience -->
                    ${experience?.some(e => e.company) ? `
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 2px;">
                                Professional Experience
                            </h2>
                            ${experience.filter(e => e.company).map(exp => `
                                <div style="margin-bottom: 14px;">
                                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                        <strong style="font-size: 13px; color: #2c3e50;">${exp.company}</strong>
                                        <span style="font-size: 11px; color: #7f8c8d;">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
                                    </div>
                                    <p style="font-size: 12px; font-style: italic; color: #555; margin: 2px 0;">
                                        ${exp.title || ''}${exp.location ? ` • ${exp.location}` : ''}
                                    </p>
                                    ${exp.description ? `
                                        <ul style="font-size: 11px; margin: 6px 0 0 18px; padding: 0; color: #444;">
                                            ${exp.description.split('\n').filter(Boolean).map(line => `<li style="margin-bottom: 3px;">${line}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Projects -->
                    ${projects?.some(p => p.name) ? `
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 2px;">
                                Projects
                            </h2>
                            ${projects.filter(p => p.name).map(proj => `
                                <div style="margin-bottom: 10px;">
                                    <strong style="font-size: 12px; color: #2c3e50;">${proj.name}</strong>
                                    ${proj.technologies ? `<span style="font-size: 10px; color: #7f8c8d;"> (${proj.technologies})</span>` : ''}
                                    ${proj.description ? `<p style="font-size: 11px; margin: 3px 0 0 0; color: #444;">${proj.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Skills -->
                    ${skills?.some(s => s.items) ? `
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 2px;">
                                Technical Skills
                            </h2>
                            ${skills.filter(s => s.items).map(skill => `
                                <p style="font-size: 11px; margin: 5px 0; color: #444;">
                                    <strong style="color: #2c3e50;">${skill.category}:</strong> ${skill.items}
                                </p>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    },

    modern: {
        id: 'modern',
        name: 'Modern Minimal',
        description: 'Clean and contemporary design with accent colors',
        thumbnail: '✨',
        render: (data) => {
            const { personal, education, experience, skills, projects, links } = data;
            return `
                <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 100%; color: #333; line-height: 1.5;">
                    <!-- Header -->
                    <div style="margin-bottom: 30px;">
                        <h1 style="font-size: 32px; font-weight: 300; margin: 0; color: #1a1a1a;">
                            ${personal?.first_name || 'First'} <strong>${personal?.last_name || 'Last'}</strong>
                        </h1>
                        <p style="font-size: 16px; color: #10b981; margin: 8px 0 0 0; font-weight: 500;">
                            ${personal?.job_title || 'Software Developer'}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 12px; font-size: 12px; color: #666;">
                            ${personal?.email ? `<span>📧 ${personal.email}</span>` : ''}
                            ${personal?.phone ? `<span>📱 ${personal.phone}</span>` : ''}
                            ${personal?.address ? `<span>📍 ${personal.address}</span>` : ''}
                        </div>
                        ${links?.filter(l => l.url).length > 0 ? `
                            <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 11px;">
                                ${links.filter(l => l.url).map(l => `<span style="color: #10b981;">🔗 ${l.type}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Experience -->
                    ${experience?.some(e => e.company) ? `
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #10b981; margin-bottom: 15px; letter-spacing: 1px;">
                                Experience
                            </h2>
                            ${experience.filter(e => e.company).map(exp => `
                                <div style="margin-bottom: 18px; padding-left: 15px; border-left: 3px solid #10b981;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h3 style="font-size: 14px; font-weight: 600; margin: 0; color: #1a1a1a;">${exp.title || 'Role'}</h3>
                                        <span style="font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 10px;">
                                            ${exp.start_date || ''} - ${exp.end_date || 'Present'}
                                        </span>
                                    </div>
                                    <p style="font-size: 13px; color: #555; margin: 4px 0;">
                                        ${exp.company}${exp.location ? ` • ${exp.location}` : ''}
                                    </p>
                                    ${exp.description ? `
                                        <ul style="font-size: 12px; margin: 8px 0 0 15px; padding: 0; color: #444;">
                                            ${exp.description.split('\n').filter(Boolean).map(line => `<li style="margin-bottom: 4px;">${line}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Education -->
                    ${education?.some(e => e.institution) ? `
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #10b981; margin-bottom: 15px; letter-spacing: 1px;">
                                Education
                            </h2>
                            ${education.filter(e => e.institution).map(edu => `
                                <div style="margin-bottom: 12px; padding-left: 15px; border-left: 3px solid #e5e5e5;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h3 style="font-size: 14px; font-weight: 600; margin: 0; color: #1a1a1a;">${edu.institution}</h3>
                                        <span style="font-size: 11px; color: #888;">${edu.start_date || ''} - ${edu.end_date || ''}</span>
                                    </div>
                                    <p style="font-size: 12px; color: #555; margin: 3px 0;">
                                        ${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}
                                        ${edu.percentage ? ` • ${edu.percentage}` : ''}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Projects -->
                    ${projects?.some(p => p.name) ? `
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #10b981; margin-bottom: 15px; letter-spacing: 1px;">
                                Projects
                            </h2>
                            <div style="display: grid; gap: 12px;">
                                ${projects.filter(p => p.name).map(proj => `
                                    <div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
                                        <h3 style="font-size: 13px; font-weight: 600; margin: 0; color: #1a1a1a;">${proj.name}</h3>
                                        ${proj.technologies ? `<p style="font-size: 10px; color: #10b981; margin: 4px 0 0 0;">${proj.technologies}</p>` : ''}
                                        ${proj.description ? `<p style="font-size: 11px; color: #555; margin: 6px 0 0 0;">${proj.description}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Skills -->
                    ${skills?.some(s => s.items) ? `
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #10b981; margin-bottom: 15px; letter-spacing: 1px;">
                                Skills
                            </h2>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${skills.filter(s => s.items).flatMap(s => s.items.split(',').map(item => item.trim())).filter(Boolean).map(skill => `
                                    <span style="font-size: 11px; padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 15px;">${skill}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    },

    creative: {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Eye-catching design for creative professionals',
        thumbnail: '🎨',
        render: (data) => {
            const { personal, education, experience, skills, projects, links } = data;
            return `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 100%; color: #333; line-height: 1.5;">
                    <!-- Header with gradient -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white;">
                        <h1 style="font-size: 36px; font-weight: 700; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                            ${personal?.first_name || 'First'} ${personal?.last_name || 'Last'}
                        </h1>
                        <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
                            ${personal?.job_title || 'Software Developer'}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; font-size: 13px; opacity: 0.9;">
                            ${personal?.email ? `<span>✉️ ${personal.email}</span>` : ''}
                            ${personal?.phone ? `<span>📞 ${personal.phone}</span>` : ''}
                            ${personal?.address ? `<span>📍 ${personal.address}</span>` : ''}
                        </div>
                        ${links?.filter(l => l.url).length > 0 ? `
                            <div style="display: flex; gap: 15px; margin-top: 12px; font-size: 12px;">
                                ${links.filter(l => l.url).map(l => `<span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 15px;">🔗 ${l.type}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <div style="padding: 30px 40px;">
                        <!-- Skills Badges at top -->
                        ${skills?.some(s => s.items) ? `
                            <div style="margin-bottom: 30px;">
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    ${skills.filter(s => s.items).flatMap(s => s.items.split(',').map(item => item.trim())).filter(Boolean).slice(0, 10).map(skill => `
                                        <span style="font-size: 12px; padding: 6px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-weight: 500;">${skill}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Experience -->
                        ${experience?.some(e => e.company) ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="font-size: 18px; font-weight: 700; color: #667eea; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                                    <span style="width: 30px; height: 3px; background: linear-gradient(90deg, #667eea, #764ba2);"></span>
                                    Experience
                                </h2>
                                ${experience.filter(e => e.company).map(exp => `
                                    <div style="margin-bottom: 20px; position: relative; padding-left: 20px;">
                                        <div style="position: absolute; left: 0; top: 8px; width: 10px; height: 10px; background: #667eea; border-radius: 50%;"></div>
                                        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                                            <h3 style="font-size: 15px; font-weight: 600; margin: 0; color: #1a1a1a;">${exp.title || 'Role'}</h3>
                                            <span style="font-size: 12px; color: #764ba2; font-weight: 500;">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
                                        </div>
                                        <p style="font-size: 13px; color: #667eea; margin: 4px 0; font-weight: 500;">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</p>
                                        ${exp.description ? `
                                            <ul style="font-size: 12px; margin: 8px 0 0 15px; padding: 0; color: #555;">
                                                ${exp.description.split('\n').filter(Boolean).map(line => `<li style="margin-bottom: 4px;">${line}</li>`).join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <!-- Education & Projects Side by Side -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                            <!-- Education -->
                            ${education?.some(e => e.institution) ? `
                                <div>
                                    <h2 style="font-size: 16px; font-weight: 700; color: #667eea; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                        <span style="width: 20px; height: 3px; background: linear-gradient(90deg, #667eea, #764ba2);"></span>
                                        Education
                                    </h2>
                                    ${education.filter(e => e.institution).map(edu => `
                                        <div style="margin-bottom: 15px; padding: 15px; background: #f8f9ff; border-radius: 10px; border-left: 4px solid #667eea;">
                                            <h3 style="font-size: 13px; font-weight: 600; margin: 0; color: #1a1a1a;">${edu.institution}</h3>
                                            <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">
                                                ${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}
                                            </p>
                                            <p style="font-size: 11px; color: #764ba2; margin: 4px 0 0 0;">
                                                ${edu.start_date || ''} - ${edu.end_date || ''}
                                                ${edu.percentage ? ` • ${edu.percentage}` : ''}
                                            </p>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<div></div>'}

                            <!-- Projects -->
                            ${projects?.some(p => p.name) ? `
                                <div>
                                    <h2 style="font-size: 16px; font-weight: 700; color: #667eea; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                        <span style="width: 20px; height: 3px; background: linear-gradient(90deg, #667eea, #764ba2);"></span>
                                        Projects
                                    </h2>
                                    ${projects.filter(p => p.name).map(proj => `
                                        <div style="margin-bottom: 15px; padding: 15px; background: #f8f9ff; border-radius: 10px; border-left: 4px solid #764ba2;">
                                            <h3 style="font-size: 13px; font-weight: 600; margin: 0; color: #1a1a1a;">${proj.name}</h3>
                                            ${proj.technologies ? `<p style="font-size: 10px; color: #764ba2; margin: 4px 0 0 0;">${proj.technologies}</p>` : ''}
                                            ${proj.description ? `<p style="font-size: 11px; color: #555; margin: 6px 0 0 0;">${proj.description}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<div></div>'}
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

export const getTemplateById = (id) => TEMPLATES[id] || TEMPLATES.professional;
export const getAllTemplates = () => Object.values(TEMPLATES);
