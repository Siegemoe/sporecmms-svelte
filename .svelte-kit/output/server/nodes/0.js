import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.2df561e7.js","_app/immutable/chunks/_layout.bd1a3b74.js","_app/immutable/chunks/scheduler.69bdaf09.js","_app/immutable/chunks/index.1e166d6a.js","_app/immutable/chunks/stores.af54aea6.js","_app/immutable/chunks/singletons.2f80c8a5.js","_app/immutable/chunks/index.5edc714e.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.04d7d5bb.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.f351499e.js"];
export const stylesheets = ["_app/immutable/assets/_layout.559e0943.css"];
export const fonts = [];
