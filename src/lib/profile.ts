import type { Language } from './i18n';

export interface Profile {
  username: string;
  language: Language;
  icon: string;
  occupation: string | null;
}

const STORAGE_KEY = 'rumi_profile';

/**
 * localStorage からプロフィールを取得。
 * username が存在しなければ null を返す。
 */
export function getLocalProfile(): Profile | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Profile;
    if (parsed.username) return parsed;
  } catch {}
  return null;
}

/**
 * localStorage にプロフィールを保存。
 */
export function setLocalProfile(profile: Profile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/**
 * localStorage のプロフィールを削除。
 */
export function clearLocalProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * KV からプロフィールを取得し、成功すれば localStorage にキャッシュして返す。
 * 失敗・404・不正データなら null を返す。
 */
export async function fetchAndCacheProfile(accessToken: string): Promise<Profile | null> {
  try {
    console.log('[profile] fetching from KV...');
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    console.log('[profile] KV response status:', res.status);
    if (!res.ok) {
      const errBody = await res.text();
      console.log('[profile] KV error body:', errBody);
      return null;
    }

    const data = await res.json() as Profile;
    console.log('[profile] KV data:', data);
    if (!data.username) return null;

    setLocalProfile(data);
    return data;
  } catch (e) {
    console.error('[profile] KV fetch exception:', e);
    return null;
  }
}
