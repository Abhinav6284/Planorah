import React from 'react';
import { TemplateProps } from '../../types/resume';

/**
 * FAANG Minimal Template
 * Design Philosophy: Extremely clean, single-column, high data density, no distractions.
 * ATS Score Estimation: 98/100
 * Best Suited Roles: Software Engineers, System Architects, Backend Developers
 */
export const FaangMinimal: React.FC<TemplateProps> = ({ data, fontFamily = 'font-sans' }) => {
  return (
    <div className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-900 ${fontFamily} text-sm leading-snug shadow-xl`}>
      {/* Header */}
      <header className="mb-6 text-center border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-bold tracking-tight uppercase text-gray-900 mb-1">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-gray-600 text-xs mt-2">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && (
            <>
              <span>•</span>
              <span>{data.contact.phone}</span>
            </>
          )}
          {data.contact.location && (
            <>
              <span>•</span>
              <span>{data.contact.location}</span>
            </>
          )}
          {data.contact.linkedin && (
            <>
              <span>•</span>
              <a href={`https://${data.contact.linkedin}`} className="hover:underline">{data.contact.linkedin}</a>
            </>
          )}
          {data.contact.github && (
            <>
              <span>•</span>
              <a href={`https://${data.contact.github}`} className="hover:underline">{data.contact.github}</a>
            </>
          )}
        </div>
      </header>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
          Experience
        </h2>
        <div className="flex flex-col gap-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">
                  {exp.title} <span className="font-normal text-gray-600">at {exp.company}</span>
                </h3>
                <span className="text-gray-600 text-xs font-medium">
                  {exp.startDate} – {exp.endDate} | {exp.location}
                </span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800">
                {exp.achievements.map((achievement, index) => (
                  <li key={index} className="pl-1">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
          Projects
        </h2>
        <div className="flex flex-col gap-4">
          {data.projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">
                  {project.name}
                  {project.link && (
                    <span className="font-normal text-gray-500 ml-2 text-xs">
                      ({project.link})
                    </span>
                  )}
                </h3>
                <span className="text-gray-500 text-xs italic">
                  {project.technologies.join(', ')}
                </span>
              </div>
              <p className="text-gray-700 text-xs mb-1">{project.description}</p>
              <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800">
                {project.achievements.map((achievement, index) => (
                  <li key={index} className="pl-1">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
          Technical Skills
        </h2>
        <div className="flex flex-col gap-1.5">
          {data.skills.map((skillGroup, index) => (
            <div key={index} className="flex">
              <span className="font-bold text-gray-900 w-32 shrink-0">{skillGroup.category}:</span>
              <span className="text-gray-800">{skillGroup.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
          Education
        </h2>
        <div className="flex flex-col gap-3">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                <p className="text-gray-800 italic">{edu.degree} in {edu.field}</p>
                {edu.honors && <p className="text-gray-600 text-xs mt-0.5">{edu.honors}</p>}
              </div>
              <div className="text-right">
                <span className="text-gray-600 text-xs font-medium block">{edu.startDate} – {edu.endDate}</span>
                {edu.gpa && <span className="text-gray-700 text-xs font-bold">GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications (Optional) */}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Certifications
          </h2>
          <div className="flex flex-col gap-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className="font-bold text-gray-800">{cert.name} <span className="font-normal text-gray-600">— {cert.issuer}</span></span>
                <span className="text-gray-600 text-xs">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
