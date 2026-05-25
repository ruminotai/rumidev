import { StrictMode } from 'react';
import { lazy, Suspense, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import './index.css';

const Login = lazy(() => import('./pages/Login.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const OAuthConsent = lazy(() => import('./pages/OAuthConsent.tsx'));

function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] items-center justify-center">
      <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
    </div>
  );
}

function RootRedirect() {
  const [checked, setChecked] = useState(false);
  const [target, setTarget] = useState('/login');

  useEffect(() => {
    const check = async () => {
      const [{ supabase }, { getLocalProfile, fetchAndCacheProfile }] = await Promise.all([
        import('./lib/supabase.ts'),
        import('./lib/profile.ts'),
      ]);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setTarget('/login');
        setChecked(true);
        return;
      }

      const userId = session.user.id;

      // localStorage を確認（user_id 一致のみ）
      if (getLocalProfile(userId)) {
        setTarget('/profile');
        setChecked(true);
        return;
      }

      // localStorage になければ KV から取得
      const kvProfile = await fetchAndCacheProfile(session.access_token, userId);
      if (kvProfile) {
        setTarget('/profile');
        setChecked(true);
        return;
      }

      setTarget('/login');
      setChecked(true);
    };

    check();
  }, []);

  if (!checked) {
    return <LoadingScreen />;
  }

  return <Navigate to={target} replace />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/oauth/consent" element={<OAuthConsent />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
