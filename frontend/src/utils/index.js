import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PLATFORMS } from '@/constants'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function detectPlatform(url) {
  if (!url) return null
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      if (platform.domains.some(d => d.replace('www.', '') === hostname || hostname.includes(d.replace('www.', '')))) {
        return key
      }
    }
  } catch {
    return null
  }
  return null
}

export function formatCount(n) {
  if (!n) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function timeAgo(date) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function truncate(str, n = 60) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 3) + '…' : str
}

export function generateShareUrl(collectionId) {
  return `${window.location.origin}/share/${collectionId}`
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function getPlatformThumbnail(platform, url) {
  const placeholders = {
    instagram: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80',
    tiktok: 'https://images.unsplash.com/photo-1563306406-e66174fa3787?w=400&q=80',
    youtube: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
    facebook: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&q=80',
  }
  return placeholders[platform] || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80'
}
