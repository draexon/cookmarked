import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Globe, Share2, MoreVertical } from 'lucide-react'
import PlatformBadge from '@/components/ui/PlatformBadge'
import { CATEGORIES } from '@/constants'
import { timeAgo, truncate, getPlatformThumbnail } from '@/utils'

export default function CollectionCard({ collection, index = 0, onShare }) {
  const navigate = useNavigate()
  const category = CATEGORIES.find((c) => c.id === collection?.category)
  const platforms = collection?.platforms || []
  const coverImage = collection?.cover_image || getPlatformThumbnail(platforms[0])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => navigate(`/collections/${collection.id}`)}
      className="group glass rounded-2xl overflow-hidden border border-border card-hover cursor-pointer"
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden bg-bg-overlay">
        <img
          src={coverImage}
          alt={collection?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {collection?.is_public && (
            <div className="flex items-center gap-1 text-xs bg-white/10 backdrop-blur-sm border border-white/15 text-white px-2 py-0.5 rounded-full">
              <Globe size={10} />
              <span>Public</span>
            </div>
          )}
        </div>

        {/* Category */}
        {category && (
          <div
            className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: category.color + '30', color: category.color, border: `1px solid ${category.color}40` }}
          >
            {category.emoji}
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <h3 className="font-display font-semibold text-white text-base leading-tight">
            {truncate(collection?.name, 30)}
          </h3>
          <span className="text-white/70 text-xs flex items-center gap-1">
            <BookMarked size={11} />
            {collection?.reel_count || 0}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Platforms */}
        <div className="flex gap-1">
          {platforms.slice(0, 3).map((p) => (
            <PlatformBadge key={p} platform={p} size="xs" />
          ))}
          {platforms.length > 3 && (
            <div className="w-5 h-5 rounded-lg bg-bg-overlay text-text-muted text-[10px] flex items-center justify-center">
              +{platforms.length - 3}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{timeAgo(collection?.updated_at || Date.now())}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onShare?.(collection) }}
            className="p-1 rounded-lg text-text-muted hover:text-accent-glow hover:bg-accent-soft transition-all opacity-0 group-hover:opacity-100"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
