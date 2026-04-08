const STATUS_STYLES = {
  active:    'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  inactive:  'bg-slate-500/12  text-slate-400   border-slate-500/25',
  suspended: 'bg-red-500/12    text-red-400     border-red-500/25',
  pending:   'bg-amber-500/12  text-amber-400   border-amber-500/25',
  canceled:  'bg-slate-500/12  text-slate-400   border-slate-500/25',
  past_due:  'bg-red-500/12    text-red-400     border-red-500/25',
  paid:      'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  failed:    'bg-red-500/12    text-red-400     border-red-500/25',
}

const PLAN_STYLES = {
  Free:       'bg-slate-500/10  text-slate-300   border-slate-500/20',
  Pro:        'bg-blue-500/10   text-blue-300    border-blue-500/20',
  Premium:    'bg-amber-500/10  text-amber-300   border-amber-500/20',
  Enterprise: 'bg-violet-500/10 text-violet-300  border-violet-500/20',
}

const ROLE_STYLES = {
  superadmin: 'bg-rose-500/10  text-rose-300   border-rose-500/20',
  admin:      'bg-amber-500/10 text-amber-300  border-amber-500/20',
  user:       'bg-slate-500/10 text-slate-300  border-slate-500/20',
}

export default function Badge({ type = 'status', value, className = '' }) {
  const map = type === 'plan' ? PLAN_STYLES : type === 'role' ? ROLE_STYLES : STATUS_STYLES
  const style = map[value] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize',
        style,
        className,
      ].join(' ')}
    >
      {value?.replace('_', ' ')}
    </span>
  )
}
