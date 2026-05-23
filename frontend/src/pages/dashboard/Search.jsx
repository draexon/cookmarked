import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useToggleFavorite, useToggleMade } from '@/hooks/useReels'
import { useCollections } from '@/hooks/useCollections'
import ReelCard from '@/components/cards/ReelCard'
import CollectionCard from '@/components/cards/CollectionCard'
import { ReelCardSkeleton, CardSkeleton } from '@/components/loaders/Skeletons'
import { useNavigate } from 'react-router-dom'

const TRENDING = ['pasta recipes', 'morning workout', 'Tokyo travel', 'car reviews', 'guitar lesson']

export default function SearchPage() {
  const { query, setQuery, debouncedQuery, results, recentSearches, addRecentSearch, clearRecentSearches } = useSearch()
  const toggleFavorite = useToggleFavorite()
  const toggleMade = useToggleMade()
  const { data: collectionsData } = useCollections()
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const collections = collectionsData || []

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSearch = (term) => {
    setQuery(term)
    addRecentSearch(term)
  }

  const data = results.data
  const hasResults = data && (data.collections?.length > 0 || data.reels?.length > 0)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Search input */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && query) addRecentSearch(query) }}
            placeholder="Search reels, collections, categories..."
            className="input-field pl-12 pr-10 text-base py-4"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* No query — show suggestions */}
        {!debouncedQuery && (
          <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Recent */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-secondary flex items-center gap-1.5"><Clock size={13} /> Recent</span>
                  <button onClick={clearRecentSearches} className="text-xs text-text-muted hover:text-text-secondary transition-colors">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => handleSearch(s)} className="text-sm px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp size={13} className="text-accent-glow" />
                <span className="text-sm font-medium text-text-secondary">Trending</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button key={t} onClick={() => handleSearch(t)} className="text-sm px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">Browse Collections</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(collections.length > 0 ? collections : [{ id: 'other', name: 'Other', emoji: 'ðŸ“Œ' }]).map((collection) => (
                  <button key={collection.id} onClick={() => navigate(collection.id === 'other' ? '/collections' : `/collections/${collection.id}`)} className="p-3 rounded-xl border border-border bg-bg-surface hover:border-border-strong transition-all text-center">
                    <div className="text-2xl mb-1">{collection.emoji || 'ðŸ“Œ'}</div>
                    <div className="text-xs text-text-secondary truncate">{collection.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {debouncedQuery && results.isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <ReelCardSkeleton key={i} />)}</div>
          </motion.div>
        )}

        {/* Results */}
        {debouncedQuery && !results.isLoading && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {!hasResults ? (
              <div className="text-center py-16">
                <p className="text-text-secondary text-lg mb-1">No results for</p>
                <p className="font-display font-semibold text-2xl text-text-primary">"{debouncedQuery}"</p>
                <p className="text-text-muted text-sm mt-3">Try different keywords</p>
              </div>
            ) : (
              <>
                {data?.collections?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Collections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.collections.map((col, i) => <CollectionCard key={col.id} collection={col} index={i} />)}
                    </div>
                  </div>
                )}
                {data?.reels?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Reels</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {data.reels.map((reel, i) => (
                        <ReelCard
                          key={reel.id}
                          reel={reel}
                          index={i}
                          onFavorite={(id) => toggleFavorite.mutate(id)}
                          onToggleMade={(id) => toggleMade.mutate(id)}
                          favoritePending={toggleFavorite.isPending}
                          madePending={toggleMade.isPending}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
