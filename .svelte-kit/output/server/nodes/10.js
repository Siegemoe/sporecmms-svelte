import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.fcd28664.js","_app/immutable/chunks/scheduler.765195b9.js","_app/immutable/chunks/index.189c3083.js","_app/immutable/chunks/websocket.53b2f4b2.js","_app/immutable/chunks/index.1d534c61.js"];
export const stylesheets = [];
export const fonts = [];
