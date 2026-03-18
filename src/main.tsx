import { StrictMode } from 'react';
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase.ts';
import { getLocalProfile, fetchAndCacheProfile } from './lib/profile.ts';
import Login from './pages/Login.tsx';
import Home from './pages/Home.tsx';
import OAuthConsent from './pages/OAuthConsent.tsx';
import './index.css';

function RootRedirect() {
  const [checked, setChecked] = useState(false);
  const [target, setTarget] = useState('/login');

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setTarget('/login');
        setChecked(true);
        return;
      }

      const userId = session.user.id;

      // localStorage を確認（user_id 一致のみ）
      if (getLocalProfile(userId)) {
        setTarget('/home');
        setChecked(true);
        return;
      }

      // localStorage になければ KV から取得
      const kvProfile = await fetchAndCacheProfile(session.access_token, userId);
      if (kvProfile) {
        setTarget('/home');
        setChecked(true);
        return;
      }

      setTarget('/login');
      setChecked(true);
    };

    check();
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen w-full bg-[#0a0a0a] items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    );
  }

  return <Navigate to={target} replace />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
