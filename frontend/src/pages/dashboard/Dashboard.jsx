import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, BookMarked, Heart, Shuffle, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useCollections } from '@/hooks/useCollections'
import { useFavorites, useRandomReel } from '@/hooks/useReels'
import { useStats } from '@/hooks/useUser'
import CollectionCard from '@/components/cards/CollectionCard'
import ReelCard from '@/components/cards/ReelCard'
import { CardSkeleton, StatCardSkeleton } from '@/components/loaders/Skeletons'
import { CATEGORIES } from '@/constants'
import { formatCount } from '@/utils'

const STAT_CONFIGS = [
  { key: 'total_reels',       label: 'Total Saved',   sub: 'reels',       icon: BookMarked, color: '#7c6dff' },
  { key: 'total_collections', label: 'Collections',   sub: 'collections', icon: BookMarked, color: '#5b8eff' },
  { key: 'total_favorites',   label: 'Favorites',     sub: 'favorited',   icon: Heart,      color: '#f472b6' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { setSaveModalOpen, setRandomReelModal } = useUIStore()
  const navigate = useNavigate()

  const { data: collectionsData, isLoading: collectionsLoading } = useCollections({ limit: 6 })
  const { data: favoritesData, isLoading: favLoading } = useFavorites()
  const { data: statsData, isLoading: statsLoading } = useStats()
  const randomReel = useRandomReel()

  const collections = collectionsData || []
  const favorites = favoritesData || []
  const stats = statsData || null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const name = user?.name?.split(' ')[0] || 'there'

  const handleRandomReel = async () => {
    try {
      const reel = await randomReel.mutateAsync()
      setRandomReelModal({ open: true, reel, reels: [] })
    } catch {
      setRandomReelModal({ open: false, reel: null, reels: [] })
    }
  }

  const handleCategoryRandom = async (category) => {
    try {
      const reel = await randomReel.mutateAsync({ category })
      setRandomReelModal({ open: true, reel, reels: [] })
    } catch {
      navigate('/collections')
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Hero greeting */}
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-bg-surface border border-border p-6 sm:p-8">
        <div className="absolute inset-0 bg-mesh-1 opacity-70 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-text-secondary text-sm mb-1">{greeting} 👋</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-3">{name}</h1>
          <p className="text-text-muted text-sm mb-6 max-w-md">Your AI-powered reel library. Save once, find everything.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setSaveModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Save a Reel
            </button>
            <button onClick={handleRandomReel} disabled={randomReel.isPending || stats?.total_reels === 0} className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50">
              <Shuffle size={15} /> Random Pick
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats — real API data */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CONFIGS.map((cfg, i) => (
            <motion.div
              key={cfg.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl border border-border p-5 relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10" style={{ background: cfg.color }} />
              <p className="text-xs text-text-muted mb-2">{cfg.label}</p>
              {statsLoading ? (
                <div className="h-9 w-16 bg-bg-elevated rounded animate-pulse mb-0.5" />
              ) : (
                <p className="font-display font-bold text-3xl text-text-primary mb-0.5">
                  {stats ? formatCount(stats[cfg.key]) : '—'}
                </p>
              )}
              <p className="text-xs text-text-muted">{cfg.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-accent-glow" />
          <h2 className="font-display font-semibold text-text-primary">Categories</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleCategoryRandom(cat.label)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-bg-surface hover:border-border-strong transition-all text-sm"
              title={`Random ${cat.label} reel`}
            >
              <span>{cat.emoji}</span>
              <span className="text-text-secondary">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Collections */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-text-primary">Recent Collections</h2>
          <button onClick={() => navigate('/collections')} className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-glow transition-colors">
            View all <ChevronRight size={13} />
          </button>
        </div>
        {collectionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.slice(0, 6).map((col, i) => (
              <CollectionCard key={col.id} collection={col} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm text-center py-8">No collections yet — save your first reel!</p>
        )}
      </motion.div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary">Favorites</h2>
            <button onClick={() => navigate('/favorites')} className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-glow transition-colors">
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {favorites.slice(0, 4).map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
