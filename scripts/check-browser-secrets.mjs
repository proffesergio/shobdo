import { readFile, readdir, stat } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import path from 'node:path';

const variables = { ...process.env };
for (const file of ['.env', '.env.local', '.vercel/.env.production.local']) {
  try { Object.assign(variables, parseEnv(await readFile(file, 'utf8'))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const secrets = Object.entries(variables).filter(([name, value]) =>
  !name.startsWith('NEXT_PUBLIC_') && /TOKEN|PASSWORD|SECRET|DATABASE_URL|POSTGRES_URL|ACCESS_KEY_ID/.test(name) && value.length >= 8);
let inspected = 0;
let failed = false;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    if (!entry.isFile()) continue;
    const content = await readFile(file, 'utf8');
    inspected++;
    const found = secrets.find(([, value]) => content.includes(value));
    if (found || /postgres(?:ql)?:\/\/[^\s"'<>]+:[^\s"'<>]+@/i.test(content)) {
      console.error(`Credential detected in browser asset: ${file}${found ? ` (${found[0]})` : ''}`);
      failed = true;
    }
  }
}
for (const directory of ['apps/web/.next/static', 'apps/web/out', 'apps/admin/.next/static', '.vercel/output/static']) {
  try { if ((await stat(directory)).isDirectory()) await inspect(directory); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
if (!inspected) throw new Error('No browser assets found. Build a frontend before scanning.');
console.log(`Inspected ${inspected} browser assets; credential check ${failed ? 'failed' : 'passed'}. This is a source/value scan, not a security certification.`);
if (failed) process.exitCode = 1;
