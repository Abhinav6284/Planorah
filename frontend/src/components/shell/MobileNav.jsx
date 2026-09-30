import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, isActive } from './nav';
import { cx } from '../../utils/cx';

export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Main mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-subtle pb-safe-bottom md:hidden"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = isActive(pathname, to);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cx('flex h-14 flex-col items-center justify-center gap-1 text-[11px]', active ? 'text-fg' : 'text-faint')}
          >
            <Icon size={18} strokeWidth={1.75} className={active ? 'text-accent-text' : undefined} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
