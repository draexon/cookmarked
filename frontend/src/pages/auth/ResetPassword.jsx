import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'
import { useState } from 'react'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ password }) => {
    if (!token) return toast.error('Invalid reset link')
    setIsLoading(true)
    try {
      await authService.resetPassword(token, password)
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch {
      toast.error('Reset failed. Link may be expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl border border-border p-8 shadow-elevated">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-text-primary">New password</h2>
        <p className="text-text-muted text-sm mt-1">Choose a strong new password</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input {...register('password')} type="password" placeholder="New password" className="input-field pl-10 text-sm" />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.password.message}</p>}
        </div>
        <div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input {...register('confirmPassword')} type="password" placeholder="Confirm new password" className="input-field pl-10 text-sm" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </motion.div>
  )
}
