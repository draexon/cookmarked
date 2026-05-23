import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Heart, Trash2, Copy, MoreVertical } from 'lucide-react'
import PlatformBadge from '@/components/ui/PlatformBadge'
import { CATEGORIES } from '@/constants'
import { timeAgo, truncate, getPlatformThumbnail } from '@/utils'
import { cn } from '@/utils'

export default function ReelCard({ reel, onDelete, onFavorite, index = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const category = CATEGORIES.find((c) => c.id === reel?.category)
  const thumbnail = !imgError && reel?.thumbnail
    ? reel.thumbnail
    : getPlatformThumbnail(reel?.platform)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reel.url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className="group glass rounded-2xl overflow-hidden border border-border card-hover relative"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-overlay">
        <img
          src={thumbnail}
          alt={reel?.title || 'Reel'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <a
            href={reel?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Platform badge */}
        <div className="absolute top-2.5 left-2.5">
          <PlatformBadge platform={reel?.platform} size="sm" />
        </div>

        {/* Category */}
        {category && (
          <div
            className="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: category.color + '25', color: category.color, border: `1px solid ${category.color}40` }}
          >
            {category.emoji} {category.label}
          </div>
        )}

        {/* Favorite indicator */}
        {reel?.is_favorite && (
          <div className="absolute bottom-2.5 right-2.5">
            <Heart size={14} className="text-red-400 fill-red-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-sm font-medium text-text-primary leading-snug mb-1">
          {truncate(reel?.title || reel?.url, 50)}
        </p>
        <p className="text-xs text-text-muted">{timeAgo(reel?.created_at || Date.now())}</p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            <button
              onClick={() => onFavorite?.(reel.id)}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                reel?.is_favorite
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'
              )}
              aria-label="Toggle favorite"
            >
              <Heart size={13} className={reel?.is_favorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-all"
              aria-label="Copy link"
            >
              <Copy size={13} />
            </button>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete?.(reel.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Delete reel"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
