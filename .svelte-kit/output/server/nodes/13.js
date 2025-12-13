import * as server from '../entries/pages/users/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/users/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/users/+page.server.ts";
export const imports = ["_app/immutable/chunks/13.cb4e4376.js","_app/immutable/chunks/_page.7d417ba6.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.f206e429.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.94292769.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
