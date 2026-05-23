export const TOKEN_KEY = 'cookmarked_token'
export const REFRESH_TOKEN_KEY = 'cookmarked_refresh_token'
export const USER_KEY = 'cookmarked_user'
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const CATEGORIES = [
  { id: 'food',      label: 'Food',      emoji: '🍳', color: '#f97316' },
  { id: 'fitness',   label: 'Fitness',   emoji: '💪', color: '#22c55e' },
  { id: 'travel',    label: 'Travel',    emoji: '✈️',  color: '#3b82f6' },
  { id: 'fashion',   label: 'Fashion',   emoji: '👗', color: '#ec4899' },
  { id: 'tech',      label: 'Tech',      emoji: '💻', color: '#8b5cf6' },
  { id: 'music',     label: 'Music',     emoji: '🎵', color: '#f59e0b' },
  { id: 'comedy',    label: 'Comedy',    emoji: '😂', color: '#ef4444' },
  { id: 'diy',       label: 'DIY',       emoji: '🔨', color: '#84cc16' },
  { id: 'beauty',    label: 'Beauty',    emoji: '💄', color: '#f472b6' },
  { id: 'education', label: 'Education', emoji: '📚', color: '#06b6d4' },
  { id: 'gaming',    label: 'Gaming',    emoji: '🎮', color: '#a855f7' },
  { id: 'other',     label: 'Other',     emoji: '📌', color: '#6b7280' },
]

export const PLATFORMS = {
  instagram: { id: 'instagram', label: 'Instagram', color: '#e1306c', domains: ['instagram.com'] },
  tiktok:    { id: 'tiktok',    label: 'TikTok',    color: '#69c9d0', domains: ['tiktok.com', 'vm.tiktok.com'] },
  youtube:   { id: 'youtube',   label: 'YouTube',   color: '#ff0000', domains: ['youtube.com', 'youtu.be'] },
  facebook:  { id: 'facebook',  label: 'Facebook',  color: '#1877f2', domains: ['facebook.com', 'fb.watch'] },
}

export const SORT_OPTIONS = [
  { value: 'recent',    label: 'Most Recent' },
  { value: 'oldest',    label: 'Oldest First' },
  { value: 'name',      label: 'Name A–Z' },
  { value: 'favorites', label: 'Favorites First' },
]
