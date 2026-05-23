import { motion } from 'framer-motion'
import { Heart, Shuffle } from 'lucide-react'
import { useFavorites, useToggleFavorite } from '@/hooks/useReels'
import { useUIStore } from '@/store/uiStore'
import ReelCard from '@/components/cards/ReelCard'
import { ReelCardSkeleton } from '@/components/loaders/Skeletons'
import EmptyState from '@/components/ui/EmptyState'
import { getRandomItem } from '@/utils'

export default function Favorites() {
  const { data, isLoading } = useFavorites()
  const toggleFavorite = useToggleFavorite()
  const { setRandomReelModal } = useUIStore()

  const reels = data || []

  const handleRandom = () => {
    if (!reels.length) return
    setRandomReelModal({ open: true, reel: getRandomItem(reels), reels })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary flex items-center gap-2">
            <Heart size={20} className="text-red-400" /> Favorites
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{reels.length} saved reels</p>
        </div>
        {reels.length > 0 && (
          <button onClick={handleRandom} className="btn-ghost flex items-center gap-2 text-sm">
            <Shuffle size={14} /> Random
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <ReelCardSkeleton key={i} />)}
        </div>
      ) : reels.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Heart any reel to save it here." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {reels.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              index={i}
              onFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
