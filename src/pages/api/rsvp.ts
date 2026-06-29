import type { APIRoute } from 'astro';
import {
  getSessionFromCookies,
  SESSION_COOKIE,
  errorResponse,
  jsonResponse,
  getEnvSecret,
  getDb,
} from '../../lib/auth';
import { updateGuestRsvp } from '../../lib/db';

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
    return errorResponse('Please sign in to RSVP', 401);
  }

  let body: {
    attending?: string;
    guestCount?: number;
    dietaryNotes?: string | null;
    message?: string | null;
    email?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body');
  }

  const attending = body.attending;
  if (attending !== 'yes' && attending !== 'no' && attending !== 'maybe') {
    return errorResponse('Please select whether you will attend');
  }

  const guestCount =
    attending === 'yes' ? Math.min(Math.max(body.guestCount ?? 1, 1), 10) : 0;

  await updateGuestRsvp(db, session.guestId, {
    attending,
    guest_count: guestCount,
    dietary_notes: body.dietaryNotes,
    message: body.message,
    email: body.email,
  });

  return jsonResponse({ success: true });
};
