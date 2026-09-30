import { Route } from 'react-router-dom';
import RedirectWithParams from './RedirectWithParams';

// Old URLs → new routes. Kept as data so the table itself is tested.
export const LEGACY_REDIRECTS = [
  { from: '/dashboard', to: '/today' },
  { from: '/tasks', to: '/today/tasks' },
  { from: '/tasks/day', to: '/today/timeline' },
  { from: '/tasks/focus', to: '/today/focus' },
  { from: '/tasks/analytics', to: '/progress' },
  { from: '/scheduler', to: '/today/calendar' },
  { from: '/roadmap', to: '/path' },
  { from: '/roadmap/list', to: '/path' },
  { from: '/roadmap/generate', to: '/path/new' },
  { from: '/roadmap/projects', to: '/path/projects' },
  { from: '/roadmap/:id', to: '/path/roadmap/:id' },
  { from: '/planora', to: '/path/exam' },
  { from: '/planora/subject/:subjectId', to: '/path/exam/subject/:subjectId' },
  { from: '/planora/subject/:subjectId/plan', to: '/path/exam/subject/:subjectId/plan' },
  { from: '/planora/topic/:topicId/notes', to: '/path/exam/topic/:topicId/notes' },
  { from: '/planora/topic/:topicId/guide', to: '/path/exam/topic/:topicId/guide' },
  { from: '/assistant', to: '/mentor' },
  { from: '/resume', to: '/career/resume' },
  { from: '/resume/new', to: '/career/resume/new' },
  { from: '/resume/compiled', to: '/career/resume/compiled' },
  { from: '/resume/compiled/:versionId', to: '/career/resume/compiled/:versionId' },
  { from: '/resume/:id', to: '/career/resume/:id' },
  { from: '/ats', to: '/career/ats' },
  { from: '/linkedin-analyzer', to: '/career/linkedin' },
  { from: '/portfolio/edit', to: '/career/portfolio' },
  { from: '/projects', to: '/career/portfolio/projects' },
  { from: '/profile', to: '/settings#profile' },
  { from: '/subscription/plans', to: '/settings#plans' },
  { from: '/subscription', to: '/settings#subscription' },
  { from: '/billing/history', to: '/settings#billing' },
];

export const legacyRedirectRoutes = () => LEGACY_REDIRECTS.map(({ from, to }) => (
  <Route key={from} path={from} element={<RedirectWithParams to={to} />} />
));
