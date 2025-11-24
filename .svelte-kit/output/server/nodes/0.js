import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.f1ae114a.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/websocket.9bdac6e2.js","_app/immutable/chunks/index.0cd93556.js","_app/immutable/chunks/stores.ff84b20e.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/forms.d1ef4f5c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/navigation.21f4a2dd.js"];
export const stylesheets = ["_app/immutable/assets/0.ee5dd957.css"];
export const fonts = [];
