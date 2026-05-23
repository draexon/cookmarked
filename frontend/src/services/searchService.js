import api from '@/api/client'
import { unwrapApiData } from './unwrapApiData'

export const searchService = {
  async search(query, filters = {}) {
    const { data } = await api.get('/search', { params: { q: query, ...filters } })
    return unwrapApiData(data)
  },
}
