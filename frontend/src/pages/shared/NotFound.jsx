import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-1 pointer-events-none opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center"
      >
        <div className="font-display font-bold text-[8rem] sm:text-[12rem] text-text-primary/5 leading-none select-none mb-4">404</div>
        <div className="relative -mt-16 sm:-mt-24">
          <div className="w-16 h-16 rounded-2xl bg-accent-soft border border-accent-border flex items-center justify-center mx-auto mb-5">
            <Bookmark size={24} className="text-accent-glow" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Page not found</h1>
          <p className="text-text-muted text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
