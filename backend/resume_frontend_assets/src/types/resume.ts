export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  achievements: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    role: string;
    summary?: string;
  };
  contact: ContactInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications?: Certification[];
}

export interface TemplateProps {
  data: ResumeData;
  fontFamily?: string;
  primaryColor?: string;
}
