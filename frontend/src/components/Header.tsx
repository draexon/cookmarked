import { Bell } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onProfileClick: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
  showGreeting?: boolean;
}

export default function Header({ 
  user, 
  onProfileClick, 
  onNotificationsClick, 
  unreadCount = 0, 
  showGreeting = true 
}: HeaderProps) {
  return (
    <header className="sticky top-0 bg-app-bg/85 backdrop-blur-md z-30 px-5 md:px-8 lg:px-10 py-3 lg:py-5 border-b border-brand-outline-variant/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Profile Avatar Badge */}
        <button
          onClick={onProfileClick}
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-orange shadow-sm hover:scale-105 hover:ring-2 hover:ring-primary-orange/30 hover:ring-offset-2 active:scale-95 transition-all duration-200 ease-in-out cursor-pointer focus:outline-none"
        >
          {user ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-primary-container flex items-center justify-center text-primary font-bold">
              M
            </div>
          )}
        </button>

        <div>
          {showGreeting && (
            <p className="text-[11px] font-medium text-on-surface-muted/60 uppercase tracking-widest leading-none mb-1">
              Good morning
            </p>
          )}
          <h1 className="font-display font-extrabold text-xl text-primary tracking-tight leading-none cursor-pointer" onClick={onProfileClick}>
            CookMarked
          </h1>
        </div>
      </div>

      {/* Styled Notification Bell with Live Bubble */}
      <div className="relative">
        <button
          className="text-on-surface-muted hover:text-primary transition-all duration-200 ease-in-out p-2 rounded-full hover:bg-surface-low active:scale-95 focus:outline-none cursor-pointer"
          onClick={onNotificationsClick}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary-orange rounded-full border border-white flex items-center justify-center text-[9px] font-extrabold text-white leading-none">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
