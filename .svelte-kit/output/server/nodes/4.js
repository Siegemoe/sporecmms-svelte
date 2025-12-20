import * as server from '../entries/pages/assets/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/[id]/+page.server.ts";
export const imports = ["_app/immutable/chunks/4.9ddf73b1.js","_app/immutable/chunks/_page.24b87429.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/forms.f1c4a5f2.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.db57a7a8.js","_app/immutable/chunks/index.a42bdb25.js"];
export const stylesheets = [];
export const fonts = [];
