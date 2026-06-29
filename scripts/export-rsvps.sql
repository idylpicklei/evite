SELECT
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
ORDER BY g.full_name;
