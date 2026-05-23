import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PageLoader from '@/components/loaders/PageLoader'

const Login           = lazy(() => import('@/pages/auth/Login'))
const Register        = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword  = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword   = lazy(() => import('@/pages/auth/ResetPassword'))
const AuthCallback    = lazy(() => import('@/pages/auth/AuthCallback'))

const Dashboard        = lazy(() => import('@/pages/dashboard/Dashboard'))
const Collections      = lazy(() => import('@/pages/collections/Collections'))
const CollectionDetail = lazy(() => import('@/pages/collections/CollectionDetail'))
const Favorites        = lazy(() => import('@/pages/dashboard/Favorites'))
const Search           = lazy(() => import('@/pages/dashboard/Search'))
const Settings         = lazy(() => import('@/pages/settings/Settings'))
const SharedCollection = lazy(() => import('@/pages/shared/SharedCollection'))
const NotFound         = lazy(() => import('@/pages/shared/NotFound'))

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
        </Route>

        {/* Google OAuth callback — outside AuthLayout */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Public share route */}
        <Route path="/share/:token" element={<SharedCollection />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/"               element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/collections"    element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/favorites"      element={<Favorites />} />
          <Route path="/search"         element={<Search />} />
          <Route path="/settings"       element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
