import { motion } from 'framer-motion'

const variants = {
  primary:   'bg-charcoal text-white hover:opacity-75 shadow-level-4-highlight',
  secondary: 'bg-white text-charcoal border border-border-gray hover:border-charcoal shadow-level-2-card',
  ghost:     'text-mid-gray hover:text-charcoal hover:bg-gray-50',
  danger:    'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300',
  success:   'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-inter font-semibold transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  )
}
