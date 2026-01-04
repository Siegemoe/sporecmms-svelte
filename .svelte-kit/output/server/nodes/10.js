import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.b8bf35b8.js","_app/immutable/chunks/scheduler.d7bb0f2c.js","_app/immutable/chunks/index.87e06830.js","_app/immutable/chunks/websocket.40625606.js","_app/immutable/chunks/index.d78cd8e4.js","_app/immutable/chunks/constants.fb644233.js"];
export const stylesheets = [];
export const fonts = [];
