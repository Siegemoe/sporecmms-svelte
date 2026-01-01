import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.8a702668.js","_app/immutable/chunks/_page.b2002d4b.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/websocket.ff281e65.js","_app/immutable/chunks/index.9628e424.js"];
export const stylesheets = [];
export const fonts = [];
