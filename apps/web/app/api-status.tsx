'use client';

import { useEffect, useState } from 'react';
import { createApiClient } from '@shobdo/api-client';

const api = createApiClient({ origin: process.env.NEXT_PUBLIC_API_ORIGIN ?? '' });

export function ApiStatus() {
  const [state, setState] = useState<'loading' | 'connected' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    api.getCapabilities({ locale: 'bn', signal: controller.signal })
      .then(() => { if (!controller.signal.aborted) setState('connected'); })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, [attempt]);
  return <div className="api-status" data-state={state}>
    <span role="status">{state === 'loading' ? 'সার্ভারের সংযোগ পরীক্ষা হচ্ছে…' : state === 'connected'
      ? 'API সংযুক্ত · অডিও সেবা চালু হয়নি'
      : 'সার্ভার সংযুক্ত নয় · স্থানীয় লেখা চালু আছে'}</span>
    {state === 'error' && <button type="button" onClick={() => setAttempt(value => value + 1)}>আবার চেষ্টা</button>}
  </div>;
}
