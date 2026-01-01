import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.e5145a2a.js","_app/immutable/chunks/scheduler.ba200a68.js","_app/immutable/chunks/index.80ab9a85.js","_app/immutable/chunks/stores.8d4582de.js","_app/immutable/chunks/singletons.a0a40bc0.js","_app/immutable/chunks/index.d89378c2.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.c2c344f8.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.30bce2a0.js"];
export const stylesheets = ["_app/immutable/assets/0.a816b7cc.css"];
export const fonts = [];
