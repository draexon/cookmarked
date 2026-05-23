import { Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-mesh-1 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-3 h-3 bg-accent-primary rounded-full opacity-60"
        animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-2 h-2 bg-blue-400 rounded-full opacity-40"
        animate={{ y: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-accent-primary flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-xl text-text-primary">CookMarked</span>
          </div>
          <p className="text-text-muted text-sm">Bookmark what matters</p>
        </motion.div>

        <Outlet />
      </div>
    </div>
  )
}
