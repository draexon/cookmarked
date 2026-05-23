import { Instagram, Youtube, Facebook } from 'lucide-react'
import { PLATFORMS } from '@/constants'
import { cn } from '@/utils'

// TikTok doesn't have a Lucide icon, so we inline SVG
function TikTokIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.78 1.52v-3.4a4.85 4.85 0 01-1.01-.12z"/>
    </svg>
  )
}

const PLATFORM_ICONS = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  youtube: Youtube,
  facebook: Facebook,
}

export default function PlatformBadge({ platform, size = 'sm', showLabel = false, className }) {
  const config = PLATFORMS[platform]
  if (!config) return null

  const Icon = PLATFORM_ICONS[platform]
  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-lg flex items-center justify-center flex-shrink-0',
          sizeClasses[size]
        )}
        style={{ background: config.color + '20', color: config.color }}
      >
        {Icon && <Icon size={size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 16 : 20} />}
      </div>
      {showLabel && (
        <span className="text-xs text-text-secondary font-medium">{config.label}</span>
      )}
    </div>
  )
}
