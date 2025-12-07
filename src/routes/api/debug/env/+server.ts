import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  // Only allow in production for debugging
  if (process.env.NODE_ENV !== 'production') {
    return new Response(JSON.stringify({ error: 'Debug endpoint only available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
    platform: typeof globalThis.navigator !== 'undefined' ? 'cloudflare' : 'node',
    user: locals.user ? {
      id: locals.user.id,
      email: locals.user.email,
      orgId: locals.user.orgId
    } : null,
    headers: {
      'user-agent': typeof globalThis.request !== 'undefined' ? globalThis.request.headers.get('user-agent') : 'N/A'
    }
  };

  return new Response(JSON.stringify(debug, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};