import * as server from '../entries/pages/work-orders/_id_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/work-orders/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/work-orders/[id]/+page.server.ts";
export const imports = ["_app/immutable/chunks/15.fe6515a6.js","_app/immutable/chunks/_page.0bcb1ffb.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.a32d4a07.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.710e10d0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
