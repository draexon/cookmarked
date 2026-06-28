import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import Logo from './Logo';
import { login, register } from '../api/reelService';
import { API_BASE } from '../api/config';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegistering && !name.trim())) {
      setError('Please fill in all credential fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Dynamic ambient background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-primary-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Render Trademark Bookmark Logo with Stars */}
        <Logo className="mb-6 animate-bounce-slow" />
        
        <h2 className="text-center font-display font-extrabold text-3xl text-on-surface tracking-tight leading-9">
          {isRegistering ? 'Create account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-on-surface-muted leading-5 flex items-center gap-1.5 font-display">
          Your reel universe awaits <Sparkles className="w-4 h-4 text-primary-orange" />
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-brand-outline-variant/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-[#584237] mb-2 font-display">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-surface-low border border-brand-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  placeholder="Maya Rivera"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-[#584237] mb-2 font-display">
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-muted/40">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-surface-low border border-brand-outline-variant/30 rounded-lg text-sm text-on-surface placeholder-on-surface-muted/40 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all font-sans"
                  placeholder="maya@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-[#584237] font-display">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setError('Password reset is available through the backend API.')}
                  className="text-xs font-semibold text-primary-orange hover:text-primary tracking-wide font-display transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-muted/40">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-surface-low border border-brand-outline-variant/30 rounded-lg text-sm text-on-surface placeholder-on-surface-muted/40 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all font-sans"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-muted/40 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Authentication mode switch */}
            <div className="p-3 bg-primary-container/30 border border-primary-orange/20 rounded-lg text-[11px] text-primary flex items-start gap-2 leading-relaxed">
              <KeyRound className="w-4 h-4 text-primary-orange flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{isRegistering ? 'Already registered?' : 'New to CookMarked?'}</span>{' '}
                <button type="button" className="underline" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
                  {isRegistering ? 'Sign in' : 'Create an account'}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-orange to-primary hover:from-primary hover:to-primary-orange focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange focus:outline-none disabled:opacity-50 transition-all font-display shadow-[0_4px_12px_rgba(249,115,22,0.2)] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  isRegistering ? 'Create Account' : 'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-outline-variant/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-muted/50">or</span>
            <div className="h-px flex-1 bg-brand-outline-variant/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-brand-outline-variant/30 rounded-lg bg-white text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors font-display cursor-pointer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h6.5a5.6 5.6 0 0 1-2.4 3.6v2.8h3.7c2.2-2 3.7-5 3.7-8.5Z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.8-1 7.8-3.2L16.1 18a7.1 7.1 0 0 1-10.6-3.7H1.7v2.9A11.8 11.8 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.5 14.3a7.2 7.2 0 0 1 0-4.6V6.8H1.7a12 12 0 0 0 0 10.4l3.8-2.9Z" />
              <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 11.8 11.8 0 0 0 1.7 6.8l3.8 2.9A7 7 0 0 1 12 4.8Z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
