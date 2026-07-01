export type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'Pinterest' | 'Facebook' | 'Netflix' | 'Prime Video' | 'Other';

export interface Reel {
  id: string;
  title: string;
  description?: string;
  platform: Platform;
  imageUrl: string;
  category: string; // e.g. "Fitness", "Travel", "Fashion", "DIY", "Tech"
  duration: string; // e.g. "15 MIN", "30 MIN"
  url: string;
  isFavorite: boolean;
  isWatched?: boolean;
  collectionId?: string;
  savedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  platforms: Platform[];
  isFeatured?: boolean;
  isPublic?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  totalReels: number;
  totalCollections: number;
  totalFavorites: number;
}

export interface PlatformConnection {
  platform: Platform;
  username: string;
  isActive: boolean;
}

export interface NotificationSettings {
  newReelAlerts: boolean;
  collectionUpdates: boolean;
}

export interface AllMarkedNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'all' | 'alert' | 'collection' | 'connection' | 'trend';
  associatedReelId?: string;
}
