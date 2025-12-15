import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.a4f9b633.js","_app/immutable/chunks/_page.fcf92638.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/websocket.3039a98f.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
