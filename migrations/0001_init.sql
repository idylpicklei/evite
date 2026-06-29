-- guests (seeded before launch)
CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  email TEXT,
  attending TEXT,
  guest_count INTEGER DEFAULT 1,
  dietary_notes TEXT,
  message TEXT,
  rsvp_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mailing_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL UNIQUE REFERENCES guests(id),
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guests_invite_code ON guests(invite_code);
