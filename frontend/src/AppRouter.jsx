import React, { useEffect, useState } from 'react';
import { useAuth, SignIn } from '@clerk/clerk-react';
import Landing from './pages/Landing';
import App from './App';
import ShareTarget from './pages/ShareTarget';

export default function AppRouter() {
  const { isLoaded, isSignedIn } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    // Custom patch for pushState/replaceState to detect in-app navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center text-primary-orange font-semibold">
        Loading...
      </div>
    );
  }

  // Handle Share Target specifically before catching signed-in users
  if (currentPath.startsWith('/share-target')) {
    return <ShareTarget />;
  }

  // Signed In Users are always shown the App (Dashboard)
  if (isSignedIn) {
    return <App />;
  }

  // Signed Out Users routing
  if (currentPath === '/login') {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center py-12 px-4 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-orange/5 blur-[120px] pointer-events-none" />
        
        <button
          onClick={() => window.history.pushState({}, '', '/')}
          className="mb-8 text-xs font-bold text-primary-orange hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 z-10"
        >
          ← Back to Home
        </button>
        <div className="z-10">
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  // Default route (signed out) -> show Landing page
  return <Landing />;
}
