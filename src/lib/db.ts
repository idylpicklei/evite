export interface Guest {
  id: number;
  full_name: string;
  invite_code: string;
  email: string | null;
  attending: 'yes' | 'no' | 'maybe' | null;
  guest_count: number;
  dietary_notes: string | null;
  message: string | null;
  rsvp_at: string | null;
  created_at: string;
}

export interface MailingAddress {
  id: number;
  guest_id: number;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  updated_at: string;
}

export async function findGuestByCodeAndName(
  db: D1Database,
  inviteCode: string,
  fullName: string,
): Promise<Guest | null> {
  const result = await db
    .prepare(
      `SELECT * FROM guests
       WHERE invite_code = ? COLLATE NOCASE
       AND LOWER(TRIM(full_name)) = LOWER(TRIM(?))`,
    )
    .bind(inviteCode.trim(), fullName.trim())
    .first<Guest>();

  return result ?? null;
}

export async function findGuestById(db: D1Database, id: number): Promise<Guest | null> {
  const result = await db.prepare('SELECT * FROM guests WHERE id = ?').bind(id).first<Guest>();
  return result ?? null;
}

export async function updateGuestRsvp(
  db: D1Database,
  guestId: number,
  data: {
    attending: 'yes' | 'no' | 'maybe';
    guest_count: number;
    dietary_notes?: string | null;
    message?: string | null;
    email?: string | null;
  },
): Promise<void> {
  await db
    .prepare(
      `UPDATE guests SET
        attending = ?,
        guest_count = ?,
        dietary_notes = ?,
        message = ?,
        email = COALESCE(?, email),
        rsvp_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(
      data.attending,
      data.guest_count,
      data.dietary_notes ?? null,
      data.message ?? null,
      data.email ?? null,
      guestId,
    )
    .run();
}

export async function upsertMailingAddress(
  db: D1Database,
  guestId: number,
  data: {
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO mailing_addresses (guest_id, line1, line2, city, state, postal_code, country, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(guest_id) DO UPDATE SET
         line1 = excluded.line1,
         line2 = excluded.line2,
         city = excluded.city,
         state = excluded.state,
         postal_code = excluded.postal_code,
         country = excluded.country,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      guestId,
      data.line1,
      data.line2 ?? null,
      data.city,
      data.state ?? null,
      data.postal_code,
      data.country,
    )
    .run();
}

export async function getMailingAddress(
  db: D1Database,
  guestId: number,
): Promise<MailingAddress | null> {
  const result = await db
    .prepare('SELECT * FROM mailing_addresses WHERE guest_id = ?')
    .bind(guestId)
    .first<MailingAddress>();

  return result ?? null;
}

export async function exportGuestData(db: D1Database): Promise<
  Array<{
    full_name: string;
    invite_code: string;
    email: string | null;
    attending: string | null;
    guest_count: number;
    dietary_notes: string | null;
    message: string | null;
    rsvp_at: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  }>
> {
  const result = await db
    .prepare(
      `SELECT
        g.full_name,
        g.invite_code,
        g.email,
        g.attending,
        g.guest_count,
        g.dietary_notes,
        g.message,
        g.rsvp_at,
        a.line1,
        a.line2,
        a.city,
        a.state,
        a.postal_code,
        a.country
       FROM guests g
       LEFT JOIN mailing_addresses a ON a.guest_id = g.id
       ORDER BY g.full_name`,
    )
    .all();

  return (result.results ?? []) as Array<{
    full_name: string;
    invite_code: string;
    email: string | null;
    attending: string | null;
    guest_count: number;
    dietary_notes: string | null;
    message: string | null;
    rsvp_at: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  }>;
}
