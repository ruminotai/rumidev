import type { Language } from './i18n';

export interface Profile {
  username: string;
  language: Language;
  icon: string;
  occupation: string | null;
  user_id?: string;
}

const STORAGE_KEY = 'rumi_profile';

/**
 * localStorage からプロフィールを取得。
 * username が存在しなければ null を返す。
 * userId が渡された場合、一致しなければ null を返す。
 */
export function getLocalProfile(userId?: string): Profile | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Profile;
    if (!parsed.username) return null;
    if (userId && parsed.user_id !== userId) return null;
    return parsed;
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
export async function fetchAndCacheProfile(accessToken: string, userId?: string): Promise<Profile | null> {
  try {
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;

    const data = await res.json() as Profile;
    if (!data.username) return null;

    if (userId) {
      data.user_id = userId;
    }
    setLocalProfile(data);
    return data;
  } catch {
    return null;
  }
}
