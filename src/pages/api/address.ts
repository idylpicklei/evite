import type { APIRoute } from 'astro';
import {
  getSessionFromCookies,
  SESSION_COOKIE,
  errorResponse,
  jsonResponse,
  getEnvSecret,
  getDb,
} from '../../lib/auth';
import { upsertMailingAddress } from '../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const secret = getEnvSecret(locals);
  const db = getDb(locals);

  if (!secret) {
    return errorResponse('Server configuration error', 500);
  }

  if (!db) {
    return errorResponse('Database unavailable', 503);
  }

  const session = await getSessionFromCookies(cookies.get(SESSION_COOKIE)?.value, secret);

  if (!session) {
    return errorResponse('Please sign in to save your address', 401);
  }

  let body: {
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string | null;
    postalCode?: string;
    country?: string;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body');
  }

  const line1 = body.line1?.trim();
  const city = body.city?.trim();
  const postalCode = body.postalCode?.trim();
  const country = body.country?.trim() || 'US';

  if (!line1 || !city || !postalCode) {
    return errorResponse('Street address, city, and postal code are required');
  }

  await upsertMailingAddress(db, session.guestId, {
    line1,
    line2: body.line2?.trim() || null,
    city,
    state: body.state?.trim() || null,
    postal_code: postalCode,
    country,
  });

  return jsonResponse({ success: true });
};
