import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import { Spinner } from './Skeleton';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

const VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:brightness-95',
  secondary: 'border border-line-strong text-fg hover:bg-surface-hover',
  ghost: 'text-muted hover:text-fg hover:bg-surface-hover',
  danger: 'border border-line-strong text-danger hover:bg-surface-hover',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export function Button({ variant = 'primary', size = 'md', loading = false, to, icon: Icon, className, children, disabled, ...props }) {
  const classes = cx(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors select-none',
    'disabled:opacity-50 disabled:pointer-events-none',
    FOCUS, VARIANTS[variant], SIZES[size], className,
  );
  const content = (
    <>
      {loading ? <Spinner size={14} /> : Icon && <Icon size={16} strokeWidth={1.75} aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}

export { FOCUS };
