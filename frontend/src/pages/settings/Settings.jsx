import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Lock, LogOut, Shield, Bell, Palette, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'
import { PLATFORMS } from '@/constants'
import PlatformBadge from '@/components/ui/PlatformBadge'

const profileSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

function Section({ title, children }) {
  return (
    <div className="glass rounded-2xl border border-border p-5 sm:p-6 space-y-4">
      <h2 className="font-display font-semibold text-text-primary text-base">{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  const onProfileSubmit = async (values) => {
    setProfileLoading(true)
    try {
      const updated = await userService.updateProfile(values)
      setUser(updated)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (values) => {
    setPasswordLoading(true)
    try {
      await userService.updatePassword(values)
      toast.success('Password updated!')
      passwordForm.reset()
    } catch {
      toast.error('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-2xl text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-0.5">Manage your account and preferences</p>
      </motion.div>

      {/* Avatar */}
      <motion.div variants={item}>
        <Section title="Profile">
          <div className="flex items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-accent-soft border border-accent-border flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-accent-glow uppercase">{user?.name?.[0] || 'U'}</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">{user?.name || 'User'}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input {...profileForm.register('name')} className="input-field pl-9 text-sm" />
              </div>
              {profileForm.formState.errors.name && <p className="text-xs text-red-400 mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input {...profileForm.register('email')} type="email" className="input-field pl-9 text-sm" />
              </div>
              {profileForm.formState.errors.email && <p className="text-xs text-red-400 mt-1">{profileForm.formState.errors.email.message}</p>}
            </div>
            <button type="submit" disabled={profileLoading} className="btn-primary text-sm disabled:opacity-50">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Section>
      </motion.div>

      {/* Password */}
      <motion.div variants={item}>
        <Section title="Change Password">
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
            {[
              { name: 'currentPassword', placeholder: 'Current password' },
              { name: 'newPassword', placeholder: 'New password' },
              { name: 'confirmPassword', placeholder: 'Confirm new password' },
            ].map(({ name, placeholder }) => (
              <div key={name}>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input {...passwordForm.register(name)} type="password" placeholder={placeholder} className="input-field pl-9 text-sm" />
                </div>
                {passwordForm.formState.errors[name] && <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors[name].message}</p>}
              </div>
            ))}
            <button type="submit" disabled={passwordLoading} className="btn-primary text-sm disabled:opacity-50">
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Section>
      </motion.div>

      {/* Connected platforms */}
      <motion.div variants={item}>
        <Section title="Connected Platforms">
          <div className="space-y-2">
            {Object.values(PLATFORMS).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2">
                <PlatformBadge platform={p.id} size="sm" showLabel />
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
              </div>
            ))}
          </div>
        </Section>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <Section title="Notifications">
          {[
            { label: 'Email digests', sub: 'Weekly summary of your library' },
            { label: 'New AI categorizations', sub: 'When reels are auto-organized' },
            { label: 'Share activity', sub: 'When someone views a shared collection' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.sub}</p>
              </div>
              <button className="w-10 h-5 rounded-full bg-accent-primary relative transition-all">
                <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </Section>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={item}>
        <Section title="Account">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </Section>
      </motion.div>
    </motion.div>
  )
}
