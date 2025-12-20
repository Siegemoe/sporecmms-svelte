import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/chunks/11.7b0d2dec.js","_app/immutable/chunks/_page.f826aad2.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/websocket.c0a1939b.js","_app/immutable/chunks/index.a42bdb25.js"];
export const stylesheets = [];
export const fonts = [];
