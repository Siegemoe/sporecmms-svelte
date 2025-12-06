import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.a410e085.js","_app/immutable/chunks/_page.341c96d0.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/websocket.7498009b.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
