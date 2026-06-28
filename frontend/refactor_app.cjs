const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Imports
content = content.replace(
  `import AuthScreen from './components/AuthScreen';`,
  `import { useAuth, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';`
);

content = content.replace(/clearAuthToken,\n\s*/g, '');
content = content.replace(/completeOAuthLogin,\n\s*/g, '');
content = content.replace(/hasAuthToken,\n\s*/g, '');
content = content.replace(/updatePassword,\n\s*/g, '');

// 2. State & initialization
const initStateTarget = `  const isOAuthCallback = window.location.pathname === '/auth/callback';
  // Login Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(hasAuthToken() || isOAuthCallback);`;

const initStateReplacement = `  const { isLoaded, isSignedIn } = useAuth();
  // Login Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);`;

content = content.replace(initStateTarget, initStateReplacement);

// 3. Effects
const effectTarget = `  useEffect(() => {
    if (isOAuthCallback) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refreshToken = params.get('refresh_token');
      if (token && refreshToken) {
        completeOAuthLogin(token, refreshToken);
        window.history.replaceState({}, '', '/');
        void loadLibrary();
        return;
      }
      setApiError('Google sign-in did not return a valid session.');
      setIsLoading(false);
      return;
    }
    if (hasAuthToken()) {
      void loadLibrary();
    }
  }, [isOAuthCallback]);`;

const effectReplacement = `  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void loadLibrary();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
      setCurrentUser(null);
    }
  }, [isLoaded, isSignedIn]);`;

content = content.replace(effectTarget, effectReplacement);
content = content.replace(/clearAuthToken\(\);\n\s*/g, '');

// 4. Return handling
const returnTarget = `  if (isLoading) {
    return <div className="min-h-screen bg-app-bg flex items-center justify-center text-primary font-semibold">Loading your library...</div>;
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLoginSuccess} />;
  }`;

const returnReplacement = `  if (!isLoaded || isLoading) {
    return <div className="min-h-screen bg-app-bg flex items-center justify-center text-primary font-semibold">Loading your library...</div>;
  }`;

content = content.replace(returnTarget, returnReplacement);

const mainReturnTarget = `  return (
    <div className="flex h-screen bg-app-bg font-sans selection:bg-primary-orange/20 overflow-hidden">`;

const mainReturnReplacement = `  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-app-bg flex items-center justify-center py-12">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        {currentUser && (
          <div className="flex h-screen bg-app-bg font-sans selection:bg-primary-orange/20 overflow-hidden">`;

content = content.replace(mainReturnTarget, mainReturnReplacement);

const finalTagsRegex = /    <\/div>\n  \);\n}\n$/;
content = content.replace(finalTagsRegex, `          </div>\n        )}\n      </SignedIn>\n    </>\n  );\n}\n`);

// 5. Replace Profile Card
const profileCardRegex = /\{\/\* Profile Card Header \(Screen 1\) \*\/\}([\s\S]*?)<\/div>\n              <\/div>/;
const profileCardReplacement = `{/* Profile Card Header (Screen 1) */}
              <div className="bg-white rounded-2xl border border-brand-outline-variant/15 p-4 flex items-center gap-4 shadow-sm">
                <div className="scale-125 ml-2"><UserButton /></div>
                <div>
                  <h3 className="font-display font-black text-lg text-on-surface leading-tight">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-on-surface-muted/60 font-sans mt-0.5 leading-none">
                    {currentUser.email}
                  </p>
                </div>
              </div>`;
content = content.replace(profileCardRegex, profileCardReplacement);

// 6. Remove Security segment
const securityRegex = /\{\/\* Security segment box \(Screen 1\) \*\/\}[\s\S]*?Update Password\n                  <\/button>\n                <\/div>\n              <\/div>/;
content = content.replace(securityRegex, '');

fs.writeFileSync(appPath, content);
console.log('App.tsx refactored successfully.');
