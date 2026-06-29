import type { APIRoute } from 'astro';
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE,
  errorResponse,
  jsonResponse,
  getEnvSecret,
  getDb,
} from '../../../lib/auth';
import { findGuestByCodeAndName } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const secret = getEnvSecret(locals);
  const db = getDb(locals);

  if (!secret) {
    return errorResponse('Server configuration error', 500);
  }

  if (!db) {
    return errorResponse('Database unavailable', 503);
  }

  let body: { fullName?: string; inviteCode?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body');
  }

  const fullName = body.fullName?.trim();
  const inviteCode = body.inviteCode?.trim();

  if (!fullName || !inviteCode) {
    return errorResponse('Full name and invite code are required');
  }

  const guest = await findGuestByCodeAndName(db, inviteCode, fullName);

  if (!guest) {
    return errorResponse('Invalid name or invite code. Please check your invitation.');
  }

  const token = await createSessionToken(
    { guestId: guest.id, fullName: guest.full_name },
    secret,
  );

  cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());

  return jsonResponse({ success: true, guestId: guest.id });
};
