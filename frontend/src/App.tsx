import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Plus, Sparkles, Flame, Search, Play, ArrowRight, Share2, 
  Settings, Key, Smartphone, ToggleLeft, ToggleRight, LogOut, Heart, 
  MapPin, Clock, Tag, PlusCircle, Check, Eye, EyeOff, Bell, Pencil,
  ArrowLeft,
  Home, FolderHeart, User, Trash2, MoreVertical
} from 'lucide-react';

import { Reel, Collection, UserProfile, CookMarkedNotification } from './types';
import { 
  INITIAL_PLATFORMS, 
  INITIAL_NOTIFICATION_SETTINGS, 
  INITIAL_NOTIFICATIONS
} from './data';
import {
  createCollection,
  getLibrary,
  getProfile,
  getRandomReel,
  toggleReelFavorite,
  updateCollection,
  deleteReel,
} from './api/reelService';

import { useAuth, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SaveReelModal from './components/SaveReelModal';
import ShareCollectionModal from './components/ShareCollectionModal';

type AppTab = 'feed' | 'collections' | 'favorites' | 'profile' | 'notifications';

function DesktopSidebar({
  activeTab,
  setActiveTab,
  onAddClick,
  unreadCount,
  searchCollectionQuery,
  setSearchCollectionQuery,
}: {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onAddClick: () => void;
  unreadCount: number;
  searchCollectionQuery: string;
  setSearchCollectionQuery: (query: string) => void;
}) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'collections', label: 'Collections', icon: FolderHeart },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ] as const;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-64 bg-white/90 backdrop-blur-md border-r border-brand-outline-variant/20 px-4 py-6 flex-col selection:bg-transparent">
      <button
        onClick={() => setActiveTab('feed')}
        className="text-left px-3 pb-6 focus:outline-none cursor-pointer"
      >
        <h1 className="font-display font-extrabold text-2xl text-primary tracking-tight leading-none">
          CookMarked
        </h1>
        <p className="mt-2 text-[11px] font-semibold text-on-surface-muted/50 leading-relaxed">
          Save reels from anywhere, about anything.
        </p>
      </button>

      <button
        onClick={onAddClick}
        className="mx-3 mb-6 py-3 px-4 bg-gradient-to-r from-primary-orange to-primary text-white font-display font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Save Reel</span>
      </button>

      {activeTab === 'collections' && (
        <div className="relative mx-3 mb-6">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-on-surface-muted/40" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchCollectionQuery}
            onChange={(e) => setSearchCollectionQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-outline-variant/15 rounded-xl text-xs.5 text-on-surface placeholder-on-surface-muted/35 focus:outline-none focus:ring-1.5 focus:ring-primary-orange focus:border-primary-orange/60 focus:scale-x-[1.01] transition-all duration-200 ease-in-out"
          />
        </div>
      )}

      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl font-display font-bold text-xs transition-all duration-200 ease-in-out cursor-pointer relative ${
                isActive
                  ? 'bg-orange-50/70 text-primary border border-primary-orange/20'
                  : 'text-on-surface-muted/60 hover:bg-surface-low hover:text-on-surface'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[2.2] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge > 0 && (
                <span className="ml-auto min-w-[18px] h-4 px-1 bg-primary-orange rounded-full flex items-center justify-center text-[9px] font-extrabold text-white leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function ExpandableCaption({
  text,
  className = '',
  buttonClassName = '',
}: {
  text: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > 90;

  return (
    <div>
      <p className={`${className} ${expanded ? '' : 'caption-clamp-2'}`}>
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          className={`${buttonClassName} mt-1 text-xs font-semibold transition-colors duration-200 ease-in-out cursor-pointer active:scale-95`}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  // Login Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AppTab>('feed');

  // Application State Datasets
  const [reels, setReels] = useState<Reel[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATION_SETTINGS);
  
  // Real-time notification lists
  const [appNotifications, setAppNotifications] = useState<CookMarkedNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'alert' | 'trend' | 'connection'>('all');

  // Collection selection in the home Explore shelf
  const [feedCollectionId, setFeedCollectionId] = useState<string>('all');
  // Search state in Collections tab
  const [searchCollectionQuery, setSearchCollectionQuery] = useState('');
  // Platform filter state in Collections tab
  const [collectionPlatformFilter, setCollectionPlatformFilter] = useState<string>('All Platforms');
  // Platform filter state in Favorites tab
  const [favoritesPlatformFilter, setFavoritesPlatformFilter] = useState<string>('All');

  // Selected collection for dedicated view page
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  // Collection Category Filter chip
  const [collectionCategoryFilter, setCollectionCategoryFilter] = useState<string>('All Reels');
  // Editable collection states
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState('');
  const [editColDesc, setEditColDesc] = useState('');

  // Modal display states
  const [showAddModal, setShowAddModal] = useState(false);
  const [saveTargetCollectionId, setSaveTargetCollectionId] = useState<string | null>(null);
  const [sharingCollection, setSharingCollection] = useState<Collection | null>(null);
  
  // Custom Create Collection State
  const [showCreateCollectionBox, setShowCreateCollectionBox] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  // Password Input states (Profile screen)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Highlight Overlay for "Random Pick" or "Active Reel Video Player"
  const [highlightedReel, setHighlightedReel] = useState<Reel | null>(null);

  // Delete Reel states
  const [reelToDelete, setReelToDelete] = useState<Reel | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showModalMenu, setShowModalMenu] = useState(false);

  const confirmDeleteReel = async () => {
    if (!reelToDelete) return;
    const targetId = reelToDelete.id;
    const isFav = reelToDelete.isFavorite;

    // Optimistic Update
    setReels((prev) => prev.filter((r) => r.id !== targetId));
    if (highlightedReel?.id === targetId) {
      setHighlightedReel(null);
    }
    // Update stats
    setCurrentUser((user) => user ? {
      ...user,
      totalReels: Math.max(0, user.totalReels - 1),
      totalFavorites: Math.max(0, user.totalFavorites - (isFav ? 1 : 0))
    } : user);

    setReelToDelete(null);

    try {
      await deleteReel(targetId);
      setToastMessage('Reel deleted ✅');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      void loadLibrary();
      setApiError(err instanceof Error ? err.message : 'Unable to delete reel.');
    }
  };

  const loadLibrary = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [profile, library] = await Promise.all([getProfile(), getLibrary()]);
      setCurrentUser(profile);
      setCollections(library.collections);
      setReels(library.reels);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to load your library.');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void loadLibrary();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
      setCurrentUser(null);
    }
  }, [isLoaded, isSignedIn]);

  // Handle Login complete
  const handleLoginSuccess = () => {
    setActiveTab('feed');
    void loadLibrary();
  };

  // Handle user logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCollections([]);
    setReels([]);
  };

  // Save a new reel dynamically
  const handleSaveReel = (_newReel: Reel) => {
    setShowAddModal(false);
    setSaveTargetCollectionId(null);
    void loadLibrary();
  };

  const openSaveModal = (collectionId: string | null = null) => {
    setSaveTargetCollectionId(collectionId);
    setShowAddModal(true);
  };

  // Toggle favorite state of a reel card
  const toggleFavorite = async (reelId: string) => {
    setApiError('');
    try {
      const updated = await toggleReelFavorite(reelId);
      setReels((prev) => prev.map((reel) => reel.id === reelId ? updated : reel));
      setHighlightedReel((reel) => reel?.id === reelId ? updated : reel);
      setCurrentUser((user) => user ? {
        ...user,
        totalFavorites: user.totalFavorites + (updated.isFavorite ? 1 : -1),
      } : user);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to update favorite.');
    }
  };

  const addCollection = async (input: { name: string; description?: string }) => {
    const newCol = await createCollection(input);
    setCollections((prev) => [...prev, newCol]);
    setCurrentUser((user) => user ? { ...user, totalCollections: user.totalCollections + 1 } : user);
    return newCol;
  };

  // Add new folder Collection dynamically
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      await addCollection({ name: newColName.trim(), description: newColDesc.trim() });
      setNewColName('');
      setNewColDesc('');
      setShowCreateCollectionBox(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to create collection.');
    }
  };

  // Pull random pick from saved catalog (Screen 7 widget trigger)
  const triggerRandomPick = async () => {
    setApiError('');
    try {
      setHighlightedReel(await getRandomReel());
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to choose a reel.');
    }
  };

  const handlePasswordUpdate = async () => {
    setApiError('');
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordAlert(true);
      setTimeout(() => setShowPasswordAlert(false), 3000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to update password.');
    }
  };

  const handleCollectionEdit = async () => {
    if (!editingCollectionId) return;
    setApiError('');
    try {
      const updated = await updateCollection(editingCollectionId, { name: editColName, description: editColDesc });
      setCollections((previous) => previous.map((collection) => collection.id === updated.id ? updated : collection));
      setEditingCollectionId(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to update collection.');
    }
  };

  // Check login presence helper
  if (!isLoaded || isLoading) {
    return <div className="min-h-screen bg-app-bg flex items-center justify-center text-primary font-semibold">Loading your library...</div>;
  }

  const unreadCount = appNotifications.filter(n => !n.isRead).length;
  const spotlightReel = highlightedReel
    ? reels.find((reel) => reel.id === highlightedReel.id) || highlightedReel
    : null;
  const spotlightCollectionReels = spotlightReel
    ? reels.filter((reel) => {
      if (spotlightReel.collectionId) return reel.collectionId === spotlightReel.collectionId;
      if (selectedCollectionId) return reel.collectionId === selectedCollectionId;
      return true;
    })
    : [];
  const spotlightIndex = spotlightReel
    ? spotlightCollectionReels.findIndex((reel) => reel.id === spotlightReel.id)
    : -1;
  const canNavigateSpotlight = spotlightCollectionReels.length > 1 && spotlightIndex >= 0;
  const navigateSpotlight = (direction: -1 | 1) => {
    if (!canNavigateSpotlight) return;
    const nextIndex = (spotlightIndex + direction + spotlightCollectionReels.length) % spotlightCollectionReels.length;
    setHighlightedReel(spotlightCollectionReels[nextIndex]);
  };
  const exploredReels = feedCollectionId === 'all'
    ? reels
    : reels.filter((reel) => reel.collectionId === feedCollectionId);

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-app-bg flex items-center justify-center py-12">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        {currentUser && (
          <div className="min-h-screen max-w-full overflow-x-hidden bg-[#FAFAF8] selection:bg-primary-orange/20 selection:text-primary pb-24 md:pb-0">
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => openSaveModal()}
        unreadCount={unreadCount}
        searchCollectionQuery={searchCollectionQuery}
        setSearchCollectionQuery={setSearchCollectionQuery}
      />
      
      {/* Container simulating a refined viewport card canvas */}
      <div className="bg-app-bg w-full max-w-full min-h-screen relative flex flex-col md:w-[calc(100%-16rem)] md:ml-64 shadow-none border-x-0">
        {apiError && (
          <div className="m-4 mb-0 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">
            {apiError}
          </div>
        )}
        
        {/* Dynamic Nav Tabs Rendering Content */}
        {activeTab === 'feed' && (
          <div className="flex-1 flex flex-col">
            <Header 
              user={currentUser} 
              onProfileClick={() => setActiveTab('profile')} 
              onNotificationsClick={() => setActiveTab('notifications')}
              unreadCount={unreadCount}
              showGreeting={true} 
            />

            {/* Scrollable scroll feed section */}
            <main className="p-5 md:p-8 lg:p-10 space-y-6 flex-1 overflow-y-auto no-scrollbar">
              
              {/* Premium Save Inspires Banner Header (Screen 7) */}
              <div className="relative bg-gradient-to-br from-primary-orange to-primary rounded-3xl p-6 text-white overflow-hidden shadow-[0_8px_30px_rgb(157,67,0,0.22)] select-none">
                {/* Visual sparkles */}
                <div className="absolute right-4 top-4 opacity-15">
                  <Sparkles className="w-16 h-16 text-white rotate-12" />
                </div>

                <h2 className="font-display font-black text-2xl leading-none tracking-tight text-white mb-2">
                  Save Reels From Anywhere
                </h2>
                <p className="text-white/85 text-[13px] font-sans font-medium leading-relaxed mb-5 pr-5">
                  Save reels from anywhere, about anything.
                </p>

                {/* Secondary controls nested inside card (Screen 7) */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => openSaveModal()}
                    className="flex-1 py-2.5 px-3 bg-white text-primary font-display font-extrabold text-xs.5 leading-none rounded-xl hover:bg-orange-50 active:scale-95 transition-all duration-200 ease-in-out shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4 stroke-[3.2]" />
                    <span>Save a Reel</span>
                  </button>

                  <button
                    onClick={triggerRandomPick}
                    className="flex-1 py-2.5 px-3 bg-white/20 hover:bg-white/28 border border-white/20 text-white font-display font-extrabold text-xs.5 leading-none rounded-xl active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Random Pick</span>
                  </button>
                </div>
              </div>

              {/* Layout Small Stats Counters Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  onClick={() => setActiveTab('favorites')}
                  className="bg-white py-4 px-2 rounded-2xl border border-brand-outline-variant/10 text-center shadow-sm hover:shadow-md hover:border-primary-orange/40 active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
                >
                  <p className="text-[10px] font-extrabold text-on-surface-muted/50 uppercase tracking-widest font-display mb-1">
                    Total Saved
                  </p>
                  <p className="text-2xl font-display font-black text-on-surface">
                    {reels.length}
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('collections')}
                  className="bg-white py-4 px-2 rounded-2xl border border-brand-outline-variant/10 text-center shadow-sm hover:shadow-md hover:border-primary-orange/40 active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
                >
                  <p className="text-[10px] font-extrabold text-on-surface-muted/50 uppercase tracking-widest font-display mb-1">
                    Collections
                  </p>
                  <p className="text-2xl font-display font-black text-on-surface">
                    {collections.length}
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('favorites')}
                  className="bg-white py-4 px-2 rounded-2xl border border-brand-outline-variant/10 text-center shadow-sm hover:shadow-md hover:border-primary-orange/40 active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
                >
                  <p className="text-[10px] font-extrabold text-on-surface-muted/50 uppercase tracking-widest font-display mb-1">
                    Favorites
                  </p>
                  <p className="text-2xl font-display font-black text-on-surface">
                    {reels.filter(r => r.isFavorite).length}
                  </p>
                </div>
              </div>

              {/* Home Explore is driven by the user's collections */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-extrabold text-lg text-on-surface tracking-tight">
                    Explore Collections
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCollectionId(null);
                      setShowCreateCollectionBox(true);
                      setActiveTab('collections');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-orange transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {[{ id: 'all', name: 'All Saved' }, ...collections].map((collection) => {
                    const isActive = feedCollectionId === collection.id;
                    return (
                      <button
                        key={collection.id}
                        onClick={() => setFeedCollectionId(collection.id)}
                        className={`px-4.5 py-2.5 rounded-full font-display font-extrabold text-xs select-none cursor-pointer transition-all border whitespace-nowrap active:scale-95 ${
                          isActive
                            ? 'bg-orange-50/70 border-primary-orange text-primary'
                            : 'bg-white border-brand-outline-variant/20 text-on-surface-muted hover:border-on-surface-muted/40'
                        }`}
                      >
                        {collection.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recently Saved Shelf (Screen 7 Horizontal Scroll) */}
              <div>
                <div className="flex items-center justify-between mb-3.5 select-none">
                  <h3 className="font-display font-extrabold text-lg text-on-surface tracking-tight leading-none">
                    Recently Saved
                  </h3>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="text-xs font-bold text-primary hover:text-primary-orange transition-colors flex items-center leading-none gap-0.5 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
                  {exploredReels
                    .map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => setHighlightedReel(reel)}
                        className="bg-white rounded-2xl border border-brand-outline-variant/10 shadow-md w-full overflow-hidden hover:scale-[1.03] hover:shadow-xl hover:border-primary-orange/40 transition-all duration-[250ms] ease-in-out group relative"
                      >
                        {/* Delete button float corner */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReelToDelete(reel);
                          }}
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                          className="absolute top-2.5 left-2.5 bg-white/95 text-red-600 p-1.5 rounded-full shadow-md z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Favorite button float corner */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(reel.id);
                          }}
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                          className="absolute top-2.5 right-2.5 bg-white/95 text-[#f97316] p-1.5 rounded-full shadow-md z-10 transition-transform duration-200 ease-in-out cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${reel.isFavorite ? 'fill-[#f97316]' : ''}`} />
                        </motion.button>

                        <div className="h-32 bg-surface-low relative overflow-hidden">
                          <img
                            src={reel.imageUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] ease-in-out pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-lg">
                              <Play className="w-5 h-5 fill-white translate-x-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-2.5 left-2.5 bg-primary/90 text-white font-display font-bold text-[8.5px] uppercase py-0.5 px-2 rounded-md tracking-wider">
                            {reel.platform}
                          </span>
                        </div>

                        <div className="p-3">
                          <p className="text-[10px] uppercase font-bold text-primary-orange tracking-wider flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {reel.category}
                          </p>
                          <h4 className="font-display font-bold text-xs.5 text-on-surface caption-clamp-2 mt-1">
                            {reel.title}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[9.5px] text-on-surface-muted/50 font-mono font-medium mt-2">
                            <Clock className="w-2.5 h-2.5" />
                            {reel.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  
                  {exploredReels.length === 0 && (
                    <div className="md:col-span-2 xl:col-span-3 w-full bg-white rounded-xl border border-brand-outline-variant/15 p-6 text-center text-xs text-on-surface-muted/50">
                      No saved items in this collection yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Collections section horizontal cards (Screen 7) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-extrabold text-lg text-on-surface tracking-tight leading-none">
                    Collections
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCollectionId(null);
                      setActiveTab('collections');
                    }}
                    className="text-xs font-bold text-primary hover:text-primary-orange transition-colors flex items-center leading-none gap-0.5 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {collections.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => {
                        setSelectedCollectionId(col.id);
                        setActiveTab('collections');
                      }}
                      className="relative h-24 rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-brand-outline-variant/10"
                    >
                      <img
                        src={col.imageUrl}
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4" />
                      
                      <div className="relative z-10 w-full flex items-center justify-between gap-3 text-white">
                        <div>
                          <h4 className="font-display font-extrabold text-sm tracking-tight">
                            {col.name}
                          </h4>
                          <p className="text-[10px] text-white/70 font-sans mt-0.5">
                            {col.itemCount} items • {col.platforms.join(', ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openSaveModal(col.id);
                          }}
                          className="shrink-0 px-3 h-8 rounded-lg bg-white text-primary text-[11px] font-bold inline-flex items-center gap-1 hover:bg-orange-50 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                  {collections.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCollectionBox(true);
                        setSelectedCollectionId(null);
                        setActiveTab('collections');
                      }}
                      className="w-full border-2 border-dashed border-brand-outline-variant/30 rounded-xl py-6 text-sm font-bold text-primary-orange cursor-pointer"
                    >
                      Create your first collection
                    </button>
                  )}
                </div>
              </div>

            </main>
          </div>
        )}

        {/* COLLECTIONS VIEW TABS (Screen 9) */}
        {activeTab === 'collections' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            {selectedCollectionId === null ? (
              <>
                <Header 
                  user={currentUser} 
                  onProfileClick={() => setActiveTab('profile')} 
                  onNotificationsClick={() => setActiveTab('notifications')}
                  unreadCount={appNotifications.filter(n => !n.isRead).length}
                  showGreeting={false} 
                />

                <main className="p-5 md:p-8 lg:p-10 space-y-5 flex-1 overflow-y-auto no-scrollbar">
                  
                  {/* Profile statistics and Title info */}
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-extrabold text-2xl text-on-surface tracking-tight">
                      My Collections
                    </h2>
                    
                    {/* Stats indicators */}
                    <div className="flex gap-1.5 select-none">
                      <span className="px-2.5 py-1 bg-white border border-brand-outline-variant/10 text-[10px] font-bold text-on-surface-muted rounded-full">
                        {collections.length} Collections
                      </span>
                      <span className="px-2.5 py-1 bg-[#ffdbca] text-[10px] font-bold text-primary rounded-full">
                        4 Public
                      </span>
                    </div>
                  </div>

                  {/* Dynamic search and platform filters shelf (Screen 9) */}
                  <div className="space-y-3">
                    <div className="relative lg:hidden">
                      <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-on-surface-muted/40" />
                      <input
                        type="text"
                        placeholder="Search collections..."
                        value={searchCollectionQuery}
                        onChange={(e) => setSearchCollectionQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-outline-variant/15 rounded-xl text-xs.5 text-on-surface placeholder-on-surface-muted/35 focus:outline-none focus:ring-1.5 focus:ring-primary-orange"
                      />
                    </div>

                    {/* Platforms selection filters */}
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                      {['All Platforms', 'Instagram', 'TikTok', 'YouTube', 'Netflix', 'Prime Video'].map((platform) => {
                        const isActive = collectionPlatformFilter === platform;
                        return (
                          <button
                            key={platform}
                            onClick={() => setCollectionPlatformFilter(platform)}
                            className={`px-3.5 py-1.5 rounded-full font-display font-semibold text-[11px] whitespace-nowrap active:scale-95 transition-all text-center select-none cursor-pointer border ${
                              isActive
                                ? 'bg-on-surface text-white border-on-surface'
                                : 'bg-white border-brand-outline-variant/15 text-on-surface-muted hover:border-on-surface/40'
                            }`}
                          >
                            {platform}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FEATURED COLLECTION CARD (Screen 9) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {collections.filter(c => c.isFeatured).map((featCol) => (
                    <div key={featCol.id} className="space-y-2.5">
                      <h3 className="block text-[10px] font-extrabold uppercase tracking-widest text-[#584237]/60 font-display">
                        Featured Collection
                      </h3>
                      
                      <div 
                        onClick={() => setSelectedCollectionId(featCol.id)}
                        className="bg-white rounded-2xl overflow-hidden border border-brand-outline-variant/10 shadow-md relative group cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:border-primary-orange/25 transition-all duration-300 ease-in-out"
                      >
                        <div className="h-44 bg-surface-low relative">
                          <img
                            src={featCol.imageUrl}
                            alt={featCol.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                          />
                          
                          {/* Floating share button (Screen 0) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingCollection(featCol);
                            }}
                            className="absolute right-4 top-4 bg-white/95 text-primary-orange p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ease-in-out cursor-pointer border-none"
                            title="Share Collection"
                          >
                            <Share2 className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {/* Item count badge (Screen 9) */}
                          <span className="absolute bottom-3 right-3 bg-white/95 text-on-surface rounded-full py-1 px-3 text-[10.5px] font-bold font-mono shadow-sm flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary-orange" />
                            {reels.filter(r => r.collectionId === featCol.id).length || featCol.itemCount}
                          </span>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <div className="space-y-0.5 pr-2">
                            <h4 className="font-display font-black text-base text-on-surface tracking-tight">
                              {featCol.name}
                            </h4>
                            <p className="text-xs text-on-surface-muted/70 font-sans leading-relaxed">
                              {featCol.description}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCollectionId(featCol.id);
                            }}
                            className="w-10 h-10 rounded-full bg-surface-low border border-brand-outline-variant/15 flex items-center justify-center text-on-surface-muted hover:bg-[#ffeddf] hover:text-primary-orange transition-all duration-200 ease-in-out active:scale-95 flex-shrink-0 cursor-pointer"
                          >
                            <ArrowRight className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>

                  {/* ALL COLLECTIONS GRID (Screen 9) */}
                  <div className="space-y-3">
                    <h3 className="block text-[10px] font-extrabold uppercase tracking-widest text-[#584237]/60 font-display">
                      All Collections
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {collections
                        .filter(c => !c.isFeatured)
                        .filter(c => {
                          if (collectionPlatformFilter === 'All Platforms') return true;
                          return c.platforms.includes(collectionPlatformFilter as any);
                        })
                        .filter(c => c.name.toLowerCase().includes(searchCollectionQuery.toLowerCase()))
                        .map((col) => (
                          <div
                            key={col.id}
                            onClick={() => setSelectedCollectionId(col.id)}
                            className="bg-white rounded-2xl overflow-hidden border border-brand-outline-variant/15 shadow-md p-2 flex flex-col cursor-pointer hover:scale-[1.03] hover:border-primary-orange/20 hover:shadow-xl transition-all duration-300 ease-in-out group"
                          >
                            <div className="h-28 bg-surface-low rounded-xl overflow-hidden relative group">
                              <img src={col.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" />
                              <span className="absolute top-2.5 right-2.5 bg-black/60 text-white rounded-md py-0.5 px-1.5 text-[9px] font-bold font-mono">
                                {reels.filter(r => r.collectionId === col.id).length || col.itemCount}
                              </span>
                            </div>
                            <div className="p-2 flex-1 flex flex-col justify-between">
                              <div className="pt-1">
                                <h4 className="font-display font-black text-xs.5 text-on-surface truncate">
                                  {col.name}
                                </h4>
                                <p className="text-[10.5px] text-on-surface-muted/65 font-sans truncate mt-0.5 leading-tight">
                                  {col.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* CREATE NEW COLLECTION TRIGGER DASHED BOX (Screen 9) */}
                      {showCreateCollectionBox ? (
                        <form 
                          onSubmit={handleCreateCollection}
                          className="bg-white rounded-2xl border-2 border-dashed border-primary-orange/35 p-4 space-y-3 text-left shadow-sm animate-fade-in"
                        >
                          <input
                            type="text"
                            required
                            placeholder="Collection Title"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            className="w-full p-2 bg-surface-low text-xs border border-brand-outline-variant/15 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-orange"
                          />
                          <input
                            type="text"
                            placeholder="Sub header / description"
                            value={newColDesc}
                            onChange={(e) => setNewColDesc(e.target.value)}
                            className="w-full p-2 bg-surface-low text-xs border border-brand-outline-variant/15 rounded-md focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer"
                            >
                              Create
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCreateCollectionBox(false)}
                              className="text-[10px] text-on-surface-muted/60 pl-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowCreateCollectionBox(true)}
                            className="bg-white/40 hover:bg-white rounded-2xl border-2 border-dashed border-brand-outline-variant/20 py-8 px-4 text-center flex flex-col items-center justify-center gap-2 group transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer active:scale-95 select-none"
                        >
                          <PlusCircle className="w-7 h-7 text-primary-orange group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-on-surface font-display tracking-tight leading-none mt-1">
                            New Collection
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                </main>
              </>
            ) : (() => {
              const currentCollection = collections.find(c => c.id === selectedCollectionId);
              if (!currentCollection) {
                setSelectedCollectionId(null);
                return null;
              }
              const collectionReels = reels.filter(r => r.collectionId === selectedCollectionId);
              
              // Categories of items inside this folder
              const categories = ['All Reels', ...Array.from(new Set(collectionReels.map(r => r.category).filter(Boolean)))];
              
              const displayedReels = collectionReels.filter(r => {
                if (collectionCategoryFilter === 'All Reels') return true;
                return r.category === collectionCategoryFilter;
              });

              // Featured elements for the collection detail view
              const mainReel = displayedReels[0];
              const otherReels = displayedReels.slice(1);

              return (
                <div className="flex-1 flex flex-col relative select-none bg-[#FAFAF8]">
                  {/* Dynamic collection header with edit / share tools */}
                  <header className="sticky top-0 bg-[#FAFAF8]/95 backdrop-blur-md z-30 px-5 py-3 border-b border-[#584237]/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedCollectionId(null);
                          setCollectionCategoryFilter('All Reels');
                        }}
                        className="w-9 h-9 rounded-full bg-white border border border-brand-outline-variant/15 flex items-center justify-center text-[#584237] hover:bg-orange-50 hover:border-primary-orange/20 active:scale-95 transition-all duration-200 ease-in-out text-sm font-black cursor-pointer shadow-sm"
                        aria-label="Back to broad list"
                      >
                        ←
                      </button>
                      <h1 className="font-display font-extrabold text-lg text-[#584237] tracking-tight leading-none">
                        {currentCollection.name}
                      </h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSharingCollection(currentCollection)}
                        className="text-on-surface-muted hover:text-primary transition-all duration-200 ease-in-out cursor-pointer p-2 rounded-full hover:bg-black/5 active:scale-95"
                        title="Share Collection"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCollectionId(currentCollection.id);
                          setEditColName(currentCollection.name);
                          setEditColDesc(currentCollection.description);
                        }}
                        className="text-on-surface-muted hover:text-primary transition-all duration-200 ease-in-out cursor-pointer p-2 rounded-full hover:bg-black/5 active:scale-95"
                        title="Edit Metadata"
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </header>

                  {/* Main scrolling viewport content */}
                  <main className="p-5 md:p-8 lg:p-10 space-y-5 flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8">
                    {/* Collection metadata cards panel description */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-orange-100/60 text-[#9E4300] text-[10.5px] font-extrabold rounded-full tracking-wide">
                          {collectionReels.length} Reels
                        </span>
                        <span className="text-[10.5px] text-[#584237]/50 font-semibold font-sans">
                          Updated yesterday
                        </span>
                      </div>
                      <p className="text-xs.5 text-[#584237]/80 leading-relaxed font-sans pr-4 font-medium">
                        {currentCollection.description}
                      </p>
                    </div>

                    {/* Filter Category Chips list */}
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 selection:bg-transparent">
                      {categories.map((cat) => {
                        const isSelected = collectionCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setCollectionCategoryFilter(cat)}
                            className={`px-4.5 py-1.5 text-[11px] font-display font-black uppercase tracking-wider rounded-xl border select-none transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-150 ${
                              isSelected
                                ? 'bg-[#934A2F] text-white border-[#934A2F] shadow-sm'
                                : 'bg-white text-on-surface-muted border-brand-outline-variant/15 hover:border-brand-outline-variant/30 hover:bg-surface-low'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Layout list of items inside collection */}
                    {displayedReels.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-brand-outline-variant/10 p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="w-14 h-14 bg-orange-50/50 rounded-full flex items-center justify-center text-primary-orange text-2xl animate-pulsing">
                          ✨
                        </div>
                        <div>
                          <h3 className="font-display font-black text-xs.5 text-[#584237]">
                            Empty Category Folder
                          </h3>
                          <p className="text-[10.5px] text-on-surface-muted/50 mt-1 max-w-[200px] leading-relaxed">
                            No reels saved in this category yet.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* HERO COMPONENT CARD */}
                        {mainReel && (
                          <div
                            onClick={() => setHighlightedReel(mainReel)}
                            className="bg-white rounded-2xl overflow-hidden border border-brand-outline-variant/10 shadow-sm relative group cursor-pointer"
                          >
                            <div className="h-56 bg-[#FAFAF8] relative overflow-hidden">
                              <img
                                src={mainReel.imageUrl}
                                alt={mainReel.title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                              
                              {/* Duration / Play overlay indicator */}
                              <div className="absolute left-3.5 top-3.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-[10.5px] font-bold font-mono flex items-center gap-1 shadow-sm">
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>0:45</span>
                              </div>

                              {/* Delete button float corner */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReelToDelete(mainReel);
                                }}
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                                className="absolute right-14 top-3.5 w-9 h-9 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer border-none z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 ease-in-out"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>

                              {/* Heart favorite absolute absolute icon */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(mainReel.id);
                                }}
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                                className="absolute right-3.5 top-3.5 w-9 h-9 bg-white text-primary-orange rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ease-in-out cursor-pointer border-none"
                              >
                                <Heart className={`w-4.5 h-4.5 ${mainReel.isFavorite ? 'fill-primary-orange text-primary-orange' : 'text-on-surface-muted/60'}`} />
                              </motion.button>
                            </div>

                            <div className="p-4 space-y-1.5 bg-white">
                              {/* Platform indicator */}
                              <div className="text-[11px] font-display font-black text-primary flex items-center gap-1 uppercase tracking-wider">
                                ✨ {mainReel.platform} • Creator
                              </div>
                              <ExpandableCaption
                                text={mainReel.title}
                                className="font-display font-black text-base text-[#584237] tracking-tight leading-snug"
                                buttonClassName="text-primary-orange hover:text-primary"
                              />
                              <div className="flex items-center gap-3 text-[11px] text-[#584237]/60 font-medium pt-0.5">
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <Clock className="w-3.5 h-3.5" />
                                  {mainReel.duration}
                                </span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-[#FFF7ED] text-primary-orange rounded-md text-[9px] font-extrabold font-display uppercase tracking-wider">
                                  Intermediate
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* OTHER SECONDARY TILES SYSTEM OF THE ADJOINED GRID */}
                        {otherReels.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
                            {otherReels.map((reel) => (
                              <div
                                key={reel.id}
                                onClick={() => setHighlightedReel(reel)}
                                className="bg-white rounded-2xl overflow-hidden border border-brand-outline-variant/10 shadow-md p-1.5 flex flex-col justify-between group cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:border-primary-orange/20 transition-all duration-[250ms] ease-in-out"
                              >
                                <div className="h-28 bg-[#FAFAF8] rounded-xl overflow-hidden relative">
                                  {/* Delete button float corner */}
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReelToDelete(reel);
                                    }}
                                    whileTap={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                                    className="absolute top-2 left-2 bg-white/95 text-red-600 p-1.5 rounded-full shadow-md z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-none"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </motion.button>

                                  <img
                                    src={reel.imageUrl}
                                    alt={reel.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] ease-in-out pointer-events-none">
                                    <div className="w-9 h-9 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-lg">
                                      <Play className="w-4.5 h-4.5 fill-white translate-x-0.5" />
                                    </div>
                                  </div>
                                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white rounded py-0.5 px-1.5 text-[8px] font-bold font-mono">
                                    {reel.duration}
                                  </span>
                                </div>
                                <div className="p-2 space-y-1">
                                  <h4 className="font-display font-black text-[11.5px] text-[#584237] leading-tight line-clamp-2">
                                    {reel.title}
                                  </h4>
                                  <p className="text-[9.5px] text-[#584237]/50 font-semibold font-sans">
                                    {reel.duration} • {reel.platform}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}

                  </main>

                  {/* Add action button positioned relative to page block to save a reel to this folder */}
                  <button
                    onClick={() => openSaveModal(currentCollection.id)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-[#934A2F] text-white rounded-full shadow-[0_8px_24px_rgba(147,74,47,0.35)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer z-40 border-none hover:bg-primary-orange group"
                    title={`Add reel directly to ${currentCollection.name}`}
                  >
                    <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-45 transition-transform duration-300 ease-in-out" />
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* FAVORITES VIEW TAB (Screen 2) */}
        {activeTab === 'favorites' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <Header 
              user={currentUser} 
              onProfileClick={() => setActiveTab('profile')} 
              onNotificationsClick={() => setActiveTab('notifications')}
              unreadCount={appNotifications.filter(n => !n.isRead).length}
              showGreeting={false} 
            />

            <main className="p-5 md:p-8 lg:p-10 space-y-5 flex-1 overflow-y-auto no-scrollbar">
              
              {/* Profile statistics and Title info */}
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-2xl text-on-surface tracking-tight">
                  Favorites
                </h2>
              </div>

              {/* Saturated Saved Reels Orange Header banner card (Screen 2) */}
              <div className="bg-gradient-to-r from-primary-orange to-primary rounded-2xl p-5 text-white flex items-center gap-3 shadow-[0_4px_16px_rgba(249,115,22,0.18)]">
                <Heart className="w-7 h-7 text-white fill-white animate-pulse" />
                <h3 className="font-display font-extrabold text-lg text-white tracking-tight">
                  {reels.filter(r => r.isFavorite).length} Saved Reels
                </h3>
              </div>

              {/* Social filters chips (All, Instagram, TikTok, YouTube, Pinterest) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['All', 'Instagram', 'TikTok', 'YouTube', 'Pinterest', 'Netflix', 'Prime Video'].map((platform) => {
                  const isActive = favoritesPlatformFilter === platform;
                  return (
                    <button
                      key={platform}
                      onClick={() => setFavoritesPlatformFilter(platform)}
                      className={`px-4.5 py-1.5 rounded-full font-display font-semibold text-xs leading-none select-none cursor-pointer border whitespace-nowrap active:scale-95 transition-all ${
                        isActive
                          ? 'bg-[#1c1b1b] text-white border-on-surface-dark'
                          : 'bg-white border-brand-outline-variant/15 text-on-surface-muted hover:border-on-surface-muted/40'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Responsive Card Grid (Screen 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reels
                  .filter(reel => reel.isFavorite)
                  .filter(reel => {
                    if (favoritesPlatformFilter === 'All') return true;
                    return reel.platform === favoritesPlatformFilter;
                  })
                  .map((reel) => (
                    <div
                      key={reel.id}
                      onClick={() => setHighlightedReel(reel)}
                      className="bg-white rounded-2xl border border-brand-outline-variant/10 shadow-md overflow-hidden flex flex-col hover:scale-[1.03] hover:shadow-xl hover:border-primary-orange/40 transition-all duration-[250ms] ease-in-out group relative"
                    >
                      {/* Delete button float corner */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReelToDelete(reel);
                        }}
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                        className="absolute top-2.5 left-2.5 bg-white/95 text-red-600 p-1.5 rounded-full shadow-md z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>

                      {/* Close/Remove favorite toggle trigger */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(reel.id);
                        }}
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                        className="absolute top-2.5 right-2.5 bg-white/95 text-[#f97316] p-1.5 rounded-full shadow-md z-10 transition-transform duration-200 ease-in-out cursor-pointer border-none"
                      >
                        <Heart className="w-3.5 h-3.5 fill-[#f97316]" />
                      </motion.button>

                      <div className="h-32 bg-surface-low relative overflow-hidden">
                          <img
                            src={reel.imageUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] ease-in-out pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-lg">
                              <Play className="w-5 h-5 fill-white translate-x-0.5" />
                            </div>
                          </div>
                        <span className="absolute bottom-2.5 left-2.5 bg-[#1c1b1b]/85 text-white font-display font-extrabold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                          {reel.platform.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-bold text-xs.5 text-on-surface leading-snug line-clamp-2">
                            {reel.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="bg-orange-50/50 text-primary-orange font-display font-bold text-[8.5px] uppercase px-2 py-0.5 rounded-md border border-primary-orange/10 whitespace-nowrap">
                              {reel.category.toUpperCase()}
                            </span>
                            <span className="bg-surface-low text-on-surface-muted/60 font-mono font-bold text-[8.5px] px-2 py-0.5 rounded-md whitespace-nowrap">
                              {reel.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {reels.filter(r => r.isFavorite).filter(reel => {
                  if (favoritesPlatformFilter === 'All') return true;
                  return reel.platform === favoritesPlatformFilter;
                }).length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3 bg-white rounded-2xl border border-brand-outline-variant/15 p-8 text-center text-xs text-on-surface-muted/50 z-10">
                    No active bookmark reels here. Select items to favorite on your dashboard.
                  </div>
                )}
              </div>

            </main>
          </div>
        )}

        {/* PROFILE/SETTINGS VIEW TAB (Screen 1) */}
        {activeTab === 'profile' && (
          <div className="flex-1 flex flex-col animate-fade-in select-none">
            <Header 
              user={currentUser} 
              onProfileClick={() => setActiveTab('profile')} 
              onNotificationsClick={() => setActiveTab('notifications')}
              unreadCount={appNotifications.filter(n => !n.isRead).length}
              showGreeting={false} 
            />

            <main className="p-5 md:p-8 lg:p-10 space-y-6 flex-1 overflow-y-auto no-scrollbar">
              
              {/* Profile Card Header (Screen 1) */}
              <div className="bg-white rounded-2xl border border-brand-outline-variant/15 p-4 flex items-center gap-4 shadow-sm">
                <div className="scale-125 ml-2"><UserButton /></div>
                <div>
                  <h3 className="font-display font-black text-lg text-on-surface leading-tight">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-on-surface-muted/60 font-sans mt-0.5 leading-none">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Stats metric bar (Screen 1) */}
              <div className="grid grid-cols-3 bg-[#FFF7ED]/60 rounded-2xl border border-brand-outline-variant/10 py-5 text-center shadow-inner">
                <div>
                  <p className="text-lg font-display font-black text-primary">
                    {currentUser.totalReels}
                  </p>
                  <p className="text-[10px] font-extrabold text-[#584237]/60 uppercase tracking-widest mt-0.5">
                    Total Reels
                  </p>
                </div>
                <div className="border-x border-brand-outline-variant/10">
                  <p className="text-lg font-display font-black text-primary">
                    {currentUser.totalCollections}
                  </p>
                  <p className="text-[10px] font-extrabold text-[#584237]/60 uppercase tracking-widest mt-0.5">
                    Collections
                  </p>
                </div>
                <div>
                  <p className="text-lg font-display font-black text-primary">
                    {currentUser.totalFavorites}
                  </p>
                  <p className="text-[10px] font-extrabold text-[#584237]/60 uppercase tracking-widest mt-0.5">
                    Favorites
                  </p>
                </div>
              </div>

              

              {/* Connected Platforms slider list (Screen 1) */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-display font-extrabold text-base text-on-surface tracking-tight">
                  <Smartphone className="w-4 h-4 text-[#9d4300]" />
                  <span>Connected Platforms</span>
                </h4>

                <div className="bg-white rounded-2xl border border-brand-outline-variant/12 shadow-sm divide-y divide-brand-outline-variant/10">
                  {platforms.map((platformSpec) => (
                    <div key={platformSpec.platform} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-primary-container/30 border border-primary-orange/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                          {platformSpec.platform[0]}
                        </div>
                        <div>
                          <p className="text-xs.5 font-bold text-on-surface font-display leading-tight">
                            {platformSpec.platform}
                          </p>
                          <p className="text-[10px] text-on-surface-muted/40 font-mono mt-0.5">
                            {platformSpec.isActive ? platformSpec.username : 'Disconnected'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPlatforms(prev =>
                            prev.map(p =>
                              p.platform === platformSpec.platform
                                ? { ...p, isActive: !p.isActive, username: p.isActive ? '' : '@maya.finds' }
                                : p
                            )
                          );
                        }}
                        className={`text-xs px-3 py-1 font-display font-semibold rounded-full select-none cursor-pointer transition-colors ${
                          platformSpec.isActive
                            ? 'bg-orange-50 text-primary-orange border border-primary-orange/20'
                            : 'bg-surface-low text-on-surface-muted/40 border border-brand-outline-variant/15'
                        }`}
                      >
                        {platformSpec.isActive ? 'Active' : 'Offline'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications Alert Preference checkbox checks (Screen 1) */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-display font-extrabold text-base text-on-surface tracking-tight">
                  <Settings className="w-4 h-4 text-[#9d4300]" />
                  <span>Notifications</span>
                </h4>

                <div className="bg-white rounded-2xl border border-brand-outline-variant/12 p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs.5 font-bold text-on-surface font-display leading-tight">
                        New Reel Alerts
                      </p>
                      <p className="text-[10px] text-on-surface-muted/50 mt-0.5 font-semibold">
                        Get push alerts for newly saved reels.
                      </p>
                    </div>

                    <button
                      onClick={() => setNotifications({ ...notifications, newReelAlerts: !notifications.newReelAlerts })}
                      className="focus:outline-none cursor-pointer"
                    >
                      {notifications.newReelAlerts ? (
                        <ToggleRight className="w-10 h-10 text-primary-orange fill-primary-orange/20" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-on-surface-muted/30" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs.5 font-bold text-on-surface font-display leading-tight">
                        Collection Updates
                      </p>
                      <p className="text-[10px] text-on-surface-muted/50 mt-0.5 font-semibold">
                        When creators share public collection updates.
                      </p>
                    </div>

                    <button
                      onClick={() => setNotifications({ ...notifications, collectionUpdates: !notifications.collectionUpdates })}
                      className="focus:outline-none cursor-pointer"
                    >
                      {notifications.collectionUpdates ? (
                        <ToggleRight className="w-10 h-10 text-primary-orange fill-primary-orange/20" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-on-surface-muted/30" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Red-colored Logout account danger block (Screen 1) */}
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 hover:text-red-800 font-display font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                  <span>Logout Account</span>
                </button>
              </div>

            </main>
          </div>
        )}

        {/* NOTIFICATIONS TAB VIEW SCREEN (Newly Added) */}
        {activeTab === 'notifications' && (
          <div className="flex-1 flex flex-col animate-fade-in select-none">
            {/* Header with back navigation support */}
            <header className="sticky top-0 bg-app-bg/85 backdrop-blur-md z-30 px-5 py-3 border-b border-brand-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('feed')}
                  className="w-9 h-9 rounded-full bg-surface-low border border-brand-outline-variant/15 flex items-center justify-center text-on-surface hover:bg-white active:scale-90 transition-all text-sm font-bold cursor-pointer"
                  aria-label="Back to Feed"
                >
                  ←
                </button>
                <div>
                  <h1 className="font-display font-extrabold text-base text-[#584237] tracking-tight leading-none">
                    Notifications
                  </h1>
                  <p className="text-[10px] text-on-surface-muted/50 mt-1 font-semibold">
                    {appNotifications.filter(n => !n.isRead).length} unread alerts waiting
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                {appNotifications.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        setAppNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      }}
                      className="text-[10px] px-2.5 py-1.5 bg-orange-50 border border-primary-orange/20 text-primary-orange font-display font-semibold rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => setAppNotifications([])}
                      className="text-[10px] px-2.5 py-1.5 bg-red-50 border border-red-100 text-red-600 font-display font-semibold rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </header>

            {/* Notification List Panel */}
            <main className="p-5 md:p-8 lg:p-10 space-y-4 flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8">
              {/* Filters toolbar inside notifications */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 selection:bg-transparent">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'alert', label: 'Alerts' },
                  { id: 'trend', label: 'Trends' },
                  { id: 'connection', label: 'Connections' }
                ].map((category) => {
                  const isSelected = notificationFilter === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setNotificationFilter(category.id as any)}
                      className={`px-3.5 py-1.5 text-[10px] font-display font-extrabold uppercase tracking-wider rounded-xl border select-none transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-150 ${
                        isSelected
                          ? 'bg-primary-orange text-white border-primary-orange shadow-sm'
                          : 'bg-white text-on-surface-muted border-brand-outline-variant/15 hover:border-brand-outline-variant/30 hover:bg-surface-low'
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {/* Notification Cards list */}
              <div className="space-y-3">
                {(() => {
                  const filtered = appNotifications.filter(n => {
                    if (notificationFilter === 'all') return true;
                    if (notificationFilter === 'alert') return n.type === 'alert' || n.type === 'collection';
                    return n.type === notificationFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white rounded-3xl border border-brand-outline-variant/10 p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="w-14 h-14 bg-[#FFF7ED] rounded-full flex items-center justify-center text-primary-orange text-2xl animate-bounce">
                          ✨
                        </div>
                        <div>
                          <h3 className="font-display font-black text-base text-[#584237] leading-snug">
                            All Caught Up!
                          </h3>
                          <p className="text-[11px] text-on-surface-muted/60 mt-1 max-w-[240px] mx-auto leading-relaxed">
                            No active updates right now. Save more reels to get real-time alerts.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return filtered.map((item) => {
                    let iconBg = 'bg-orange-50 text-primary-orange border-primary-orange/15';
                    let IconComp = Sparkles;
                    if (item.type === 'alert') {
                      iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-500/15';
                      IconComp = PlusCircle;
                    } else if (item.type === 'collection') {
                      iconBg = 'bg-blue-50 text-blue-600 border-blue-500/15';
                      IconComp = Heart;
                    } else if (item.type === 'connection') {
                      iconBg = 'bg-purple-50 text-purple-600 border-purple-500/15';
                      IconComp = Smartphone;
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setAppNotifications(prev =>
                            prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
                          );
                        }}
                        className={`p-4 rounded-2xl border transition-all relative flex gap-3.5 group cursor-pointer ${
                          item.isRead
                            ? 'bg-white border-brand-outline-variant/5 opacity-70'
                            : 'bg-white border-primary-orange/15 shadow-sm hover:ring-1 hover:ring-primary-orange/20'
                        }`}
                      >
                        {!item.isRead && (
                          <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary-orange rounded-full animate-ping" />
                        )}

                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <IconComp className="w-4 h-4 stroke-[2.2]" />
                        </div>

                        <div className="flex-1 space-y-1 pr-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-extrabold text-[#584237] text-xs leading-none">
                              {item.title}
                            </h4>
                            <span className="text-[9px] text-on-surface-muted/40 font-semibold font-sans">
                              {item.time}
                            </span>
                          </div>

                          <p className="text-[10.5px] text-[#584237]/80 leading-normal font-sans font-medium">
                            {item.message}
                          </p>

                          {item.associatedReelId && (
                            <div className="pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const targetReel = reels.find(r => r.id === item.associatedReelId);
                                  if (targetReel) {
                                    setHighlightedReel(targetReel);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-display font-black text-primary-orange bg-orange-50 border border-primary-orange/15 px-2.5 py-1 rounded-lg hover:bg-primary-orange hover:text-white hover:border-primary-orange transition-colors cursor-pointer"
                              >
                                <span>Preview Reel</span>
                                <Play className="w-2 h-2 fill-current translate-x-0.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </main>
          </div>
        )}

        {/* BOTTOM DEVICE NAVIGATION ZONE */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddClick={() => openSaveModal()} 
        />

        {/* SAVE REEL DIALOG OVERLAY */}
        <AnimatePresence>
          {showAddModal && (
            <SaveReelModal 
              onClose={() => {
                setShowAddModal(false);
                setSaveTargetCollectionId(null);
              }} 
              onSave={handleSaveReel}
              collectionId={saveTargetCollectionId}
              collections={collections}
              onCreateCollection={addCollection}
              recentReels={reels}
            />
          )}
        </AnimatePresence>

        {/* EDIT COLLECTION MODAL OVERLAY */}
        <AnimatePresence>
          {editingCollectionId !== null && (() => {
            const colToEdit = collections.find(c => c.id === editingCollectionId);
            if (!colToEdit) return null;
            return (
            <motion.div
              className="fixed inset-0 bg-on-surface-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-5 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0" onClick={() => setEditingCollectionId(null)} />
              <motion.div
                className="relative bg-[#FAFAF8] w-full max-w-sm md:max-w-[480px] rounded-[24px] p-6 shadow-2xl border border-[#584237]/10 z-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h3 className="font-display font-black text-lg text-[#584237] mb-4">Edit Collection</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#584237]/60 mb-1 font-display">
                      Collection Title
                    </label>
                    <input
                      type="text"
                      value={editColName}
                      onChange={(e) => setEditColName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-brand-outline-variant/20 rounded-xl text-xs.5 text-on-surface focus:outline-none focus:ring-1.5 focus:ring-primary-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#584237]/60 mb-1 font-display">
                      Description
                    </label>
                    <textarea
                      value={editColDesc}
                      onChange={(e) => setEditColDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white border border-brand-outline-variant/20 rounded-xl text-xs.5 text-on-surface focus:outline-none focus:ring-1.5 focus:ring-primary-orange resize-none"
                    />
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingCollectionId(null)}
                      className="text-xs font-bold text-on-surface-muted/60 hover:text-on-surface px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCollectionEdit}
                      className="bg-[#934A2F] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-opacity-90 shadow-md active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* SHARE COLLECTION BOTTOM MODAL SHEET (Screen 0) */}
        <AnimatePresence>
          {sharingCollection && (
            <ShareCollectionModal 
              collection={sharingCollection} 
              onClose={() => setSharingCollection(null)} 
            />
          )}
        </AnimatePresence>

        {/* RANDOM SPOTLIGHT INTERACTIVE VIDEO HIGHLIGHT PLAYBACK SCREEN (Screen 6) */}
        <AnimatePresence>
          {spotlightReel && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex flex-col items-center justify-start z-50 p-6 pt-24 text-white select-none overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="absolute top-6 right-6">
              <button
                onClick={() => { setHighlightedReel(null); setShowModalMenu(false); }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all duration-200 ease-in-out font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <motion.div
              className="w-full max-w-sm md:max-w-[480px] flex flex-col items-center space-y-6 max-h-[85vh] overflow-y-auto pr-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="w-full aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 group">
                
                {/* Three-dots menu button */}
                <div className="absolute left-4 top-4 z-20">
                  <motion.button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowModalMenu(prev => !prev);
                    }}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.2 }}
                    className="w-10 h-10 bg-white text-[#584237] rounded-full flex items-center justify-center shadow-lg cursor-pointer border-none z-20"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-on-surface-muted/60" />
                  </motion.button>
                  {showModalMenu && (
                    <div className="absolute left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-brand-outline-variant/10 py-1.5 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowModalMenu(false);
                          setReelToDelete(spotlightReel);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <img
                  src={spotlightReel.imageUrl}
                  alt={spotlightReel.title}
                  className="w-full h-full object-cover opacity-60 filter saturate-110"
                />
                {canNavigateSpotlight && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigateSpotlight(-1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 active:scale-95 transition-all duration-200 ease-in-out z-20"
                      aria-label="Previous reel"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateSpotlight(1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 active:scale-95 transition-all duration-200 ease-in-out z-20"
                      aria-label="Next reel"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <motion.button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(spotlightReel.id);
                  }}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="absolute right-4 top-4 w-10 h-10 bg-white text-primary-orange rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ease-in-out cursor-pointer border-none z-20"
                  aria-label={spotlightReel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${spotlightReel.isFavorite ? 'fill-primary-orange text-primary-orange' : 'text-on-surface-muted/60'}`} />
                </motion.button>
                
                {/* Large animated play ring center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => window.open(spotlightReel.url, '_blank', 'noopener,noreferrer')}
                    className="w-16 h-16 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 ease-in-out cursor-pointer animate-pulse border-none"
                    aria-label="Open reel"
                  >
                    <Play className="w-8 h-8 fill-white translate-x-0.5" />
                  </button>
                </div>

                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                  <span className="bg-primary-orange text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/20">
                    {spotlightReel.platform}
                  </span>
                  <ExpandableCaption
                    text={spotlightReel.title}
                    className="font-display font-black text-lg text-white tracking-tight drop-shadow-md"
                    buttonClassName="text-white/70 hover:text-white"
                  />
                  <div className="flex items-center gap-3 text-xs text-white/70 font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {spotlightReel.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {spotlightReel.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-white/50 mb-1 tracking-widest uppercase font-bold font-display">
                  Spotlight Random Reel
                </p>
                <p className="text-sm font-semibold text-primary-orange hover:underline cursor-pointer" onClick={() => triggerRandomPick()}>
                  Pick another
                </p>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* GLOBAL DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {reelToDelete && (
            <motion.div
              className="fixed inset-0 bg-on-surface-dark/60 backdrop-blur-sm flex items-center justify-center z-[100] p-5 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0" onClick={() => setReelToDelete(null)} />
              <motion.div
                className="relative bg-[#FAFAF8] w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-[#584237]/10 z-10 space-y-4 text-[#584237]"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-display font-black text-lg text-[#584237]">Delete this reel?</h3>
                <p className="text-xs text-on-surface-muted/70 font-medium">This cannot be undone.</p>
                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setReelToDelete(null)}
                    className="text-xs font-bold text-on-surface-muted/60 hover:text-on-surface px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteReel}
                    className="bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-md active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST MESSAGE ALERT */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="fixed bottom-6 right-6 bg-[#1c1b1b]/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-[110] text-xs font-bold border border-white/10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
          </div>
        )}
      </SignedIn>
    </>
  );
}
