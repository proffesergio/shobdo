import { createRequestHandler } from '../src/app.mjs';
import { loadConfig } from '../src/config.mjs';

// Vercel owns the HTTP listener. Local startup remains in src/server.mjs.
export default createRequestHandler(loadConfig());
