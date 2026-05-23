import api from '@/api/client'
import { unwrapApiData } from './unwrapApiData'

export const collectionService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/collections', { params })
    return unwrapApiData(data)
  },

  getById: async (id) => {
    const { data } = await api.get(`/collections/${id}`)
    return unwrapApiData(data)
  },

  create: async (payload) => {
    const { data } = await api.post('/collections', payload)
    return unwrapApiData(data)
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/collections/${id}`, payload)
    return unwrapApiData(data)
  },

  delete: async (id) => {
    const { data } = await api.delete(`/collections/${id}`)
    return unwrapApiData(data)
  },

  toggleFavorite: async (id) => {
    const { data } = await api.post(`/collections/${id}/favorite`)
    return unwrapApiData(data)
  },

  getShareUrl: async (id) => {
    const { data } = await api.post(`/share/${id}`)
    return unwrapApiData(data)
  },

  getShared: async (token) => {
    const { data } = await api.get(`/share/${token}`)
    return unwrapApiData(data) || null
  },
}
