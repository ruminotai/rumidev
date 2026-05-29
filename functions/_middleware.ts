interface Env {
  RUMIAI_ACCESS_PASSWORD?: string;
  RUMIAI_ACCESS_COOKIE_SECRET?: string;
}

const COOKIE_NAME = 'rumiai_access';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

export const onRequest: PagesFunction<Env> = async (context) => {
  const password = context.env.RUMIAI_ACCESS_PASSWORD?.trim();

  if (!password) {
    return context.next();
  }

  const requestUrl = new URL(context.request.url);
  const cookieSecret = context.env.RUMIAI_ACCESS_COOKIE_SECRET?.trim() || password;

  if (requestUrl.pathname === '/__rumiai_access' && context.request.method === 'POST') {
    return handlePasswordSubmit(context.request, password, cookieSecret);
  }

  if (await hasValidSession(context.request, cookieSecret)) {
    return context.next();
  }

  if (wantsJson(context.request)) {
    return jsonResponse({ error: 'Password required' }, 401);
  }

  return passwordPage(getRedirectTarget(requestUrl));
};

async function handlePasswordSubmit(
  request: Request,
  password: string,
  cookieSecret: string,
): Promise<Response> {
  const formData = await request.formData().catch(() => null);
  const submittedPassword = formData?.get('password');
  const redirect = normalizeRedirect(formData?.get('redirect'));

  if (typeof submittedPassword !== 'string' || !passwordsMatch(submittedPassword, password)) {
    return passwordPage(redirect, true);
  }

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const sessionValue = await createSessionValue(String(expiresAt), cookieSecret);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';

  return new Response(null, {
    status: 303,
    headers: {
      'Cache-Control': 'no-store',
      'Location': redirect,
      'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(sessionValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
    },
  });
}

async function hasValidSession(request: Request, secret: string): Promise<boolean> {
  const cookie = readCookie(request.headers.get('Cookie'), COOKIE_NAME);
  if (!cookie) return false;

  const [expiresAt, signature] = cookie.split('.');
  const expiresAtMs = Number(expiresAt);

  if (!expiresAt || !signature || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return false;
  }

  const expected = await sign(expiresAt, secret);
  return constantTimeEqual(signature, expected);
}

async function createSessionValue(expiresAt: string, secret: string): Promise<string> {
  const signature = await sign(expiresAt, secret);
  return `${expiresAt}.${signature}`;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64Url(signature);
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value.join('='));
    }
  }

  return null;
}

function passwordsMatch(input: string, expected: string): boolean {
  return input.length === expected.length && constantTimeEqual(input, expected);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return mismatch === 0;
}

function base64Url(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function wantsJson(request: Request): boolean {
  const url = new URL(request.url);
  const accept = request.headers.get('Accept') || '';
  return url.pathname.startsWith('/api/') || accept.includes('application/json');
}

function getRedirectTarget(url: URL): string {
  return normalizeRedirect(`${url.pathname}${url.search}`);
}

function normalizeRedirect(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/home';
  }

  if (value === '/' || value.startsWith('/__rumiai_access')) {
    return '/home';
  }

  return value;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

function passwordPage(redirect: string, hasError = false): Response {
  const escapedRedirect = escapeHtml(redirect);
  const errorHtml = hasError
    ? '<p class="error">Password did not match. Please try again.</p>'
    : '';

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>rumiai access</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0a0a0a;
        color: #e5e5e5;
      }
      * {
        box-sizing: border-box;
      }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.08), transparent 34%),
          radial-gradient(circle at 72% 18%, rgba(80,140,255,0.16), transparent 28%),
          #0a0a0a;
        padding: 24px;
      }
      main {
        width: min(100%, 420px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 14px;
        background: rgba(16,16,16,0.94);
        box-shadow: 0 24px 80px rgba(0,0,0,0.48);
        padding: 28px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      }
      .mark {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.12);
        background: #fff;
        color: #0a0a0a;
        font-weight: 800;
      }
      h1 {
        margin: 0;
        font-size: 26px;
        line-height: 1.15;
        letter-spacing: 0;
      }
      p {
        margin: 12px 0 0;
        color: #a3a3a3;
        font-size: 14px;
        line-height: 1.7;
      }
      form {
        margin-top: 24px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        color: #d4d4d4;
        font-size: 13px;
        font-weight: 600;
      }
      input {
        width: 100%;
        height: 46px;
        border: 1px solid #2b2b2b;
        border-radius: 10px;
        background: #171717;
        color: #fff;
        font: inherit;
        padding: 0 13px;
        outline: none;
      }
      input:focus {
        border-color: #5b5b5b;
      }
      button {
        width: 100%;
        height: 46px;
        margin-top: 14px;
        border: 0;
        border-radius: 10px;
        background: #f5f5f5;
        color: #0a0a0a;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }
      button:hover {
        background: #fff;
      }
      .error {
        margin-top: 14px;
        color: #fda4af;
      }
      .note {
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.1);
        color: #737373;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">
        <div class="mark">r</div>
        <strong>rumiai</strong>
      </div>
      <h1>Password required</h1>
      <p>This preview is temporarily restricted while public terms are being prepared.</p>
      <form method="post" action="/__rumiai_access" autocomplete="off">
        <input type="hidden" name="redirect" value="${escapedRedirect}" />
        <label for="password">Access password</label>
        <input id="password" name="password" type="password" required autofocus />
        <button type="submit">Continue</button>
        ${errorHtml}
      </form>
      <p class="note">By continuing, you understand this preview is provided as-is and use is at your own responsibility.</p>
    </main>
  </body>
</html>`, {
    status: hasError ? 401 : 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=UTF-8',
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}
