'use client';

import { useEffect, useState } from 'react';
import { createApiClient } from '@shobdo/api-client';

const api = createApiClient({ origin: process.env.NEXT_PUBLIC_API_ORIGIN ?? '' });

export function ApiStatus() {
  const [status, setStatus] = useState('Checking public API connection…');
  useEffect(() => {
    const controller = new AbortController();
    api.getCapabilities({ locale: 'en', signal: controller.signal })
      .then(() => setStatus('Public API connected. Product capabilities remain unimplemented.'))
      .catch(() => { if (!controller.signal.aborted) setStatus('Public API unavailable. Check that the backend is running.'); });
    return () => controller.abort();
  }, []);
  return <p role="status">{status}</p>;
}
