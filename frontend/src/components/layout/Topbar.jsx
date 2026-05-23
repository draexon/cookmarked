import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Plus, Heart, BookMarked } from 'lucide-react'
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Favorites are ready', body: 'Your hearted reels are saved in Favorites.', icon: Heart, to: '/favorites' },
    { id: 2, title: 'Collections updated', body: 'New saved reels are grouped by category.', icon: BookMarked, to: '/collections' },
  ])
  const notificationsRef = useRef(null)
  const notifBadge = notifications.length

  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith('/collections/') ? 'Collection' : 'CookMarked')

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const openNotification = (notification) => {
    setNotifications((items) => items.filter((item) => item.id !== notification.id))
    setNotificationsOpen(false)
    navigate(notification.to)
  }

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
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            {notifBadge > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full" />
            )}
          </button>

          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-bg-surface shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
                {notifBadge > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="py-1">
                  {notifications.map((notification) => {
                    const Icon = notification.icon
                    return (
                      <button
                        key={notification.id}
                        onClick={() => openNotification(notification)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-overlay transition-colors"
                      >
                        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent-glow">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-text-primary">{notification.title}</span>
                          <span className="block text-xs text-text-muted mt-0.5">{notification.body}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text-secondary">No notifications</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

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
