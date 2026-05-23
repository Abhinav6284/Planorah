import { ResumeData } from '../types/resume';

export const mockResumeData: ResumeData = {
  personalInfo: {
    firstName: "Alex",
    lastName: "Chen",
    role: "Senior Software Engineer",
    summary: "Product-minded software engineer with 6+ years of experience building scalable distributed systems and high-performance web applications. Proven track record at high-growth startups and enterprise companies. Passionate about system design, performance optimization, and mentoring junior engineers.",
  },
  contact: {
    email: "alex.chen@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexchen",
    github: "github.com/alexchen",
    portfolio: "alexchen.dev"
  },
  skills: [
    {
      category: "Languages",
      skills: ["TypeScript", "Python", "Go", "Java", "SQL"]
    },
    {
      category: "Frontend",
      skills: ["React", "Next.js", "Redux", "Tailwind CSS", "GraphQL"]
    },
    {
      category: "Backend & Systems",
      skills: ["Node.js", "Django", "PostgreSQL", "Redis", "Kafka", "Redis"]
    },
    {
      category: "Infrastructure",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"]
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Stripe",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      current: true,
      achievements: [
        "Led the migration of a legacy monolithic payment processing pipeline to a microservices architecture using Go and gRPC, reducing latency by 45%.",
        "Designed and implemented a distributed rate-limiting service using Redis, handling peak loads of 50K requests per second.",
        "Mentored a team of 4 engineers and established new CI/CD standards that decreased deployment time by 30%."
      ]
    },
    {
      id: "exp-2",
      company: "Vercel",
      title: "Software Engineer",
      location: "Remote",
      startDate: "2018",
      endDate: "2021",
      current: false,
      achievements: [
        "Developed core features for the edge caching layer using Rust, improving cache hit rates by 15% globally.",
        "Optimized frontend performance of the main dashboard (React/Next.js), reducing Time to Interactive (TTI) by 1.2 seconds.",
        "Created an internal developer tool CLI that automated local environment setup, saving the engineering team an estimated 200 hours monthly."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Queue",
      description: "Open-source distributed task queue built with Go and Redis.",
      technologies: ["Go", "Redis", "Docker"],
      link: "github.com/alexchen/go-taskq",
      achievements: [
        "Achieved 1,000+ GitHub stars and adoption by 5+ startup companies.",
        "Implemented fault tolerance and at-least-once delivery semantics."
      ]
    },
    {
      id: "proj-2",
      name: "AI Code Reviewer",
      description: "GitHub App that provides automated code reviews using LLMs.",
      technologies: ["TypeScript", "Node.js", "OpenAI API"],
      achievements: [
        "Analyzes pull requests and comments on potential security vulnerabilities and performance bottlenecks.",
        "Processes over 500 PRs daily for 50+ repositories."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
      gpa: "3.8/4.0",
      honors: "Dean's List, Upsilon Pi Epsilon"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2022"
    }
  ]
};
