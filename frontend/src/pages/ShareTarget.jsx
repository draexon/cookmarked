import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { saveReel } from '../api/reelService';
import { Check, Loader2, X } from 'lucide-react';
import Logo from '../components/Logo';

export default function ShareTarget() {
  const { isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState('saving'); // 'saving', 'success', 'error'
  
  useEffect(() => {
    if (!isLoaded) return;
    
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    
    if (!sharedUrl) {
      setStatus('error');
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
      }, 2000);
      return;
    }

    if (!isSignedIn) {
      localStorage.setItem('pending_share', sharedUrl);
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
      return;
    }

    // Auto-save silently
    saveReel({ url: sharedUrl })
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          try {
            window.close(); // Try closing the PWA/Tab directly
          } catch (e) {
            // ignore
          }
          // Fallback to home if window.close() is blocked
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }, 1500);
      })
      .catch((err) => {
        console.error('Error saving shared reel:', err);
        setStatus('error');
        setTimeout(() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }, 2000);
      });
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6 text-on-surface">
      <Logo className="w-12 h-12 mb-8 animate-pulse" />
      
      {status === 'saving' && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <Loader2 className="w-8 h-8 text-primary-orange animate-spin" />
          <p className="font-semibold tracking-wide">Saving to AllMarked...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 bg-white px-10 py-8 rounded-3xl shadow-xl border border-brand-outline-variant/10 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Saved! <span role="img" aria-label="check">✅</span></h2>
          <p className="text-sm font-medium text-on-surface-muted">You can safely close this window.</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 bg-white px-10 py-8 rounded-3xl shadow-xl border border-red-100 animate-in zoom-in-95 duration-300">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <X className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Failed to save</h2>
          <p className="text-sm font-medium text-on-surface-muted">Redirecting...</p>
        </div>
      )}
    </div>
  );
}
