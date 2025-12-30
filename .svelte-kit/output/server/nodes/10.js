import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.9b4bbf98.js","_app/immutable/chunks/scheduler.71a1eefe.js","_app/immutable/chunks/index.eeb8cce9.js","_app/immutable/chunks/websocket.dc340567.js","_app/immutable/chunks/index.ea98e37b.js"];
export const stylesheets = [];
export const fonts = [];
