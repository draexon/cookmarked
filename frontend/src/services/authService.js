import api from '@/api/client'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/constants'
import { unwrapApiData } from './unwrapApiData'

function storeSession({ access_token, refresh_token, user }) {
  localStorage.setItem(TOKEN_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const authService = {
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  getStoredUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    const session = unwrapApiData(data)
    storeSession(session)
    return session
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    const session = unwrapApiData(data)
    storeSession(session)
    return session
  },

  logout: () => clearSession(),

  getMe: async () => {
    const { data } = await api.get('/auth/me')
    const user = unwrapApiData(data)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return unwrapApiData(data)
  },

  resetPassword: async (token, password) => {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return unwrapApiData(data)
  },

  // Called after Google OAuth redirect — token comes as URL param
  handleGoogleCallback: (token, refreshToken, user) => {
    storeSession({ access_token: token, refresh_token: refreshToken, user })
  },
}
