import * as server from '../entries/pages/sites/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sites/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sites/+page.server.ts";
export const imports = ["_app/immutable/chunks/11.b41ac5ce.js","_app/immutable/chunks/_page.78b126b3.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.a32d4a07.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.710e10d0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
