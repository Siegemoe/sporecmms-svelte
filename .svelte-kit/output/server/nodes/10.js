import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.fc95cf8f.js","_app/immutable/chunks/scheduler.ba200a68.js","_app/immutable/chunks/index.80ab9a85.js","_app/immutable/chunks/websocket.227fd2ac.js","_app/immutable/chunks/index.d89378c2.js"];
export const stylesheets = [];
export const fonts = [];
