import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.e57cb7c3.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/each.5b08259c.js","_app/immutable/chunks/websocket.9bdac6e2.js","_app/immutable/chunks/index.0cd93556.js"];
export const stylesheets = [];
export const fonts = [];
