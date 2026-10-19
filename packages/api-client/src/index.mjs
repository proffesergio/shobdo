export class ApiError extends Error {
  constructor(code, message, status = 0, requestId) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

export function createApiClient({ origin = '', timeoutMs = 5000 } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be positive');
  if (origin) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.origin !== origin) {
      throw new Error('API origin must be an exact HTTP(S) origin without credentials');
    }
  }
  async function getCapabilities({ locale = 'bn', signal } = {}) {
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    if (signal?.aborted) controller.abort();
    else signal?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const response = await fetch(`${origin}/api/v1/capabilities?locale=${encodeURIComponent(locale)}`, {
        headers: { Accept: 'application/json' }, signal: controller.signal,
        credentials: 'omit', cache: 'no-store', redirect: 'error',
      });
      const requestId = response.headers.get('x-request-id') ?? undefined;
      let payload;
      try { payload = await response.json(); } catch {
        if (controller.signal.aborted) throw new Error('Request aborted');
        throw new ApiError('INVALID_RESPONSE', 'The API returned an invalid response.', response.status, requestId);
      }
      if (!response.ok) {
        const code = typeof payload?.error?.code === 'string' ? payload.error.code : 'HTTP_ERROR';
        const message = typeof payload?.error?.message === 'string' ? payload.error.message : 'The API request failed.';
        throw new ApiError(code, message, response.status, requestId);
      }
      const data = payload?.data;
      if (data?.product !== 'Shobdo' || data?.stage !== 'scaffold' || !['bn', 'en'].includes(data?.locale) ||
          !['scripts', 'speech', 'voiceCloning'].every(key => data.capabilities?.[key] === 'not_implemented')) {
        throw new ApiError('INVALID_RESPONSE', 'The API returned an unexpected response.', response.status, requestId);
      }
      return data;
    } catch (error) {
      if (controller.signal.aborted) throw new ApiError(timedOut ? 'TIMEOUT' : 'CANCELLED', timedOut ? 'The API request timed out.' : 'The API request was cancelled.');
      if (error instanceof ApiError) throw error;
      throw new ApiError('UNAVAILABLE', 'The API is unavailable.');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  return { getCapabilities };
}
