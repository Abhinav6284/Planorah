import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import { FOCUS } from './Button';

export function ListRow({ leading, title, meta, trailing, onClick, to, className }) {
  const interactive = Boolean(onClick || to);
  const classes = cx(
    'flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm',
    interactive && cx('transition-colors hover:bg-surface-hover', FOCUS),
    className,
  );
  const body = (
    <>
      {leading}
      <span className="min-w-0 flex-1 truncate text-fg">{title}</span>
      {meta && <span className="shrink-0 font-mono text-xs tabular text-faint">{meta}</span>}
      {trailing}
    </>
  );
  if (to) return <Link to={to} className={classes}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={classes}>{body}</button>;
  return <div className={classes}>{body}</div>;
}
