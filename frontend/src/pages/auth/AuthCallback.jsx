import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const token        = params.get('token')
    const refreshToken = params.get('refresh_token')
    const error        = params.get('error')

    if (error || !token) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    try {
      const user = JSON.parse(params.get('user') || '{}')
      authService.handleGoogleCallback(token, refreshToken, user)
      setUser(user)
      toast.success(`Welcome, ${user.name?.split(' ')[0] || 'there'}!`)
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-text-muted text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
