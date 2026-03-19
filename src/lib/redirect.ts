/**
 * redirect パラメータを検証し、安全な値のみ返す。
 * 同一オリジンの相対パスのみ許可。外部URLはnullを返す。
 */
export function getSafeRedirect(): string | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('redirect');
  if (!raw) return null;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.origin === window.location.origin ? parsed.pathname + parsed.search : null;
  } catch {
    return null;
  }
}
