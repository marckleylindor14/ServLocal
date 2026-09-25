import { motion } from 'framer-motion'
import { PackageOpen } from 'lucide-react'

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default'
}) {
  const isCompact = variant === 'compact'
  const isInline = variant === 'inline'

  const padding = isInline ? 'py-6' : isCompact ? 'py-10' : 'py-16'
  const iconSize = isInline ? 22 : isCompact ? 28 : 32
  const circleSize = isInline ? 'w-12 h-12' : isCompact ? 'w-16 h-16' : 'w-20 h-20'
  const titleSize = isInline ? 'text-base' : isCompact ? 'text-lg' : 'text-xl'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      className={`flex flex-col items-center justify-center ${padding} text-center px-4`}
    >
      <div className={`${circleSize} rounded-full bg-white/5 border border-border/40 flex items-center justify-center mb-4 animate-pulse-soft`}>
        <Icon size={iconSize} className="text-muted-foreground" />
      </div>

      <h3 className={`${titleSize} font-semibold mb-1.5`}>{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition press"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}