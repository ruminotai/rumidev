import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { t, type Language, SUPPORTED_LANGUAGES } from '../lib/i18n';
import {
  type Profile,
  getLocalProfile,
  fetchAndCacheProfile,
  setLocalProfile,
  clearLocalProfile,
} from '../lib/profile';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut,
  Pencil,
  Save,
  X,
  Check,
  Camera,
  ChevronDown,
} from 'lucide-react';

const AVATAR_IMAGES = [
  '/images/icon_login.webp',
  '/images/icon_language.webp',
  '/images/icon_complete.webp',
  '/images/icon_profile.webp',
  '/images/icon_signup.webp',
];

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
};

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(0);
  const [editOccupation, setEditOccupation] = useState('');
  const [editLanguage, setEditLanguage] = useState<Language>('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const lang = profile?.language ?? 'en';

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      const userId = session.user?.id;

      // localStorage を確認
      let prof = getLocalProfile(userId);

      // localStorage になければ KV から取得
      if (!prof) {
        prof = await fetchAndCacheProfile(session.access_token, userId);
      }

      if (!prof) {
        navigate('/login', { replace: true });
        return;
      }

      setProfile(prof);
      setLoading(false);
    };

    check();
  }, [navigate]);

  useEffect(() => {
    if (!showLangDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLangDropdown]);

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.username);
    setEditAvatar(AVATAR_IMAGES.indexOf(profile.icon) >= 0 ? AVATAR_IMAGES.indexOf(profile.icon) : 0);
    setEditOccupation(profile.occupation ?? '');
    setEditLanguage(profile.language);
    setShowLangDropdown(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setShowLangDropdown(false);
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;

    const updated: Profile = {
      username: editName.trim(),
      language: editLanguage,
      icon: AVATAR_IMAGES[editAvatar],
      occupation: editOccupation.trim() || null,
      user_id: profile?.user_id,
    };

    setLocalProfile(updated);
    setProfile(updated);
    setEditing(false);
    setShowLangDropdown(false);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updated),
        });
      }
    } catch (e) {
      console.error('Failed to save profile to KV:', e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearLocalProfile();
    navigate('/login', { replace: true });
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen w-full bg-[#0a0a0a] items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-neutral-800">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute -inset-4">
          <img
            src="/images/left_complete.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: '30% center' }}
            draggable={false}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to right, transparent 0%, transparent 75%, #0a0a0a 100%),
                linear-gradient(to bottom, #0a0a0a 0%, transparent 6%, transparent 92%, #0a0a0a 100%)
              `,
            }}
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
        <div className="w-full max-w-md relative z-10 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0e0e0e] overflow-hidden shrink-0">
                  <img
                    src={profile.icon}
                    alt=""
                    className="w-full h-full object-cover scale-[2.0]"
                    draggable={false}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white leading-tight">
                    {t('home.greeting', lang)} {profile.username}
                  </h1>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {t('home.subtitle', lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* Saved toast */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20 mb-4"
                >
                  <Check size={14} className="shrink-0" />
                  <p>{t('home.saved', lang)}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile section */}
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0e0e0e] border-b border-[#1e1e1e]">
                <span className="text-xs font-medium text-neutral-400">
                  {t('home.profileSection', lang)}
                </span>
                {!editing ? (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <Pencil size={12} />
                    {t('home.edit', lang)}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      <X size={12} />
                      {t('home.cancel', lang)}
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={!editName.trim()}
                      className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white disabled:text-neutral-600 transition-colors"
                    >
                      <Save size={12} />
                      {t('home.save', lang)}
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                /* View mode */
                <div className="divide-y divide-[#1e1e1e]">
                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-[#0e0e0e] overflow-hidden shrink-0">
                      <img
                        src={profile.icon}
                        alt=""
                        className="w-full h-full object-cover scale-[2.0]"
                        draggable={false}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{profile.username}</p>
                      <p className="text-xs text-neutral-500">
                        {profile.occupation ?? t('home.notSet', lang)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-neutral-500">{t('home.language', lang)}</span>
                    <span className="text-sm text-neutral-300">{LANGUAGE_NAMES[profile.language]}</span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-neutral-500">{t('home.occupation', lang)}</span>
                    <span className="text-sm text-neutral-300">
                      {profile.occupation ?? t('home.notSet', lang)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Edit mode */
                <div className="p-4 space-y-4">
                  {/* Avatar selection */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-[#0e0e0e] overflow-hidden">
                        <img
                          src={AVATAR_IMAGES[editAvatar]}
                          alt=""
                          className="w-full h-full object-cover scale-[2.0]"
                          draggable={false}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={16} className="text-white/80" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {AVATAR_IMAGES.map((src, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditAvatar(idx)}
                          className={`w-9 h-9 rounded-full overflow-hidden transition-all duration-200 ${
                            editAvatar === idx
                              ? 'ring-2 ring-neutral-400 ring-offset-2 ring-offset-[#111111] scale-105'
                              : 'opacity-50 hover:opacity-80'
                          }`}
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover scale-[2.0]"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      {t('profile.nameLabel', lang)}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-neutral-600"
                      placeholder={t('profile.namePlaceholder', lang)}
                    />
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      {t('profile.occupationLabel', lang)}
                    </label>
                    <input
                      type="text"
                      value={editOccupation}
                      onChange={(e) => setEditOccupation(e.target.value)}
                      className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-neutral-600"
                      placeholder={t('profile.occupationPlaceholder', lang)}
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      {t('home.language', lang)}
                    </label>
                    <div className="relative" ref={langDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 px-4 text-sm text-neutral-200 flex items-center justify-between hover:border-[#333] transition-all"
                      >
                        <span>{LANGUAGE_NAMES[editLanguage]}</span>
                        <ChevronDown size={14} className={`text-neutral-500 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showLangDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 top-full mt-1 w-full bg-[#181818] border border-[#252525] rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
                          >
                            {SUPPORTED_LANGUAGES.map((lid) => (
                              <button
                                key={lid}
                                onClick={() => {
                                  setEditLanguage(lid);
                                  setShowLangDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                  editLanguage === lid
                                    ? 'text-white bg-[#222]'
                                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1c1c1c]'
                                }`}
                              >
                                {LANGUAGE_NAMES[lid]}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full border border-[#252525] rounded-xl py-2.5 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2 text-sm text-neutral-400 hover:text-neutral-200"
              >
                <LogOut size={16} />
                {t('home.logout', lang)}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
