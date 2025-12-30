import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.8e6e7ad4.js","_app/immutable/chunks/_page.2cd5c3e8.js","_app/immutable/chunks/scheduler.69bdaf09.js","_app/immutable/chunks/index.1e166d6a.js","_app/immutable/chunks/websocket.d63156ab.js","_app/immutable/chunks/index.5edc714e.js"];
export const stylesheets = [];
export const fonts = [];
