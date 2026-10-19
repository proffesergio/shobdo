import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('../openapi.json', import.meta.url), 'utf8'));
const routes = new Set(Object.keys(contract.paths));

export function createRequestHandler({ allowedOrigins = [], databaseConfigured = false } = {}) {
  // A configured URL is not evidence of a working connection. No DB/model probe exists yet.
  const dependencies = { database: databaseConfigured ? 'unverified' : 'not_configured', inference: 'not_implemented' };
  return (req, res) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    function send(status, body) {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body));
    }
    function error(status, code, message) { send(status, { error: { code, message, requestId } }); }
    try {
      const origin = req.headers.origin;
      if (origin && !allowedOrigins.includes(origin)) return error(403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed.');
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
      const url = new URL(req.url, 'http://api.local');
      if (!routes.has(url.pathname)) return error(404, 'NOT_FOUND', 'Endpoint not found.');
      if (req.method === 'OPTIONS') {
        const method = req.headers['access-control-request-method'];
        const headers = String(req.headers['access-control-request-headers'] ?? '').toLowerCase().split(',').map(item => item.trim()).filter(Boolean);
        if (method && method !== 'GET') return error(405, 'METHOD_NOT_ALLOWED', 'Only GET is supported.');
        if (headers.some(header => !['accept', 'content-type'].includes(header))) return error(403, 'HEADERS_NOT_ALLOWED', 'Requested headers are not allowed.');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
        res.writeHead(204);
        return res.end();
      }
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return error(405, 'METHOD_NOT_ALLOWED', 'Only GET is supported.');
      }
      // This is a fail-closed placeholder, not an authentication implementation.
      if (url.pathname === '/api/v1/admin/status') return error(401, 'UNAUTHORIZED', 'Authentication is not configured.');
      const locale = url.searchParams.get('locale') ?? 'bn';
      const validQuery = url.pathname === '/api/v1/capabilities'
        ? [...url.searchParams.keys()].every(key => key === 'locale') && url.searchParams.getAll('locale').length <= 1 && ['bn', 'en'].includes(locale)
        : url.searchParams.size === 0;
      if (!validQuery) return error(400, 'INVALID_REQUEST', 'Unsupported query parameters. Locale must be bn or en.');
      if (req.headers['transfer-encoding'] || (req.headers['content-length'] && req.headers['content-length'] !== '0')) {
        res.setHeader('Connection', 'close');
        return error(400, 'INVALID_REQUEST', 'GET requests must not contain a body.');
      }
      switch (url.pathname) {
        case '/health/live': return send(200, { data: { status: 'alive' }, requestId });
        case '/health/ready': return send(503, { error: { code: 'NOT_READY', message: 'Required dependencies are not verified.', requestId }, dependencies });
        case '/api/v1/openapi.json': return send(200, contract);
        case '/api/v1/capabilities': return send(200, { data: {
          product: 'Shobdo', locale, stage: 'scaffold',
          capabilities: { scripts: 'not_implemented', speech: 'not_implemented', voiceCloning: 'not_implemented' },
        }, requestId });
      }
    } catch {
      // Deliberately omit exception details and user input from responses.
      if (!res.headersSent) error(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
      else res.destroy();
    }
  };
}

export function createApp(config = {}) {
  const server = createServer({ maxHeaderSize: 16384, requestTimeout: 10000, headersTimeout: 10000 }, createRequestHandler(config));
  server.keepAliveTimeout = 5000;
  return server;
}
