import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Shuffle, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useUIStore } from '@/store/uiStore'
import PlatformBadge from '@/components/ui/PlatformBadge'
import { truncate, getPlatformThumbnail } from '@/utils'

export default function RandomReelModal() {
  const { randomReelModal, setRandomReelModal } = useUIStore()
  const { open, reel, reels = [] } = randomReelModal
  const firedRef = useRef(false)

  useEffect(() => {
    if (open && reel && !firedRef.current) {
      firedRef.current = true
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7c6dff', '#a48fff', '#5b8eff', '#ffffff'],
          zIndex: 9999,
        })
      }, 300)
    }
    if (!open) {
      firedRef.current = false
    }
  }, [open, reel])

  const close = () => setRandomReelModal({ open: false, reel: null, reels: [] })
  const reshuffle = () => {
    if (reels.length < 2) return
    const nextPool = reels.filter((item) => item.id !== reel.id)
    const next = nextPool[Math.floor(Math.random() * nextPool.length)]
    setRandomReelModal({ reel: next })
  }

  return (
    <AnimatePresence>
      {open && reel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm z-50"
          >
            <div className="glass-strong rounded-3xl border border-border p-6 shadow-elevated overflow-hidden relative">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-primary/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-glow" />
                  <span className="font-display font-semibold text-accent-glow text-sm">Random Pick!</span>
                </div>
                <button onClick={close} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-all">
                  <X size={15} />
                </button>
              </div>

              {/* Reel preview */}
              <div className="rounded-2xl overflow-hidden mb-4 relative">
                <img
                  src={reel?.thumbnail || getPlatformThumbnail(reel?.platform)}
                  alt={reel?.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <PlatformBadge platform={reel?.platform} size="sm" />
                </div>
              </div>

              <h3 className="font-semibold text-text-primary mb-1 text-sm leading-snug">
                {truncate(reel?.title || reel?.url, 60)}
              </h3>
              <p className="text-xs text-text-muted mb-5">{reel?.collection_name}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={reel?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink size={14} />
                  Watch Now
                </a>
                <button
                  onClick={reshuffle}
                  disabled={reels.length < 2}
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  <Shuffle size={14} />
                  Reshuffle
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
