import * as server from '../entries/pages/users/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/users/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/users/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.66b05450.js","_app/immutable/chunks/_page.144d9e2b.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.c5676af3.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.e3c6a73d.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
