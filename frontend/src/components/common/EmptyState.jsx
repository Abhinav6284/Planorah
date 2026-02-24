import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Map, CheckSquare, Calendar, FolderOpen, Briefcase } from 'lucide-react';

/**
 * EmptyState - Reusable component for when a data list is empty.
 * Shows an illustration icon, title, description, and optional CTA button.
 */

const presets = {
  tasks: {
    icon: CheckSquare,
    title: 'No tasks yet',
    description: 'Create your first task to start tracking your progress.',
    ctaText: 'Create Task',
    ctaPath: '/roadmap/generate',
    color: 'indigo',
  },
  roadmaps: {
    icon: Map,
    title: 'No roadmaps yet',
    description: 'Generate a personalized learning roadmap to get started.',
    ctaText: 'Generate Roadmap',
    ctaPath: '/roadmap/generate',
    color: 'emerald',
  },
  resumes: {
    icon: FileText,
    title: 'No resumes yet',
    description: 'Build your first professional resume with our AI-powered builder.',
    ctaText: 'Build Resume',
    ctaPath: '/resume/new',
    color: 'violet',
  },
  calendar: {
    icon: Calendar,
    title: 'No events scheduled',
    description: 'Your calendar is clear. Generate tasks from a roadmap to populate it.',
    ctaText: 'View Roadmaps',
    ctaPath: '/roadmap/list',
    color: 'blue',
  },
  projects: {
    icon: FolderOpen,
    title: 'No projects yet',
    description: 'Save a project from CodeSpace to see it here.',
    ctaText: 'Open CodeSpace',
    ctaPath: '/lab/codespace',
    color: 'amber',
  },
  jobs: {
    icon: Briefcase,
    title: 'No job listings found',
    description: 'Try adjusting your search filters or keywords.',
    ctaText: null,
    ctaPath: null,
    color: 'rose',
  },
};

const colorMap = {
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', icon: 'text-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'text-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/20', icon: 'text-violet-500', btn: 'bg-violet-600 hover:bg-violet-700' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', icon: 'text-blue-500', btn: 'bg-blue-600 hover:bg-blue-700' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/20', icon: 'text-amber-500', btn: 'bg-amber-600 hover:bg-amber-700' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/20', icon: 'text-rose-500', btn: 'bg-rose-600 hover:bg-rose-700' },
};

const EmptyState = ({
  preset,
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  ctaText: customCtaText,
  ctaPath: customCtaPath,
  color: customColor = 'indigo',
  className = '',
}) => {
  const config = preset ? presets[preset] : {};
  const Icon = CustomIcon || config.icon || FolderOpen;
  const title = customTitle || config.title || 'Nothing here yet';
  const description = customDescription || config.description || '';
  const ctaText = customCtaText !== undefined ? customCtaText : config.ctaText;
  const ctaPath = customCtaPath !== undefined ? customCtaPath : config.ctaPath;
  const color = customColor || config.color || 'indigo';
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-5`}>
        <Icon className={`w-8 h-8 ${colors.icon}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {ctaText && ctaPath && (
        <Link
          to={ctaPath}
          className={`px-6 py-3 ${colors.btn} text-white rounded-full font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm`}
        >
          {ctaText}
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
