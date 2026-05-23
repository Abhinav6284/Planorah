import React from 'react';
import { TemplateProps } from '../../types/resume';

/**
 * Harvard Inspired ATS Template
 * Design Philosophy: Traditional, authoritative, heavily relies on classic serif typography.
 * ATS Score Estimation: 99/100
 * Best Suited Roles: Finance, Law, Academia, Management, Traditional Tech
 */
export const HarvardATS: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-black font-serif text-[11pt] leading-snug shadow-xl">
      {/* Header */}
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-2 text-[10pt] mt-1">
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.phone && (
            <>
              <span>|</span>
              <span>{data.contact.phone}</span>
            </>
          )}
          {data.contact.email && (
            <>
              <span>|</span>
              <span>{data.contact.email}</span>
            </>
          )}
          {data.contact.linkedin && (
            <>
              <span>|</span>
              <span>{data.contact.linkedin.replace('linkedin.com/in/', '')}</span>
            </>
          )}
        </div>
      </header>

      {/* Education - Usually first in Harvard format if recent graduate, but standard otherwise */}
      <section className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 mb-2 text-center">
          Education
        </h2>
        <div className="flex flex-col gap-3">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between font-bold">
                <span>{edu.institution}</span>
                <span>{edu.endDate}</span>
              </div>
              <div className="flex justify-between italic">
                <span>{edu.degree}, {edu.field}</span>
                <span>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
              </div>
              {edu.honors && <div className="text-[10pt] mt-0.5">{edu.honors}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 mb-2 text-center">
          Experience
        </h2>
        <div className="flex flex-col gap-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between font-bold">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <div className="flex justify-between italic mb-1">
                <span>{exp.title}</span>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              <ul className="list-disc list-outside ml-6 space-y-1 text-[10.5pt]">
                {exp.achievements.map((achievement, index) => (
                  <li key={index} className="pl-1">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects / Leadership */}
      <section className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 mb-2 text-center">
          Selected Projects & Leadership
        </h2>
        <div className="flex flex-col gap-3">
          {data.projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between font-bold">
                <span>{project.name}</span>
                <span className="italic font-normal">{project.technologies.join(', ')}</span>
              </div>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-1 text-[10.5pt]">
                {project.achievements.map((achievement, index) => (
                  <li key={index} className="pl-1">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills & Interests */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 mb-2 text-center">
          Skills & Interests
        </h2>
        <div className="flex flex-col gap-1 text-[10.5pt]">
          {data.skills.map((skillGroup, index) => (
            <div key={index}>
              <span className="font-bold">{skillGroup.category}: </span>
              <span>{skillGroup.skills.join(', ')}</span>
            </div>
          ))}
          {data.certifications && data.certifications.length > 0 && (
            <div>
              <span className="font-bold">Certifications: </span>
              <span>{data.certifications.map(c => c.name).join(', ')}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
