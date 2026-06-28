import { Reel, Collection, UserProfile, PlatformConnection, NotificationSettings, CookMarkedNotification } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Maya Rivera',
  email: 'maya@cookmarked.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  totalReels: 128,
  totalCollections: 12,
  totalFavorites: 34
};

export const INITIAL_PLATFORMS: PlatformConnection[] = [
  { platform: 'Instagram', username: '@maya.saved', isActive: true },
  { platform: 'TikTok', username: '@maya.finds', isActive: true },
  { platform: 'YouTube', username: 'MayaSavedIt', isActive: true },
  { platform: 'Pinterest', username: '@mayamarks', isActive: false }
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  newReelAlerts: true,
  collectionUpdates: false
};

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'c7',
    name: 'Watch Later',
    description: 'Reels to revisit when you have more time.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    itemCount: 24,
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    isFeatured: true,
    isPublic: true
  },
  {
    id: 'c1',
    name: 'Favorites',
    description: 'Saved reels worth keeping close.',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80',
    itemCount: 42,
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    isFeatured: false,
    isPublic: true
  },
  {
    id: 'c2',
    name: 'Tech Finds',
    description: 'Useful tools, app ideas, and creator explainers.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    itemCount: 12,
    platforms: ['TikTok', 'Instagram'],
    isPublic: false
  },
  {
    id: 'c3',
    name: 'Travel Ideas',
    description: 'Places, routes, stays, and trip inspiration.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    itemCount: 28,
    platforms: ['YouTube', 'Instagram', 'Pinterest'],
    isPublic: true
  },
  {
    id: 'c4',
    name: 'Style Board',
    description: 'Fashion, beauty, and visual inspiration.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80',
    itemCount: 15,
    platforms: ['YouTube', 'Pinterest'],
    isPublic: true
  },
  {
    id: 'c5',
    name: 'Fitness Clips',
    description: 'Workouts, mobility, and wellness routines.',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80',
    itemCount: 18,
    platforms: ['Instagram', 'TikTok']
  },
  {
    id: 'c6',
    name: 'Inspiration',
    description: 'Creative ideas, DIY saves, and anything worth trying.',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80',
    itemCount: 21,
    platforms: ['Instagram', 'YouTube']
  }
];

export const INITIAL_REELS: Reel[] = [
  {
    id: 'rs1',
    title: 'Minimal Desk Setup Tour',
    platform: 'Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80',
    category: 'Workspace',
    duration: '45 sec',
    url: 'https://www.instagram.com/reels/deskSetup77/',
    isFavorite: true,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 1
  },
  {
    id: 'rs2',
    title: 'Tokyo Side Street Walk',
    platform: 'YouTube',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=500&q=80',
    category: 'Travel',
    duration: '1 min',
    url: 'https://www.youtube.com/watch?v=tokyoWalk99',
    isFavorite: false,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 3
  },
  {
    id: 'rs3',
    title: 'Five Useful Phone Shortcuts',
    platform: 'TikTok',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
    category: 'Tech',
    duration: '30 sec',
    url: 'https://www.tiktok.com/@shortcuts/video/phone101',
    isFavorite: true,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 4
  },
  {
    id: 'rs4',
    title: 'Apartment Shelf Makeover',
    platform: 'Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80',
    category: 'DIY',
    duration: '50 sec',
    url: 'https://www.instagram.com/reels/shelfMakeover92',
    isFavorite: false,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 8
  },
  {
    id: 'rs5',
    title: 'Morning Mobility Routine',
    platform: 'YouTube',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80',
    category: 'Fitness',
    duration: '2 min',
    url: 'https://www.youtube.com/watch?v=mobilityFlow',
    isFavorite: true,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 12
  },
  {
    id: 'rs6',
    title: 'Street Portrait Editing Flow',
    platform: 'TikTok',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=500&q=80',
    category: 'Photography',
    duration: '35 sec',
    url: 'https://www.tiktok.com/@photoedit/video/portraitflow',
    isFavorite: false,
    collectionId: 'c7',
    savedAt: Date.now() - 3600000 * 20
  },
  {
    id: 'r1',
    title: 'Tiny Home Storage Ideas',
    platform: 'Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80',
    category: 'Home',
    duration: '40 sec',
    url: 'https://www.instagram.com/reels/C5p8Storage123/',
    isFavorite: true,
    collectionId: 'c1',
    savedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'r2',
    title: 'AI Note-Taking Workflow',
    platform: 'TikTok',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    category: 'Tech',
    duration: '55 sec',
    url: 'https://www.tiktok.com/@maya.finds/video/7213456789/',
    isFavorite: true,
    collectionId: 'c2',
    savedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'r3',
    title: 'Budget Weekend Getaway',
    platform: 'Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80',
    category: 'Travel',
    duration: '1 min',
    url: 'https://www.instagram.com/reels/C5p4Trip789/',
    isFavorite: true,
    collectionId: 'c3',
    savedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'r4',
    title: 'Capsule Wardrobe Basics',
    platform: 'YouTube',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80',
    category: 'Fashion',
    duration: '45 sec',
    url: 'https://www.youtube.com/watch?v=capsule999',
    isFavorite: true,
    collectionId: 'c4',
    savedAt: Date.now() - 3600000 * 48
  },
  {
    id: 'r5',
    title: 'Beginner Core Circuit',
    platform: 'Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
    category: 'Fitness',
    duration: '30 sec',
    url: 'https://www.instagram.com/reels/C5p123Core/',
    isFavorite: false,
    collectionId: 'c1',
    savedAt: Date.now() - 3600000 * 12
  },
  {
    id: 'r6',
    title: 'Color Grading Before and After',
    platform: 'TikTok',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80',
    category: 'Creative',
    duration: '20 sec',
    url: 'https://www.tiktok.com/@maya.finds/video/8192381273/',
    isFavorite: false,
    collectionId: 'c1',
    savedAt: Date.now() - 3600000 * 30
  }
];

export const RECENT_LINKS_MOCK = [
  {
    title: 'Pocket Trip Packing Hack',
    platform: 'TikTok' as const,
    url: 'https://www.tiktok.com/@maya.finds/video/r923812932',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80'
  },
  {
    title: 'Focus Timer Setup',
    platform: 'YouTube' as const,
    url: 'https://www.youtube.com/watch?v=focusTimerLive',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_NOTIFICATIONS: CookMarkedNotification[] = [
  {
    id: 'n1',
    title: 'Trend Alert: Creator Tools',
    message: 'AI note-taking workflows are going viral. Check the latest save in Tech Finds.',
    time: '32 mins ago',
    isRead: false,
    type: 'trend',
    associatedReelId: 'r2'
  },
  {
    id: 'n2',
    title: 'Tech Finds Updated',
    message: 'A creator shared a cleaner workflow for the AI Note-Taking reel. Check out the updated clip.',
    time: '2 hours ago',
    isRead: false,
    type: 'collection',
    associatedReelId: 'r2'
  },
  {
    id: 'n3',
    title: 'New Save Confirmed',
    message: 'Successfully bookmarked "Tiny Home Storage Ideas" from Instagram into your "Favorites" collection.',
    time: '5 hours ago',
    isRead: true,
    type: 'alert',
    associatedReelId: 'r1'
  },
  {
    id: 'n4',
    title: 'Platform Connection Active',
    message: 'Your TikTok account @maya.finds has successfully synced with CookMarked.',
    time: '1 day ago',
    isRead: true,
    type: 'connection'
  },
  {
    id: 'n5',
    title: 'Style Trend',
    message: 'Capsule wardrobe reels are trending. Explore ideas in your Style Board folder.',
    time: '3 days ago',
    isRead: true,
    type: 'trend',
    associatedReelId: 'r4'
  }
];
