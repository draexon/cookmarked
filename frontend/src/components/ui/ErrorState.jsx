import { AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <h3 className="font-semibold text-text-primary mb-1">Something went wrong</h3>
      <p className="text-text-muted text-sm mb-6 max-w-xs">{message || 'Failed to load data. Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 btn-ghost text-sm"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </motion.div>
  )
}
