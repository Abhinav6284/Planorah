import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, isActive } from './nav';
import AvatarMenu from './AvatarMenu';
import { cx } from '../../utils/cx';

export default function Sidebar({ user }) {
  const { pathname } = useLocation();
  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-line bg-subtle px-3 py-4 md:flex">
      <Link to="/today" className="mb-6 px-2 text-[15px] font-semibold tracking-[-0.02em] text-fg">planorah</Link>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(pathname, to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active ? 'bg-surface-hover text-fg' : 'text-muted hover:bg-surface-hover hover:text-fg',
              )}
            >
              {active && <span aria-hidden="true" className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />}
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <AvatarMenu user={user} side="top" />
    </aside>
  );
}
