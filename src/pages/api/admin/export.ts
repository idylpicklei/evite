import type { APIRoute } from 'astro';
import { exportGuestData } from '../../../lib/db';
import { getDb } from '../../../lib/auth';

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return 'full_name,invite_code,email,attending,guest_count,dietary_notes,message,rsvp_at,line1,line2,city,state,postal_code,country\n';
  }

  const headers = Object.keys(rows[0]);

  const escape = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  return lines.join('\n');
}

export const GET: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals);

  if (!db) {
    return new Response('Database unavailable', { status: 503 });
  }

  const adminSecret = locals.runtime?.env?.ADMIN_EXPORT_SECRET;
  const authHeader = request.headers.get('Authorization');
  const querySecret = new URL(request.url).searchParams.get('secret');

  if (!adminSecret) {
    return new Response('Export not configured', { status: 503 });
  }

  const providedSecret =
    authHeader?.replace(/^Bearer\s+/i, '') ?? querySecret ?? '';

  if (providedSecret !== adminSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rows = await exportGuestData(db);
  const csv = toCsv(rows);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rsvps.csv"',
    },
  });
};
