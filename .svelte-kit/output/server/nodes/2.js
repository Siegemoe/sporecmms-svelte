import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.654abc79.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/navigation.21f4a2dd.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/index.0cd93556.js"];
export const stylesheets = [];
export const fonts = [];
