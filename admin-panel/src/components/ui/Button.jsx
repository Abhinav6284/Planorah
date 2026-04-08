import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gold text-obs-base font-semibold hover:bg-gold-light',
  secondary: 'bg-obs-elevated border border-[rgba(255,255,255,0.08)] text-[#F1F5F9] hover:bg-obs-hover hover:border-[rgba(255,255,255,0.14)]',
  ghost: 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-obs-elevated',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50',
  success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-xl transition-all duration-150 font-body cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
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
