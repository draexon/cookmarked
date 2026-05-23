import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookMarked, Heart, Search, Settings } from 'lucide-react'
import { cn } from '@/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/collections', icon: BookMarked, label: 'Collections' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="glass-strong border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="flex-1">
            {({ isActive }) => (
              <div className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-accent-glow'
                  : 'text-text-muted'
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-accent-primary mt-0.5" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
