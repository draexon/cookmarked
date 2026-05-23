import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/collections': 'Collections',
  '/favorites': 'Favorites',
  '/search': 'Search',
  '/settings': 'Settings',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const setSaveModalOpen = useUIStore((s) => s.setSaveModalOpen)
  const user = useAuthStore((s) => s.user)
  const [notifBadge] = useState(2)

  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith('/collections/') ? 'Collection' : 'CookMarked')

  return (
    <header className="sticky top-0 z-20 glass border-b border-border px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Title */}
      <h1 className="font-display font-semibold text-lg text-text-primary hidden sm:block">{title}</h1>
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-display font-bold text-base text-text-primary">CookMarked</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <button
          onClick={() => navigate('/search')}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all" aria-label="Notifications">
          <Bell size={18} />
          {notifBadge > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full" />
          )}
        </button>

        {/* Save reel — desktop */}
        <button
          onClick={() => setSaveModalOpen(true)}
          className="hidden sm:flex items-center gap-2 btn-primary text-sm"
        >
          <Plus size={15} />
          Save Reel
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent-border flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-accent-glow uppercase">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
