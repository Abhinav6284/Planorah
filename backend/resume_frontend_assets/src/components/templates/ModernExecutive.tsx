import React from 'react';
import { TemplateProps } from '../../types/resume';

/**
 * Modern Executive Template
 * Design Philosophy: Two-column header, subtle use of primary color, highly readable, premium feel.
 * ATS Score Estimation: 95/100
 * Best Suited Roles: Product Managers, Design Leaders, Executives, Tech Leads
 */
export const ModernExecutive: React.FC<TemplateProps> = ({ data, fontFamily = 'font-sans', primaryColor = 'text-blue-700' }) => {
  return (
    <div className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-800 ${fontFamily} text-sm leading-relaxed shadow-xl`}>
      {/* Header - Split Layout */}
      <header className="flex justify-between items-end mb-8 border-b-2 border-gray-100 pb-6">
        <div className="max-w-2xl">
          <h1 className={`text-4xl font-extrabold tracking-tight ${primaryColor} mb-2`}>
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </h1>
          <p className="text-lg font-medium text-gray-600 uppercase tracking-widest">
            {data.personalInfo.role}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-1">
          {data.contact.email && <p>{data.contact.email}</p>}
          {data.contact.phone && <p>{data.contact.phone}</p>}
          {data.contact.location && <p>{data.contact.location}</p>}
          {data.contact.linkedin && <p>{data.contact.linkedin}</p>}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-8">
          <p className="text-gray-700 font-medium leading-relaxed">
            {data.personalInfo.summary}
          </p>
        </section>
      )}

      {/* Two Column Layout for Body */}
      <div className="flex gap-10">
        
        {/* Main Content (Left) */}
        <div className="w-2/3 space-y-8">
          {/* Experience */}
          <section>
            <h2 className={`text-xl font-bold ${primaryColor} mb-4 flex items-center`}>
              <span className="mr-2">Professional Experience</span>
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <h4 className="text-md font-medium text-gray-600 mb-2">{exp.company} • {exp.location}</h4>
                  <ul className="list-disc list-outside ml-4 space-y-1.5 text-gray-700">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="pl-1">{achievement}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 className={`text-xl font-bold ${primaryColor} mb-4 flex items-center`}>
              <span className="mr-2">Key Projects</span>
            </h2>
            <div className="space-y-5">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="text-md font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{project.description}</p>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700 text-sm">
                    {project.achievements.map((achievement, index) => (
                      <li key={index} className="pl-1">{achievement}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-1/3 space-y-8">
          {/* Skills */}
          <section>
            <h2 className={`text-lg font-bold ${primaryColor} mb-4 uppercase tracking-wider text-sm`}>
              Core Competencies
            </h2>
            <div className="space-y-4">
              {data.skills.map((skillGroup, index) => (
                <div key={index}>
                  <h3 className="text-xs font-bold text-gray-900 uppercase mb-2">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGroup.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className={`text-lg font-bold ${primaryColor} mb-4 uppercase tracking-wider text-sm`}>
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-900 leading-snug">{edu.degree}</h3>
                  <p className="text-gray-600 text-sm">{edu.institution}</p>
                  <p className="text-gray-500 text-xs mt-1">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className={`text-lg font-bold ${primaryColor} mb-4 uppercase tracking-wider text-sm`}>
                Certifications
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{cert.name}</h3>
                    <p className="text-gray-600 text-xs">{cert.issuer} • {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
