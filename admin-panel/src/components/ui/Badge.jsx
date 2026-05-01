const STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive:  'bg-[var(--bg-elevated)]    text-[var(--text-secondary)]    border border-[var(--border)]',
  suspended: 'bg-red-50     text-red-600     border border-red-200',
  pending:   'bg-amber-50   text-amber-700   border border-amber-200',
  canceled:  'bg-[var(--bg-elevated)]    text-[var(--text-secondary)]    border border-[var(--border)]',
  cancelled: 'bg-[var(--bg-elevated)]    text-[var(--text-secondary)]    border border-[var(--border)]',
  past_due:  'bg-red-50     text-red-600     border border-red-200',
  paid:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed:    'bg-red-50     text-red-600     border border-red-200',
  grace:     'bg-amber-50   text-amber-700   border border-amber-200',
  expired:   'bg-[var(--bg-elevated)]    text-[var(--text-secondary)]    border border-[var(--border)]',
}

const PLAN_STYLES = {
  Free:          'bg-[var(--bg-elevated)]     text-[var(--text-secondary)]   border border-[var(--border)]',
  Pro:           'bg-charcoal    text-white       border border-charcoal',
  Premium:       'bg-charcoal    text-white       border border-charcoal',
  Enterprise:    'bg-charcoal    text-white       border border-charcoal',
  Explorer:      'bg-[var(--bg-elevated)]    text-[var(--text-primary)]    border border-[var(--border)]',
  Starter:       'bg-charcoal    text-white       border border-charcoal',
  'Career Ready':   'bg-charcoal text-white       border border-charcoal',
  'Placement Pro':  'bg-charcoal text-white       border border-charcoal',
}

const ROLE_STYLES = {
  superadmin: 'bg-charcoal text-white  border border-charcoal',
  admin:      'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)]',
  user:       'bg-[var(--bg-elevated)]  text-[var(--text-secondary)] border border-[var(--border)]',
}

export default function Badge({ type = 'status', value, className = '' }) {
  const map = type === 'plan' ? PLAN_STYLES : type === 'role' ? ROLE_STYLES : STATUS_STYLES
  const style = map[value] || 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-inter font-medium capitalize',
        style,
        className,
      ].join(' ')}
    >
      {value?.replace('_', ' ')}
    </span>
  )
}
