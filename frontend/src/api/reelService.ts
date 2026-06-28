import { API_BASE } from './config';
import type { Collection, Platform, Reel, UserProfile } from '../types';

const TOKEN_KEY = 'cookmarked_access_token';
const REFRESH_TOKEN_KEY = 'cookmarked_refresh_token';
const BACKEND_BASE = API_BASE.replace(/\/api$/, '');

type JsonRecord = Record<string, unknown>;
type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

interface BackendUser {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface BackendStats {
  total_reels: number;
  total_collections: number;
  total_favorites: number;
}

interface BackendReel {
  id: number;
  title: string | null;
  platform: string | null;
  thumbnail: string | null;
  category: string | null;
  url: string;
  is_favorite: boolean;
  is_watched?: boolean;
  collection_id: number | null;
  created_at: string;
}

interface BackendCollection {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  reel_count: number;
  platforms: string[];
  is_favorite: boolean;
  reels?: BackendReel[];
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function hasAuthToken() {
  return Boolean(getToken());
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function completeOAuthLogin(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function storeTokens(auth: AuthResponse) {
  completeOAuthLogin(auth.access_token, auth.refresh_token);
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  try {
    const token = getToken();
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (auth && token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const body = await response.json().catch(() => ({})) as JsonRecord;
    if (!response.ok) {
      throw new Error(String(body.message || body.error || `Request failed (${response.status})`));
    }
    return body as T;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unable to reach the CookMarked API');
  }
}

function toPlatform(value: string | null): Platform {
  const normalized = String(value || '').trim().toLowerCase();
  const platforms: Record<string, Platform> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
    facebook: 'Facebook',
    netflix: 'Netflix',
    'prime video': 'Prime Video',
    primevideo: 'Prime Video',
    amazonprime: 'Prime Video',
    'amazon prime': 'Prime Video',
  };

  return platforms[normalized] || 'Other';
}

export function mapReel(reel: BackendReel): Reel {
  return {
    id: String(reel.id),
    title: reel.title || 'Untitled Reel',
    platform: toPlatform(reel.platform),
    imageUrl: reel.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    category: reel.category || 'Other',
    duration: 'Saved Reel',
    url: reel.url,
    isFavorite: Boolean(reel.is_favorite),
    isWatched: Boolean(reel.is_watched),
    collectionId: reel.collection_id == null ? undefined : String(reel.collection_id),
    savedAt: Date.parse(reel.created_at) || Date.now(),
  };
}

function mapCollection(collection: BackendCollection): Collection {
  return {
    id: String(collection.id),
    name: collection.name,
    description: collection.description || '',
    imageUrl: collection.cover_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    itemCount: collection.reel_count || 0,
    platforms: collection.platforms.map(toPlatform),
    isFeatured: Boolean(collection.is_favorite),
  };
}

export async function healthCheck() {
  return request<{ ok: boolean; service: string }>('/health', {}, false);
}

export async function login(email: string, password: string) {
  const auth = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);
  storeTokens(auth);
  return auth.user;
}

export async function register(name: string, email: string, password: string) {
  const auth = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }, false);
  storeTokens(auth);
  return auth.user;
}

export async function getCurrentUser() {
  return request<BackendUser>('/auth/me');
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const result = await request<{ access_token: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  }, false);
  localStorage.setItem(TOKEN_KEY, result.access_token);
  return result.access_token;
}

export function forgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false);
}

export function resetPassword(token: string, password: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }, false);
}

export function getCollections() {
  return request<ApiEnvelope<BackendCollection[]>>('/collections').then((result) => result.data.map(mapCollection));
}

async function getBackendCollection(id: string) {
  return request<ApiEnvelope<BackendCollection>>(`/collections/${encodeURIComponent(id)}`).then((result) => result.data);
}

export function getCollection(id: string) {
  return getBackendCollection(id).then(mapCollection);
}

export function createCollection(input: { name: string; description?: string }) {
  return request<ApiEnvelope<BackendCollection>>('/collections', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((result) => mapCollection(result.data));
}

export function updateCollection(id: string, input: { name?: string; description?: string }) {
  return request<ApiEnvelope<BackendCollection>>(`/collections/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }).then((result) => mapCollection(result.data));
}

export function deleteCollection(id: string) {
  return request<ApiEnvelope<{ id: number; moved_to_collection_id: number }>>(`/collections/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function toggleCollectionFavorite(id: string) {
  return request<ApiEnvelope<BackendCollection>>(`/collections/${encodeURIComponent(id)}/favorite`, { method: 'POST' })
    .then((result) => mapCollection(result.data));
}

export function shareCollection(id: string) {
  return request<ApiEnvelope<{ share_url: string }>>(`/share/${encodeURIComponent(id)}`, { method: 'POST' })
    .then((result) => result.data.share_url);
}

export function getSharedCollection(token: string) {
  return request<ApiEnvelope<BackendCollection>>(`/share/${encodeURIComponent(token)}`, {}, false)
    .then((result) => mapCollection(result.data));
}

export function saveReel(input: { url: string; collection_id?: string; title?: string }) {
  return request<ApiEnvelope<BackendReel>>('/reels', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((result) => mapReel(result.data));
}

export function getRandomReel() {
  return request<ApiEnvelope<BackendReel>>('/reels/random').then((result) => mapReel(result.data));
}

export function getFavoriteReels() {
  return request<ApiEnvelope<BackendReel[]>>('/reels/favorites').then((result) => result.data.map(mapReel));
}

export function deleteReel(id: string) {
  return request<ApiEnvelope<{ id: number }>>(`/reels/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function toggleReelFavorite(id: string) {
  return request<ApiEnvelope<BackendReel>>(`/reels/${encodeURIComponent(id)}/favorite`, { method: 'POST' })
    .then((result) => mapReel(result.data));
}

export function updateReelNote(id: string, note: string) {
  return request<ApiEnvelope<BackendReel>>(`/reels/${encodeURIComponent(id)}/note`, {
    method: 'PATCH',
    body: JSON.stringify({ note }),
  }).then((result) => mapReel(result.data));
}

export function toggleReelWatched(id: string) {
  return request<ApiEnvelope<BackendReel>>(`/reels/${encodeURIComponent(id)}/watched`, { method: 'POST' })
    .then((result) => mapReel(result.data));
}

export function getReelStatus(id: string) {
  return request<ApiEnvelope<{ id: number; status: string }>>(`/reels/${encodeURIComponent(id)}/status`)
    .then((result) => result.data);
}

export function search(query: string) {
  return request<ApiEnvelope<{ reels: BackendReel[]; collections: BackendCollection[] }>>(`/search?q=${encodeURIComponent(query)}`);
}

export function updateCurrentUser(input: { name?: string; avatar_url?: string }) {
  return request<ApiEnvelope<BackendUser>>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  }).then((result) => result.data);
}

export function updatePassword(current_password: string, new_password: string) {
  return request<ApiEnvelope<BackendUser>>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ current_password, new_password }),
  }).then((result) => result.data);
}

export function uploadAvatar(avatar: File) {
  const body = new FormData();
  body.append('avatar', avatar);
  return request<ApiEnvelope<BackendUser>>('/users/me/avatar', { method: 'PATCH', body })
    .then((result) => result.data);
}

export function getUserStats() {
  return request<ApiEnvelope<BackendStats>>('/users/me/stats').then((result) => result.data);
}

export async function getProfile(): Promise<UserProfile> {
  const [user, stats] = await Promise.all([getCurrentUser(), getUserStats()]);
  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url ? `${BACKEND_BASE}${user.avatar_url}` : '',
    totalReels: stats.total_reels,
    totalCollections: stats.total_collections,
    totalFavorites: stats.total_favorites,
  };
}

export async function getLibrary() {
  const summaries = await getCollections();
  const details = await Promise.all(summaries.map((collection) => getBackendCollection(collection.id)));
  return {
    collections: details.map(mapCollection),
    reels: details.flatMap((collection) => (collection.reels || []).map(mapReel)),
  };
}
