import { create } from 'zustand'
import { authService } from '@/services/authService'

export const useAuthStore = create((set, get) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.login(credentials)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.register(userData)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null }),
}))
