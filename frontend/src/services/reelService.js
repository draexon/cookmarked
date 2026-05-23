import api from '@/api/client'
import { unwrapApiData } from './unwrapApiData'

export const reelService = {
  save: async (payload) => {
    const { data } = await api.post('/reels', payload)
    return unwrapApiData(data)
  },

  delete: async (id) => {
    const { data } = await api.delete(`/reels/${id}`)
    return unwrapApiData(data)
  },

  toggleFavorite: async (id) => {
    const { data } = await api.post(`/reels/${id}/favorite`)
    return unwrapApiData(data)
  },

  toggleMade: async (id) => {
    const { data } = await api.post(`/reels/${id}/made`)
    return unwrapApiData(data)
  },

  updateNote: async (id, note) => {
    const { data } = await api.patch(`/reels/${id}/note`, { note })
    return unwrapApiData(data)
  },

  getFavorites: async () => {
    const { data } = await api.get('/reels/favorites')
    return unwrapApiData(data)
  },

  getRandom: async (params = {}) => {
    const { data } = await api.get('/reels/random', { params })
    return unwrapApiData(data)
  },

  getStatus: async (id) => {
    const { data } = await api.get(`/reels/${id}/status`)
    return unwrapApiData(data)
  },
}
