import * as server from '../entries/pages/audit-log/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/audit-log/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/audit-log/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.c4af26c6.js","_app/immutable/chunks/_page.b8114dce.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/index.aa9ac6db.js"];
export const stylesheets = [];
export const fonts = [];
