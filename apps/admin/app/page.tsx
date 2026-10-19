import { ApiStatus } from './api-status';

export default function Admin() {
  return <main style={{ maxWidth: 800, margin: "64px auto", padding: 24 }}>
    <p>BHASHA LABS / INTERNAL</p><h1>Shobdo administration</h1>
    <p>Administration is not configured. Authentication and role checks must be implemented before connecting operational data.</p>
    <ApiStatus />
    <dl><dt>Inference</dt><dd>Not implemented</dd><dt>Telemetry</dt><dd>Not connected</dd><dt>Billing</dt><dd>Not configured</dd></dl>
  </main>;
}
