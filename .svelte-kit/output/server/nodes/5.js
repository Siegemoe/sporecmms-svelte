import * as server from '../entries/pages/audit-log/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/audit-log/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/audit-log/+page.server.ts";
export const imports = ["_app/immutable/chunks/5.ec5732eb.js","_app/immutable/chunks/_page.ba81c0be.js","_app/immutable/chunks/scheduler.69bdaf09.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/index.1e166d6a.js"];
export const stylesheets = [];
export const fonts = [];
