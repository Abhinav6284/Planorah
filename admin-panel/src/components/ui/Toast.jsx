import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-400" />,
  error:   <XCircle      size={16} className="text-red-400"   />,
  warning: <AlertCircle  size={16} className="text-yellow-400"/>,
  info:    <Info         size={16} className="text-sky-400"   />,
}

const BARS = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-sky-400',
}

export default function Toast({ toast, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1     }}
      exit={{    opacity: 0, x: 60, scale: 0.92   }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-[360px]"
      style={{
        background:  'var(--bg-elevated)',
        border:      '1px solid var(--border-bright)',
        boxShadow:   '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${BARS[toast.type] ?? BARS.info}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3.5, ease: 'linear' }}
      />

      <span className="flex-shrink-0">{ICONS[toast.type] ?? ICONS.info}</span>
      <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
