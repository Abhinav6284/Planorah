import { Sun, Map, MessageCircle, TrendingUp } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/path', label: 'Path', icon: Map },
  { to: '/mentor', label: 'Mentor', icon: MessageCircle },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);
