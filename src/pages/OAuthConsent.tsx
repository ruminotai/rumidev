import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { t, type Language } from '../lib/i18n';
import { motion } from 'motion/react';
import { Check, X, AlertCircle, Shield, ArrowRight } from 'lucide-react';

type Status =
  | 'loading'
  | 'no-auth'
  | 'consent'
  | 'already-approved'
  | 'approving'
  | 'denying'
  | 'error';

type AuthDetails = {
  authorization_id: string;
  client: { name: string };
  redirect_uri: string;
  scope: string;
};

export default function OAuthConsent() {
  const [status, setStatus] = useState<Status>('loading');
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorizationId = params.get('authorization_id');

    if (!authorizationId) {
      setErrorMsg('Missing authorization_id');
      setStatus('error');
      return;
    }

    // localStorage から言語設定を復元
    try {
      const stored = localStorage.getItem('rumi_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}

    // 認証チェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // 未ログイン → /login にリダイレクト（戻り先を保持）
        const returnUrl = `${window.location.origin}/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
        window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
        return;
      }

      // 認可詳細を取得
      fetchAuthorizationDetails(authorizationId);
    });
  }, []);

  async function fetchAuthorizationDetails(authorizationId: string) {
    try {
      const { data, error } =
        await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

      if (error || !data) {
        setErrorMsg(error?.message ?? 'Invalid authorization request');
        setStatus('error');
        return;
      }

      // 既に同意済み → redirect_url だけ返ってくるケース
      if ('redirect_url' in data && !('authorization_id' in data)) {
        setStatus('already-approved');
        window.location.href = (data as { redirect_url: string }).redirect_url;
        return;
      }

      setAuthDetails(data as AuthDetails);
      setStatus('consent');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }

  async function handleApprove() {
    if (!authDetails) return;
    setStatus('approving');

    try {
      const { data, error } = await supabase.auth.oauth.approveAuthorization(
        authDetails.authorization_id
      );

      if (error || !data) {
        setErrorMsg(error?.message ?? 'Failed to approve');
        setStatus('error');
        return;
      }

      window.location.href = (data as { redirect_to: string }).redirect_to;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }

  async function handleDeny() {
    if (!authDetails) return;
    setStatus('denying');

    try {
      const { data, error } = await supabase.auth.oauth.denyAuthorization(
        authDetails.authorization_id
      );

      if (error || !data) {
        setErrorMsg(error?.message ?? 'Failed to deny');
        setStatus('error');
        return;
      }

      window.location.href = (data as { redirect_to: string }).redirect_to;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }

  const scopes = authDetails?.scope?.trim().split(' ').filter(Boolean) ?? [];

  const scopeLabels: Record<string, Record<Language, string>> = {
    openid: {
      en: 'Verify your identity',
      ja: 'あなたの身元を確認',
      zh: '验证您的身份', ko: '신원 확인',
      es: 'Verificar tu identidad', fr: 'Vérifier votre identité',
      de: 'Ihre Identität bestätigen', pt: 'Verificar sua identidade',
      ru: 'Подтвердить вашу личность', ar: 'التحقق من هويتك',
    },
    email: {
      en: 'View your email address',
      ja: 'メールアドレスを表示',
      zh: '查看您的邮箱地址', ko: '이메일 주소 보기',
      es: 'Ver tu correo electrónico', fr: 'Voir votre adresse email',
      de: 'Ihre E-Mail-Adresse anzeigen', pt: 'Ver seu endereço de e-mail',
      ru: 'Просмотр вашего email', ar: 'عرض عنوان بريدك الإلكتروني',
    },
    profile: {
      en: 'View your profile information',
      ja: 'プロフィール情報を表示',
      zh: '查看您的个人资料', ko: '프로필 정보 보기',
      es: 'Ver tu información de perfil', fr: 'Voir vos informations de profil',
      de: 'Ihre Profilinformationen anzeigen', pt: 'Ver suas informações de perfil',
      ru: 'Просмотр информации профиля', ar: 'عرض معلومات ملفك الشخصي',
    },
    phone: {
      en: 'View your phone number',
      ja: '電話番号を表示',
      zh: '查看您的电话号码', ko: '전화번호 보기',
      es: 'Ver tu número de teléfono', fr: 'Voir votre numéro de téléphone',
      de: 'Ihre Telefonnummer anzeigen', pt: 'Ver seu número de telefone',
      ru: 'Просмотр номера телефона', ar: 'عرض رقم هاتفك',
    },
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] text-neutral-300 items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Loading / Redirecting */}
        {(status === 'loading' || status === 'already-approved') && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-400">
              {status === 'already-approved'
                ? t('consent.redirecting', language)
                : t('consent.loading', language)}
            </p>
          </div>
        )}

        {/* Consent Screen */}
        {status === 'consent' && authDetails && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={24} className="text-neutral-400" />
              <h2 className="text-xl font-bold text-white">
                {t('consent.title', language)}
              </h2>
            </div>

            <p className="text-sm text-neutral-400 mb-6">
              <span className="text-white font-medium">
                {authDetails.client.name}
              </span>
              {' '}{t('consent.wantsAccess', language)}
            </p>

            {/* Scopes */}
            {scopes.length > 0 && (
              <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-4 mb-6 space-y-3">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  {t('consent.permissions', language)}
                </p>
                {scopes.map((scope) => (
                  <div key={scope} className="flex items-center gap-2.5 text-sm">
                    <Check size={14} className="text-neutral-500 shrink-0" />
                    <span className="text-neutral-300">
                      {scopeLabels[scope]?.[language] ?? scopeLabels[scope]?.en ?? scope}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                className="flex-1 border border-[#252525] rounded-xl py-2.5 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2 text-sm text-neutral-400"
              >
                <X size={16} />
                {t('consent.deny', language)}
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white font-medium rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {t('consent.approve', language)}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Approving / Denying */}
        {(status === 'approving' || status === 'denying') && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-400">
              {t('consent.redirecting', language)}
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
            <AlertCircle size={32} className="text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {t('consent.errorTitle', language)}
            </h2>
            <p className="text-sm text-neutral-400 mb-2">
              {t('consent.errorDesc', language)}
            </p>
            {errorMsg && (
              <p className="text-xs text-rose-400/70 bg-rose-500/10 rounded-lg p-2 mt-3">
                {errorMsg}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
