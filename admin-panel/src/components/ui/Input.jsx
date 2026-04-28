export default function Input({
  label,
  error,
  icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label className="text-xs font-medium text-[#94A3B8] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={[
            'w-full bg-obs-elevated border border-[rgba(255,255,255,0.08)] rounded-xl',
            'text-[#F1F5F9] placeholder-[#475569] text-sm',
            'px-3.5 py-2.5 transition-all duration-150',
            'focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20',
            'hover:border-[rgba(255,255,255,0.14)]',
            error ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10' : '',
            icon ? 'pl-9' : '',
            inputClassName,
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
