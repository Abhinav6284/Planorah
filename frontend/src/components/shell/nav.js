import { Sun, Map, MessageCircle, TrendingUp } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/path', label: 'Path', icon: Map },
  { to: '/mentor', label: 'Mentor', icon: MessageCircle },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Sub-pages per section. The first link is the section root (active only on exact match).
export const SECTION_LINKS = {
  '/today': [
    { to: '/today', label: 'Overview' },
    { to: '/today/tasks', label: 'Tasks' },
    { to: '/today/calendar', label: 'Calendar' },
  ],
  '/path': [
    { to: '/path', label: 'Roadmaps' },
    { to: '/path/exam', label: 'Exams' },
    { to: '/path/projects', label: 'Projects' },
  ],
};
