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
        <label
          className="text-xs font-medium tracking-wide uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            {icon}
          </span>
        )}
        <input
          className={[
            'w-full rounded-xl text-sm px-3.5 py-2.5 transition-colors duration-150 outline-none border',
            'placeholder-mid-gray',
            error
              ? 'border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20'
              : 'focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50',
            icon ? 'pl-9' : '',
            inputClassName,
          ].join(' ')}
          style={{
            background: 'var(--bg-elevated)',
            borderColor: error ? undefined : 'var(--border-bright)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
