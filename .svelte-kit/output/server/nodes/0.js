import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.0f9bb891.js","_app/immutable/chunks/scheduler.71a1eefe.js","_app/immutable/chunks/index.eeb8cce9.js","_app/immutable/chunks/stores.234b1878.js","_app/immutable/chunks/singletons.62cd2d94.js","_app/immutable/chunks/index.ea98e37b.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.61f2d11f.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.30bce2a0.js"];
export const stylesheets = ["_app/immutable/assets/0.fd14ee63.css"];
export const fonts = [];
