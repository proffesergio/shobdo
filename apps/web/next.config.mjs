const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:4000';
const parsed = new URL(apiOrigin);
if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== apiOrigin || parsed.username || parsed.password) {
  throw new Error('API_ORIGIN must be an exact HTTP(S) origin without credentials');
}
export default {
  // Explicit first-look exports have no hosted backend to proxy to.
  ...(process.env.UI_PREVIEW_ONLY === 'true' ? {
    output: 'export',
  } : {
    async rewrites() {
      return [{ source: '/api/v1/:path*', destination: `${apiOrigin}/api/v1/:path*` }];
    },
  }),
};
