import type { Language } from './i18n';

export interface Profile {
  user_id: string;
  username: string;
  language: Language;
  icon: string;
  occupation: string | null;
}

const STORAGE_KEY = 'rumi_profile';

/**
 * localStorage からプロフィールを取得。
 * userId が指定された場合、user_id が一致しなければ null を返す。
 */
export function getLocalProfile(userId?: string): Profile | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Profile;
    if (!parsed.username) return null;
    if (userId && parsed.user_id !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
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
 * userId を付与して保存する（KV のレスポンスには user_id が含まれないため）。
 */
export async function fetchAndCacheProfile(
  accessToken: string,
  userId: string
): Promise<Profile | null> {
  try {
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.username) return null;

    const profile: Profile = {
      user_id: userId,
      username: data.username,
      language: data.language || 'en',
      icon: data.icon || '/images/icon_login.webp',
      occupation: data.occupation ?? null,
    };

    setLocalProfile(profile);
    return profile;
  } catch {
    return null;
  }
}
