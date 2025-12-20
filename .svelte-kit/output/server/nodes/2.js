import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/chunks/2.81428a09.js","_app/immutable/chunks/_page.76d50cc1.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/forms.f1c4a5f2.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.db57a7a8.js","_app/immutable/chunks/index.a42bdb25.js"];
export const stylesheets = [];
export const fonts = [];
