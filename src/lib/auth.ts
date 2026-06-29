import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'guest_session';
const SESSION_DURATION = '7d';

export interface SessionPayload {
  guestId: number;
  fullName: string;
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(secret));
    const guestId = payload.guestId;
    const fullName = payload.fullName;

    if (typeof guestId !== 'number' || typeof fullName !== 'string') {
      return null;
    }

    return { guestId, fullName };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export async function getSessionFromCookies(
  cookieValue: string | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  return verifySessionToken(cookieValue, secret);
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function getEnvSecret(locals: App.Locals): string | null {
  const secret = locals.runtime?.env?.SESSION_SECRET;
  return secret || null;
}

export function getDb(locals: App.Locals): D1Database | null {
  return locals.runtime?.env?.DB ?? null;
}
