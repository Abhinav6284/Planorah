const STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive:  'bg-gray-50    text-mid-gray    border border-border-gray',
  suspended: 'bg-red-50     text-red-600     border border-red-200',
  pending:   'bg-amber-50   text-amber-700   border border-amber-200',
  canceled:  'bg-gray-50    text-mid-gray    border border-border-gray',
  cancelled: 'bg-gray-50    text-mid-gray    border border-border-gray',
  past_due:  'bg-red-50     text-red-600     border border-red-200',
  paid:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed:    'bg-red-50     text-red-600     border border-red-200',
  grace:     'bg-amber-50   text-amber-700   border border-amber-200',
  expired:   'bg-gray-50    text-mid-gray    border border-border-gray',
}

const PLAN_STYLES = {
  Free:          'bg-gray-50     text-mid-gray   border border-border-gray',
  Pro:           'bg-charcoal    text-white       border border-charcoal',
  Premium:       'bg-charcoal    text-white       border border-charcoal',
  Enterprise:    'bg-charcoal    text-white       border border-charcoal',
  Explorer:      'bg-gray-100    text-charcoal    border border-border-gray',
  Starter:       'bg-charcoal    text-white       border border-charcoal',
  'Career Ready':   'bg-charcoal text-white       border border-charcoal',
  'Placement Pro':  'bg-charcoal text-white       border border-charcoal',
}

const ROLE_STYLES = {
  superadmin: 'bg-charcoal text-white  border border-charcoal',
  admin:      'bg-gray-100 text-charcoal border border-border-gray',
  user:       'bg-gray-50  text-mid-gray border border-border-gray',
}

export default function Badge({ type = 'status', value, className = '' }) {
  const map = type === 'plan' ? PLAN_STYLES : type === 'role' ? ROLE_STYLES : STATUS_STYLES
  const style = map[value] || 'bg-gray-50 text-mid-gray border border-border-gray'
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
