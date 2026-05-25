import { StrictMode, lazy, Suspense } from 'react';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/oauth/consent" element={<OAuthConsent />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
