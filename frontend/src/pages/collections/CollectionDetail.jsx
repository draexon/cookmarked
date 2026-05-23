import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shuffle, Share2, Grid3X3, List, Plus, BookMarked } from 'lucide-react'
import { useCollection } from '@/hooks/useCollections'
import { useDeleteReel, useToggleFavorite, useToggleMade } from '@/hooks/useReels'
import { useUIStore } from '@/store/uiStore'
import ReelCard from '@/components/cards/ReelCard'
import PlatformBadge from '@/components/ui/PlatformBadge'
import PlatformFilter from '@/components/ui/PlatformFilter'
import { ReelCardSkeleton } from '@/components/loaders/Skeletons'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ShareModal from '@/components/modals/ShareModal'
import { CATEGORIES } from '@/constants'
import { detectPlatform, getRandomItem } from '@/utils'

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid')
  const [shareOpen, setShareOpen] = useState(false)
  const { activeFilters, setRandomReelModal, setSaveModalOpen } = useUIStore()

  const { data, isLoading, error, refetch } = useCollection(id)
  const deleteReel = useDeleteReel(id)
  const toggleFavorite = useToggleFavorite()
  const toggleMade = useToggleMade()

  const collection = data || null
  const reels = collection?.reels || []
  const selectedPlatform = activeFilters.platforms[0] || ''
  const visibleReels = selectedPlatform
    ? reels.filter((reel) => (reel.platform || detectPlatform(reel.url)) === selectedPlatform)
    : reels
  const category = CATEGORIES.find((c) => c.id === collection?.category)

  const handleRandomReel = () => {
    if (!visibleReels.length) return
    const scopedReels = visibleReels.map((reel) => ({ ...reel, collection_name: collection.name }))
    const reel = getRandomItem(scopedReels)
    setRandomReelModal({ open: true, reel, reels: scopedReels })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 sm:h-56 rounded-3xl bg-bg-elevated animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <ReelCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  if (!collection) return (
    <EmptyState icon={BookMarked} title="Collection not found" description="This collection doesn't exist or you don't have access." />
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="relative rounded-3xl overflow-hidden h-40 sm:h-56">
          <img
            src={collection.cover_image || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80'}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                {category && (
                  <span className="text-xs mb-1.5 inline-block" style={{ color: category.color }}>
                    {category.emoji} {category.label}
                  </span>
                )}
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">{collection.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/60 text-sm">{reels.length} reels</span>
                  <div className="flex gap-1.5">
                    {collection.platforms?.map((p) => <PlatformBadge key={p} platform={p} size="xs" />)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleRandomReel} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white hover:bg-white/20 transition-all" title="Pick random reel">
                  <Shuffle size={16} />
                </button>
                <button onClick={() => setShareOpen(true)} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white hover:bg-white/20 transition-all" title="Share collection">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="space-y-3">
        <PlatformFilter />
        <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {visibleReels.length} {selectedPlatform ? `${selectedPlatform} ` : ''}reels
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setSaveModalOpen(true)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-glow transition-colors">
            <Plus size={14} /> Add
          </button>
          <div className="flex border border-border rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent-soft text-accent-glow' : 'text-text-muted'}`}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent-soft text-accent-glow' : 'text-text-muted'}`}>
              <List size={14} />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Reels */}
      {visibleReels.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={selectedPlatform ? `No ${selectedPlatform} reels yet` : 'No reels yet'}
          description={selectedPlatform ? 'Choose another platform or save a matching reel.' : 'Start saving reels to this collection.'}
          action={<button onClick={() => setSaveModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} /> Save a Reel</button>}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-3'}>
          {visibleReels.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              index={i}
              onDelete={(rid) => deleteReel.mutate(rid)}
              onFavorite={(rid) => toggleFavorite.mutate(rid)}
              onToggleMade={(rid) => toggleMade.mutate(rid)}
              favoritePending={toggleFavorite.isPending}
              madePending={toggleMade.isPending}
            />
          ))}
        </div>
      )}

      {shareOpen && <ShareModal collection={collection} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
