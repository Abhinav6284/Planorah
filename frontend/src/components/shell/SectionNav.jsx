import { Link, useLocation } from 'react-router-dom';
import { SECTION_LINKS, isActive } from './nav';
import { cx } from '../../utils/cx';

export default function SectionNav() {
  const { pathname } = useLocation();
  const root = Object.keys(SECTION_LINKS).find((r) => isActive(pathname, r));
  if (!root) return null;
  const links = SECTION_LINKS[root];

  return (
    <nav aria-label="Section" className="flex gap-5 overflow-x-auto border-b border-line px-4 md:px-8">
      {links.map(({ to, label }) => {
        const active = to === root ? pathname === root : isActive(pathname, to);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cx(
              '-mb-px whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              active ? 'border-focus text-fg' : 'border-transparent text-muted hover:text-fg',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
