import { jwtVerify, createRemoteJWKSet } from 'jose';

interface Env {
  PROFILES: KVNamespace;
  VITE_SUPABASE_URL: string;
}

type ProfileData = {
  username: string;
  language: string;
  icon: string | null;
  occupation: string | null;
  updated_at: string;
};

const ALLOWED_LANGUAGES = ['en','ja','zh','ko','es','fr','de','pt','ru','ar'];
const ALLOWED_ICONS = [
  '/images/icon_login.webp',
  '/images/icon_language.webp',
  '/images/icon_complete.webp',
  '/images/icon_profile.webp',
  '/images/icon_signup.webp',
];

const ALLOWED_ORIGINS = [
  'https://rumiai.dev',
  'http://localhost:8788',
  'http://localhost:3000',
  'http://127.0.0.1:8788',
  'http://127.0.0.1:3000',
];

// JWKS — jose が内部でキャッシュしてくれる
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(supabaseUrl: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
    );
  }
  return jwks;
}

async function getUserIdFromToken(
  request: Request,
  supabaseUrl: string
): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const { payload } = await jwtVerify(token, getJWKS(supabaseUrl), {
    issuer: `${supabaseUrl}/auth/v1`,
  });

  if (!payload.sub) {
    throw new Error('Token missing sub claim');
  }

  return payload.sub;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  request: Request
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
    },
  });
}

// OPTIONS
export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
};

// GET /api/profile
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const userId = await getUserIdFromToken(request, env.VITE_SUPABASE_URL);
    const profile = await env.PROFILES.get(userId, 'text');

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, 404, request);
    }

    return jsonResponse(JSON.parse(profile), 200, request);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return jsonResponse({ error: message }, 401, request);
  }
};

// POST /api/profile
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const userId = await getUserIdFromToken(request, env.VITE_SUPABASE_URL);

    const body = await request.json<{
      username?: string;
      language?: string;
      icon?: string | null;
      occupation?: string | null;
    }>();

    if (!body.username?.trim()) {
      return jsonResponse({ error: 'username is required' }, 400, request);
    }
    if (body.username.trim().length > 50) {
      return jsonResponse({ error: 'username too long' }, 400, request);
    }
    if (body.language && !ALLOWED_LANGUAGES.includes(body.language)) {
      return jsonResponse({ error: 'invalid language' }, 400, request);
    }
    if (body.icon && !ALLOWED_ICONS.includes(body.icon)) {
      return jsonResponse({ error: 'invalid icon' }, 400, request);
    }
    if (body.occupation && body.occupation.length > 100) {
      return jsonResponse({ error: 'occupation too long' }, 400, request);
    }

    const profile: ProfileData = {
      username: body.username.trim(),
      language: body.language || 'en',
      icon: body.icon ?? null,
      occupation: body.occupation ?? null,
      updated_at: new Date().toISOString(),
    };

    await env.PROFILES.put(userId, JSON.stringify(profile));

    return jsonResponse(profile as unknown as Record<string, unknown>, 200, request);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return jsonResponse({ error: 'Invalid JSON' }, 400, request);
    }
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return jsonResponse({ error: message }, 401, request);
  }
};
