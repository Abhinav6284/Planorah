import { cx } from '../../utils/cx';

const TONES = {
  neutral: 'bg-surface-hover text-muted',
  accent: 'bg-accent-soft text-accent-text',
  danger: 'bg-surface-hover text-danger',
  warn: 'bg-surface-hover text-warn',
  info: 'bg-surface-hover text-info',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  );
}
