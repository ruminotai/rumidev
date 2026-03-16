import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  ArrowRight,
  Check,
  Camera,
  AlertCircle,
  Github,
} from 'lucide-react';

const IMAGES = {
  sign_login:     '/images/sign_login.png',
  sign_signup:    '/images/sign_signup.png',
  sign_enjoy:     '/images/sign_enjoy.png',
  icon_login:     '/images/icon_login.png',
  icon_signup:    '/images/icon_signup.png',
  icon_language:  '/images/icon_language.png',
  icon_profile:   '/images/icon_profile.png',
  icon_complete:  '/images/icon_complete.png',
  left_login:     '/images/left_login.png',
  left_signup:    '/images/left_signup.png',
  left_language:  '/images/left_language.png',
  left_profile:   '/images/left_profile.png',
  left_complete:  '/images/left_complete.png',
  lang_ja:        '/images/lang_ja.png',
  lang_en:        '/images/lang_en.png',
  lang_es:        '/images/lang_es.png',
  lang_zh:        '/images/lang_zh.png',
  avatar_1:       '/images/icon_login.png',
  avatar_2:       '/images/icon_language.png',
  avatar_3:       '/images/icon_complete.png',
  avatar_4:       '/images/icon_profile.png',
  avatar_5:       '/images/icon_signup.png',
} as const;

function LeftPanel({ step, isLoginMode }: { step: number; isLoginMode: boolean }) {
  const img = (() => {
    if (step === 1 && !isLoginMode) return { src: IMAGES.left_signup, key: 'left_signup' };
    if (step === 1) return { src: IMAGES.left_login, key: 'left_login' };
    if (step === 2) return { src: IMAGES.left_language, key: 'left_language' };
    if (step === 3) return { src: IMAGES.left_profile, key: 'left_profile' };
    return { src: IMAGES.left_complete, key: 'left_complete' };
  })();

  return (
    <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={img.key}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -inset-4"
        >
          <img
            src={img.src}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [language, setLanguage] = useState('ja');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const avatarImages = [
    IMAGES.avatar_1,
    IMAGES.avatar_2,
    IMAGES.avatar_3,
    IMAGES.avatar_4,
    IMAGES.avatar_5,
  ];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (email === 'aaa' && password === 'aaa') {
        setLoginError('');
        setStep(2);
      } else {
        setLoginError(
          'メールアドレスまたはパスワードが間違っています。(aaa / aaa を入力してください)'
        );
      }
    } else {
      if (email && password) {
        setLoginError('');
        setStep(2);
      } else {
        setLoginError('メールアドレスとパスワードを入力してください。');
      }
    }
  };

  const handleOAuth = () => setStep(2);
  const nextStep = () => setStep((s) => s + 1);

  const languages = [
    { id: 'ja', name: '日本語', native: 'Japanese', image: IMAGES.lang_ja },
    { id: 'en', name: 'English', native: 'English', image: IMAGES.lang_en },
    { id: 'es', name: 'Español', native: 'Spanish', image: IMAGES.lang_es },
    { id: 'zh', name: '中文', native: 'Chinese', image: IMAGES.lang_zh },
  ];

  const signImage = isLoginMode ? IMAGES.sign_login : IMAGES.sign_signup;
  const signKey = isLoginMode ? 'login' : 'signup';

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-neutral-800">
      <LeftPanel step={step} isLoginMode={isLoginMode} />

      <div className="w-full lg:w-[48%] flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
        <div className="w-full max-w-md relative z-10 py-8">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Auth ── */}
            {step === 1 && (
              <motion.div
                key={`step1-${isLoginMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border border-[#1e1e1e] rounded-2xl overflow-hidden"
              >
                <div className="relative h-56 flex items-end justify-center overflow-hidden bg-[#0e0e0e]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={signKey}
                      src={signImage}
                      alt=""
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-48 w-auto object-contain mix-blend-screen"
                      draggable={false}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
                </div>

                <div className="px-8 pb-8 pt-1">
                  <h1 className="text-2xl font-bold text-white mb-1.5">
                    {isLoginMode ? 'おかえりなさい' : 'はじめまして'}
                  </h1>
                  <p className="text-sm text-neutral-400 mb-6">
                    {isLoginMode
                      ? 'Rumi AIへようこそ。ログインして続けましょう。'
                      : 'Rumi AIを始めましょう。アカウントを作成してください。'}
                  </p>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400 ml-1">
                        メールアドレス
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
                          <Mail size={16} />
                        </div>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-neutral-600"
                          placeholder={isLoginMode ? 'aaa' : 'name@example.com'}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400 ml-1">
                        パスワード
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
                          <Lock size={16} />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-neutral-600"
                          placeholder={isLoginMode ? 'aaa' : '••••••••'}
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p>{loginError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white font-medium rounded-xl py-2.5 mt-2 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {isLoginMode ? 'ログイン' : 'アカウントを作成'}
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div className="mt-5">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#1e1e1e]" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-[#111111] px-2 text-neutral-600">
                          または
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <button
                        type="button"
                        onClick={handleOAuth}
                        className="flex items-center justify-center py-2.5 border border-[#252525] rounded-xl hover:bg-[#1a1a1a] transition-colors bg-[#151515]"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleOAuth}
                        className="flex items-center justify-center py-2.5 border border-[#252525] rounded-xl hover:bg-[#1a1a1a] transition-colors bg-[#151515]"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 21 21">
                          <path fill="#f25022" d="M1 1h9v9H1z" />
                          <path fill="#00a4ef" d="M1 11h9v9H1z" />
                          <path fill="#7fba00" d="M11 1h9v9h-9z" />
                          <path fill="#ffb900" d="M11 11h9v9h-9z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleOAuth}
                        className="flex items-center justify-center py-2.5 border border-[#252525] rounded-xl hover:bg-[#1a1a1a] transition-colors bg-[#151515]"
                      >
                        <Github size={20} className="text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setLoginError('');
                      }}
                      className="text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      {isLoginMode
                        ? 'アカウントをお持ちでないですか？ 新規登録'
                        : 'すでにアカウントをお持ちですか？ ログイン'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Language ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  言語を選択
                </h2>
                <p className="text-sm text-neutral-400 mb-6">
                  AIとの会話やインターフェースの言語を選択してください。
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {languages.map((lang) => {
                    const selected = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                          selected
                            ? 'border-[#333] bg-[#1a1a1a]'
                            : 'border-[#1e1e1e] bg-[#131313] hover:border-[#2a2a2a] hover:bg-[#171717]'
                        }`}
                      >
                        <div className="h-32 flex items-center justify-center overflow-hidden relative bg-[#0e0e0e]">
                          <img
                            src={lang.image}
                            alt={lang.name}
                            className="h-28 w-auto object-contain mix-blend-screen"
                            draggable={false}
                          />
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2.5 right-2.5 w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center"
                            >
                              <Check
                                size={14}
                                className="text-black"
                                strokeWidth={3}
                              />
                            </motion.div>
                          )}
                        </div>
                        <div className="px-3 py-3 text-center border-t border-[#1e1e1e]">
                          <p
                            className={`text-sm font-medium ${
                              selected ? 'text-white' : 'text-neutral-300'
                            }`}
                          >
                            {lang.name}
                          </p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">
                            {lang.native}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white font-medium rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  次へ
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Profile ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  プロフィール設定
                </h2>
                <p className="text-sm text-neutral-400 mb-8">
                  表示名とアイコンを設定しましょう。
                </p>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer mb-5">
                    <div className="w-24 h-24 rounded-full bg-[#0e0e0e] overflow-hidden">
                      <img
                        src={avatarImages[selectedAvatar]}
                        alt=""
                        className="w-full h-full object-cover scale-[2.0]"
                        draggable={false}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white/80" />
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-center">
                    {avatarImages.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAvatar(idx)}
                        className={`w-11 h-11 rounded-full overflow-hidden transition-all duration-200 ${
                          selectedAvatar === idx
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

                <div className="space-y-1.5 mb-8">
                  <label className="text-xs font-medium text-neutral-400 ml-1">
                    表示名
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#252525] rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-neutral-600"
                    placeholder="例: Taro Yamada"
                  />
                </div>

                <button
                  onClick={nextStep}
                  disabled={!name.trim()}
                  className="w-full bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white disabled:bg-[#1e1e1e] disabled:text-neutral-600 font-medium rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  完了する
                  <Check size={16} />
                </button>
              </motion.div>
            )}

            {/* ── Step 4: Complete ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="bg-[#111111] border border-[#1e1e1e] rounded-2xl overflow-hidden text-center"
              >
                <div className="relative h-56 flex items-end justify-center overflow-hidden bg-[#0e0e0e]">
                  <motion.img
                    src={IMAGES.sign_enjoy}
                    alt=""
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', damping: 18 }}
                    className="h-48 w-auto object-contain mix-blend-screen"
                    draggable={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
                </div>

                <div className="px-10 pb-10 pt-2 flex flex-col items-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    セットアップ完了！
                  </h2>
                  <p className="text-sm text-neutral-400 mb-8">
                    {name}さん、準備が整いました。
                    <br />
                    AIとの新しい会話を始めましょう。
                  </p>
                  <button
                    onClick={() =>
                      alert('チャット画面へ遷移します (デモ終了)')
                    }
                    className="w-full bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white font-medium rounded-xl py-3 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    チャットを始める
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
