import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, BookMarked, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { collectionService } from '@/services/collectionService'
import ReelCard from '@/components/cards/ReelCard'
import PlatformBadge from '@/components/ui/PlatformBadge'
import { ReelCardSkeleton } from '@/components/loaders/Skeletons'
import { CATEGORIES } from '@/constants'

const MOCK_SHARED = {
  id: 'shared1',
  name: 'Morning Workout',
  reel_count: 12,
  platforms: ['instagram', 'tiktok', 'youtube'],
  category: 'fitness',
  cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  owner: { name: 'Alex Johnson', avatar: null },
  reels: [
    { id: '1', title: '10-min morning stretch', url: 'https://instagram.com/reel/1', platform: 'instagram', category: 'fitness', created_at: new Date().toISOString(), thumbnail: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80' },
    { id: '2', title: 'Full body HIIT workout', url: 'https://tiktok.com/@user/video/1', platform: 'tiktok', category: 'fitness', created_at: new Date().toISOString(), thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { id: '3', title: 'No-equipment chest workout', url: 'https://youtube.com/watch?v=1', platform: 'youtube', category: 'fitness', created_at: new Date().toISOString(), thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80' },
  ],
}

export default function SharedCollection() {
  const { token } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => collectionService.getShared(token),
    retry: false,
  })

  const collection = data || MOCK_SHARED
  const category = CATEGORIES.find(c => c.id === collection?.category)

  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-1 pointer-events-none opacity-50" />

      {/* Top bar */}
      <header className="relative z-10 glass border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-display font-bold text-base text-text-primary">CookMarked</span>
        </div>
        <Link to="/register" className="btn-primary text-xs px-4 py-2">
          Get Started Free
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 rounded-3xl bg-bg-surface border border-border animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[...Array(6)].map((_, i) => <ReelCardSkeleton key={i} />)}</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-text-primary font-semibold mb-2">Collection not found</p>
            <p className="text-text-muted text-sm">This collection may have been made private or deleted.</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden h-48 sm:h-64 mb-6">
              <img src={collection.cover_image} alt={collection.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-sm border border-white/15 text-white px-2.5 py-1 rounded-full">
                  <Globe size={10} /> Public Collection
                </div>
              </div>
              <div className="absolute bottom-0 left-0 p-5 sm:p-6">
                {category && <span className="text-xs block mb-1" style={{ color: category.color }}>{category.emoji} {category.label}</span>}
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">{collection.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-white/60 text-sm">by {collection.owner?.name}</p>
                  <span className="text-white/40">·</span>
                  <span className="text-white/60 text-sm flex items-center gap-1"><BookMarked size={11} />{collection.reels?.length} reels</span>
                  <div className="flex gap-1">
                    {collection.platforms?.map(p => <PlatformBadge key={p} platform={p} size="xs" />)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collection.reels?.map((reel, i) => (
                <ReelCard key={reel.id} reel={reel} index={i} />
              ))}
            </div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 text-center">
              <div className="glass rounded-2xl border border-border p-6 inline-block">
                <p className="font-display font-semibold text-text-primary mb-1">Love this collection?</p>
                <p className="text-sm text-text-muted mb-4">Create your own AI-powered reel library for free.</p>
                <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-sm">
                  Start Bookmarking Free <ExternalLink size={13} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}
