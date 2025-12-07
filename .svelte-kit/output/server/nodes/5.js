import * as server from '../entries/pages/audit-log/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/audit-log/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/audit-log/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.7177f4d3.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js"];
export const stylesheets = [];
export const fonts = [];
