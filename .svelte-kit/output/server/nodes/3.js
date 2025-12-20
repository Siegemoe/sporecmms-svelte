import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.e80205a0.js","_app/immutable/chunks/_page.87666a06.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/forms.f1c4a5f2.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.db57a7a8.js","_app/immutable/chunks/index.a42bdb25.js"];
export const stylesheets = [];
export const fonts = [];
