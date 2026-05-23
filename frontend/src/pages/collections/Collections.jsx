import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, Plus, Search } from 'lucide-react'
import { useCollections } from '@/hooks/useCollections'
import { useUIStore } from '@/store/uiStore'
import CollectionCard from '@/components/cards/CollectionCard'
import PlatformFilter from '@/components/ui/PlatformFilter'
import { CardSkeleton } from '@/components/loaders/Skeletons'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ShareModal from '@/components/modals/ShareModal'
import { SORT_OPTIONS } from '@/constants'
import { BookMarked } from 'lucide-react'

export default function Collections() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [shareTarget, setShareTarget] = useState(null)
  const { viewMode, setViewMode, setSaveModalOpen } = useUIStore()
  const { data, isLoading, error, refetch } = useCollections()

  const collections = data || []

  const filtered = collections.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-text-primary">Collections</h1>
          <p className="text-sm text-text-muted mt-0.5">{filtered.length} collection{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setSaveModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
          <Plus size={15} /> New Collection
        </button>
      </motion.div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="input-field pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 justify-between">
          <PlatformFilter />
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-bg-elevated border border-border text-text-secondary rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-border-strong transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex border border-border rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent-soft text-accent-glow' : 'text-text-muted hover:text-text-secondary'}`}>
                <Grid3X3 size={15} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent-soft text-accent-glow' : 'text-text-muted hover:text-text-secondary'}`}>
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={searchQuery ? 'No collections match your search' : 'No collections yet'}
          description={searchQuery ? 'Try a different search term.' : 'Save your first reel and let AI organize it into a collection.'}
          action={!searchQuery && (
            <button onClick={() => setSaveModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} /> Save a Reel
            </button>
          )}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filtered.map((col, i) => (
            <CollectionCard key={col.id} collection={col} index={i} onShare={setShareTarget} />
          ))}
        </div>
      )}

      {shareTarget && (
        <ShareModal collection={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </div>
  )
}
