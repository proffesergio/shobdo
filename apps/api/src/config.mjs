export function loadConfig(env = process.env) {
  const port = Number(env.API_PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('API_PORT must be an integer from 1 to 65535');
  const allowedOrigins = (env.API_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    let url;
    try { url = new URL(origin); } catch { throw new Error('API_ALLOWED_ORIGINS must contain exact HTTP(S) origins'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin || url.username || url.password) {
      throw new Error('API_ALLOWED_ORIGINS must contain exact HTTP(S) origins');
    }
  }
  return { host: env.API_HOST ?? '127.0.0.1', port, allowedOrigins, databaseConfigured: Boolean(env.DATABASE_URL) };
}
