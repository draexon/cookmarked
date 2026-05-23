import api from '@/api/client'
import { unwrapApiData } from './unwrapApiData'

export const userService = {
  getStats: async () => {
    const { data } = await api.get('/users/me/stats')
    return unwrapApiData(data)
  },

  // Backend only supports name + avatar_url (not email)
  updateProfile: async ({ name, avatar_url }) => {
    const { data } = await api.patch('/users/me', { name, avatar_url })
    return unwrapApiData(data)
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    const { data } = await api.patch('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return unwrapApiData(data)
  },

  uploadAvatar: async (file) => {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await api.patch('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapApiData(data)
  },
}
