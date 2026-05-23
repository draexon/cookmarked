import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  saveModalOpen: false,
  randomReelModal: { open: false, reel: null, reels: [] },
  activeFilters: { platforms: [], categories: [] },
  viewMode: 'grid', // 'grid' | 'list'

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSaveModalOpen: (open) => set({ saveModalOpen: open }),
  setRandomReelModal: (state) => set((s) => ({ randomReelModal: { ...s.randomReelModal, ...state } })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPlatformFilter: (platform) =>
    set((s) => ({
      activeFilters: {
        ...s.activeFilters,
        platforms: platform ? [platform] : [],
      },
    })),

  setFilter: (type, value) =>
    set((s) => {
      const current = s.activeFilters[type]
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { activeFilters: { ...s.activeFilters, [type]: updated } }
    }),

  clearFilters: () => set({ activeFilters: { platforms: [], categories: [] } }),
}))
