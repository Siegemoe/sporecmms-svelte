import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.469b072a.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.9ef250d9.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.bdb73ca0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
