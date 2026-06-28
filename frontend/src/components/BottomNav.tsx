import { Home, FolderHeart, Heart, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'feed' | 'collections' | 'favorites' | 'profile' | 'notifications';
  setActiveTab: (tab: 'feed' | 'collections' | 'favorites' | 'profile' | 'notifications') => void;
  onAddClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onAddClick }: BottomNavProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'collections', label: 'Collections', icon: FolderHeart },
    { id: 'spacer', label: '', icon: null }, // Central slot for FAB
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-brand-outline-variant/30 py-2 pb-5 px-4 z-40 shadow-[0_-4px_16px_rgba(28,27,27,0.03)] selection:bg-transparent md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {tabs.map((tab) => {
          if (tab.id === 'spacer') {
            return (
              <div key="fab-spacer" className="w-16 h-12 flex items-center justify-center relative">
                {/* Elevated FAB with brand glow animation */}
                <button
                  id="fab-add-button"
                  onClick={onAddClick}
                  aria-label="Save a Reel"
                  className="absolute -top-6 bg-gradient-to-br from-primary-orange to-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(249,115,22,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out group border-2 border-white focus:outline-none"
                >
                  <Plus className="w-8 h-8 group-hover:rotate-45 transition-transform duration-300 ease-in-out" />
                </button>
              </div>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex flex-col items-center justify-center w-14 py-1 relative focus:outline-none cursor-pointer group"
            >
              <div className={`transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-on-surface-muted/60 group-hover:text-on-surface-muted group-hover:scale-110'}`}>
                {Icon && <Icon className="w-5 h-5 stroke-[2.2]" />}
              </div>
              
              <span className={`text-[10px] uppercase tracking-wider font-display font-semibold mt-1 transition-all duration-150 ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-muted/40 group-hover:text-on-surface-muted/60'
              }`}>
                {tab.label}
              </span>

              {/* Polished interactive dot indicator */}
              {isActive && (
                <span className="absolute bottom-[-4px] w-1.5 h-1.5 bg-primary rounded-full animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
