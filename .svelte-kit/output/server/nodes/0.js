import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.4e77ab64.js","_app/immutable/chunks/_layout.94fcb4e6.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/stores.e6b76d1c.js","_app/immutable/chunks/singletons.b8573d35.js","_app/immutable/chunks/index.9628e424.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.4d10594c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.cc7bddc0.js"];
export const stylesheets = ["_app/immutable/assets/_layout.1ec5a2f9.css"];
export const fonts = [];
