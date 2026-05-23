import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.7 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.6C.9 17.4 0 20.6 0 24s.9 6.6 2.6 9.5l8.2-4.7z" fill="#FBBC04"/>
      <path d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.1 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  )
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      await login(values)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-strong rounded-3xl border border-border p-8 shadow-elevated"
    >
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-text-primary">Welcome back</h2>
        <p className="text-text-muted text-sm mt-1">Sign in to your account to continue</p>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface hover:bg-bg-elevated hover:border-border-strong transition-all text-sm text-text-primary mb-4"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-10 text-sm" autoComplete="email" />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field pl-10 pr-10 text-sm" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent-glow hover:text-accent-primary transition-colors">Forgot password?</Link>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-text-muted text-sm">Don't have an account? </span>
        <Link to="/register" className="text-sm text-accent-glow hover:text-accent-primary font-medium transition-colors">Sign up</Link>
      </div>
    </motion.div>
  )
}
