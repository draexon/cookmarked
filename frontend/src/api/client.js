import axios from 'axios'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE } from '@/constants'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

function unwrapApiData(response) {
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    return response.data
  }

  return response
}

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        const tokens = unwrapApiData(data)

        localStorage.setItem(TOKEN_KEY, tokens.access_token)
        if (tokens.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
        }

        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    return Promise.reject({ ...error, message })
  }
)

export default api
