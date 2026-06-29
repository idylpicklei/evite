import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const csvPath = process.argv[2] ?? resolve('data/guests.example.csv');
const remote = process.argv.includes('--remote');
const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',').map((h) => h.trim());

if (headers.join(',') !== 'full_name,invite_code,email') {
  console.error('CSV must have headers: full_name,invite_code,email');
  process.exit(1);
}

const values = lines.slice(1).map((line) => {
  const parts = line.split(',').map((p) => p.trim());
  const fullName = parts[0]?.replace(/'/g, "''") ?? '';
  const inviteCode = parts[1]?.replace(/'/g, "''") ?? '';
  const email = parts[2]?.replace(/'/g, "''") ?? '';
  const emailValue = email ? `'${email}'` : 'NULL';
  return `('${fullName}', '${inviteCode}', ${emailValue})`;
});

if (values.length === 0) {
  console.error('No guest rows found in CSV');
  process.exit(1);
}

const sql = `-- auto-generated guest seed
INSERT OR IGNORE INTO guests (full_name, invite_code, email)
VALUES
${values.join(',\n')};
`;

const sqlPath = resolve('scripts/.seed-guests.generated.sql');
writeFileSync(sqlPath, sql);

const flag = remote ? '--remote' : '--local';
execSync(`npx wrangler d1 execute evite-db ${flag} --file="${sqlPath}"`, {
  stdio: 'inherit',
});

console.log(`Seeded ${values.length} guest(s) from ${csvPath}`);
