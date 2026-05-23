import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-overlay border border-border flex items-center justify-center mb-5">
          <Icon size={28} className="text-text-muted" />
        </div>
      )}
      <h3 className="font-display font-semibold text-text-primary text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && action}
    </motion.div>
  )
}
