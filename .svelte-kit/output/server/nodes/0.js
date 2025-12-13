import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/chunks/0.5370f8d2.js","_app/immutable/chunks/_layout.0540a5fd.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/stores.1fb7b3f8.js","_app/immutable/chunks/singletons.94292769.js","_app/immutable/chunks/index.8162ef61.js","_app/immutable/chunks/forms.f206e429.js","_app/immutable/chunks/parse.bee59afc.js"];
export const stylesheets = ["_app/immutable/assets/_layout.b27d4e18.css"];
export const fonts = [];
