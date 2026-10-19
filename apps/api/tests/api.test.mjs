import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createApp } from '../src/app.mjs';
import { loadConfig } from '../src/config.mjs';
import { createApiClient, ApiError } from '../../../packages/api-client/src/index.mjs';
import vercelHandler from '../api/index.mjs';

async function serve(t, server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('Vercel entry point serves the same API contract without owning a listener', async t => {
  const origin = await serve(t, createServer(vercelHandler));
  for (const [pathname, status] of [
    ['/health/live', 200], ['/health/ready', 503],
    ['/api/v1/capabilities?locale=bn', 200],
    ['/api/v1/capabilities?locale=invalid', 400],
    ['/api/v1/admin/status', 401],
  ]) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, status);
    const body = await response.json();
    assert.equal(body.requestId ?? body.error?.requestId, response.headers.get('x-request-id'));
  }
});

test('real HTTP client/backend round trip reports scaffold capabilities in both locales', async t => {
  const origin = await serve(t, createApp());
  const client = createApiClient({ origin });
  for (const locale of ['bn', 'en']) {
    const result = await client.getCapabilities({ locale });
    assert.equal(result.locale, locale);
    assert.equal(result.stage, 'scaffold');
    assert.deepEqual(Object.values(result.capabilities), ['not_implemented', 'not_implemented', 'not_implemented']);
  }
});

test('liveness succeeds while readiness stays 503 even with a configured database URL', async t => {
  for (const databaseConfigured of [false, true]) {
    const origin = await serve(t, createApp({ databaseConfigured }));
    const live = await fetch(`${origin}/health/live`);
    assert.equal(live.status, 200);
    const ready = await fetch(`${origin}/health/ready`);
    assert.equal(ready.status, 503);
    const body = await ready.json();
    assert.equal(body.dependencies.database, databaseConfigured ? 'unverified' : 'not_configured');
    assert.equal(body.dependencies.inference, 'not_implemented');
    assert.equal(body.error.requestId, ready.headers.get('x-request-id'));
  }
});

test('validation rejects unknown, duplicate, and invalid query parameters with a safe error envelope', async t => {
  const origin = await serve(t, createApp());
  for (const query of ['locale=fr', 'locale=bn&locale=en', 'unknown=yes', 'locale=']) {
    const response = await fetch(`${origin}/api/v1/capabilities?${query}`, { headers: { 'X-Request-Id': 'attacker-controlled' } });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'INVALID_REQUEST');
    assert.equal(body.error.requestId, response.headers.get('x-request-id'));
    assert.notEqual(body.error.requestId, 'attacker-controlled');
    assert.deepEqual(Object.keys(body.error).sort(), ['code', 'message', 'requestId']);
  }
});

test('admin fails closed and unknown routes/mutations return documented errors', async t => {
  const origin = await serve(t, createApp());
  for (const headers of [{}, { Authorization: 'Bearer not-a-real-token' }]) {
    const response = await fetch(`${origin}/api/v1/admin/status`, { headers });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, 'UNAUTHORIZED');
  }
  assert.equal((await fetch(`${origin}/api/v1/missing`)).status, 404);
  const mutation = await fetch(`${origin}/api/v1/capabilities`, { method: 'POST', body: '{}' });
  assert.equal(mutation.status, 405);
  assert.equal(mutation.headers.get('allow'), 'GET, OPTIONS');
});

test('CORS permits exact configured origins without credentials and rejects other origins and preflight mutations', async t => {
  const origin = await serve(t, createApp({ allowedOrigins: ['http://localhost:3000'] }));
  const permitted = await fetch(`${origin}/api/v1/capabilities`, { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(permitted.status, 200);
  assert.equal(permitted.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(permitted.headers.get('access-control-allow-credentials'), null);
  const denied = await fetch(`${origin}/api/v1/capabilities`, { headers: { Origin: 'http://localhost:3000.attacker.test' } });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const preflight = await fetch(`${origin}/api/v1/capabilities`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'GET' } });
  assert.equal(preflight.status, 204);
  const mutation = await fetch(`${origin}/api/v1/capabilities`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'POST' } });
  assert.equal(mutation.status, 405);
  const badHeader = await fetch(`${origin}/api/v1/capabilities`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Headers': 'Authorization' } });
  assert.equal(badHeader.status, 403);
});

test('client exposes HTTP validation errors and distinguishes cancellation, timeout, and unavailability', async t => {
  const origin = await serve(t, createApp());
  await assert.rejects(createApiClient({ origin }).getCapabilities({ locale: 'invalid' }), error => error instanceof ApiError && error.code === 'INVALID_REQUEST' && error.status === 400 && Boolean(error.requestId));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(createApiClient({ origin }).getCapabilities({ signal: controller.signal }), { code: 'CANCELLED' });
  const slow = await serve(t, createServer(() => {}));
  await assert.rejects(createApiClient({ origin: slow, timeoutMs: 50 }).getCapabilities(), { code: 'TIMEOUT' });
  const closed = createServer();
  closed.listen(0, '127.0.0.1');
  await once(closed, 'listening');
  const unavailableOrigin = `http://127.0.0.1:${closed.address().port}`;
  await new Promise(resolve => closed.close(resolve));
  await assert.rejects(createApiClient({ origin: unavailableOrigin }).getCapabilities(), { code: 'UNAVAILABLE' });
});

test('client rejects malformed and unexpected successful responses', async t => {
  for (const body of ['not json', '{"data":{"stage":"live"}}', 'null']) {
    const origin = await serve(t, createServer((req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(body); }));
    await assert.rejects(createApiClient({ origin }).getCapabilities(), { code: 'INVALID_RESPONSE' });
  }
});

test('configuration rejects wildcard CORS, paths, embedded credentials, and invalid ports', () => {
  for (const value of ['*', 'https://example.com/path', 'http://user:secret@example.com', 'null']) {
    assert.throws(() => loadConfig({ API_ALLOWED_ORIGINS: value }));
  }
  assert.throws(() => loadConfig({ API_PORT: '0' }));
  assert.throws(() => loadConfig({ API_PORT: 'NaN' }));
  assert.throws(() => createApiClient({ origin: 'http://user:secret@example.com' }));
  assert.throws(() => createApiClient({ timeoutMs: 0 }));
});

test('OpenAPI is served from the checked-in contract', async t => {
  const origin = await serve(t, createApp());
  const response = await fetch(`${origin}/api/v1/openapi.json`);
  const spec = await response.json();
  assert.equal(spec.openapi, '3.1.0');
  const checkedIn = JSON.parse(await readFile(new URL('../openapi.json', import.meta.url), 'utf8'));
  assert.deepEqual(spec, checkedIn);
  for (const pathname of Object.keys(spec.paths)) {
    const result = await fetch(`${origin}${pathname}`);
    const operation = spec.paths[pathname].get;
    assert.ok(operation.responses[String(result.status)] ?? operation.responses.default, `${pathname} response is documented`);
  }
});
