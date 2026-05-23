import { motion } from 'framer-motion'
import { Instagram, Youtube, Facebook } from 'lucide-react'
import { PLATFORMS } from '@/constants'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils'

function TikTokIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.78 1.52v-3.4a4.85 4.85 0 01-1.01-.12z"/>
    </svg>
  )
}

const ICONS = { instagram: Instagram, tiktok: TikTokIcon, youtube: Youtube, facebook: Facebook }

export default function PlatformFilter({ className }) {
  const { activeFilters, setFilter } = useUIStore()
  const activePlatforms = activeFilters.platforms

  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {Object.values(PLATFORMS).map((platform) => {
        const isActive = activePlatforms.includes(platform.id)
        const Icon = ICONS[platform.id]

        return (
          <motion.button
            key={platform.id}
            onClick={() => setFilter('platforms', platform.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border',
              isActive
                ? 'border-current'
                : 'border-border text-text-muted hover:border-border-strong hover:text-text-secondary'
            )}
            style={isActive ? {
              color: platform.color,
              background: platform.color + '15',
              borderColor: platform.color + '40',
            } : {}}
          >
            <Icon size={13} />
            {platform.label}
          </motion.button>
        )
      })}
    </div>
  )
}
