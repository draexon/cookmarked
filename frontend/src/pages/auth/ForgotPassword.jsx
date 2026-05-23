import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl border border-border p-8 shadow-elevated">
      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary mb-2">Check your email</h2>
          <p className="text-text-muted text-sm mb-6">We sent a reset link to <span className="text-text-primary">{getValues('email')}</span></p>
          <Link to="/login" className="text-sm text-accent-glow hover:text-accent-primary transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl text-text-primary">Reset password</h2>
            <p className="text-text-muted text-sm mt-1">Enter your email and we'll send a reset link</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-10 text-sm" />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </>
      )}
    </motion.div>
  )
}
