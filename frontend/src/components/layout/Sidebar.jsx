import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookMarked, Heart, Search,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Bookmark, Bell
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/collections', icon: BookMarked, label: 'Collections' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/search', icon: Search, label: 'Search' },
]

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="h-full glass-strong flex flex-col border-r border-border overflow-hidden"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-border min-h-[65px]">
        <div className="w-8 h-8 rounded-xl bg-accent-primary flex-shrink-0 flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-sm font-display">C</span>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-lg text-text-primary whitespace-nowrap"
            >
              CookMarked
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={cn('sidebar-link', isActive && 'active')}>
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-border space-y-1">
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={cn('sidebar-link', isActive && 'active')}>
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
              </div>
            )}
          </NavLink>
        ))}

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-accent-soft border border-accent-border flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-accent-glow uppercase">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-text-primary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="sidebar-link w-full mt-2 border border-border"
        >
          <div className="flex-shrink-0">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </div>
          {sidebarOpen && <span className="text-xs text-text-muted whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
