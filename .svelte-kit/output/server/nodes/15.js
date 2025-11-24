import * as server from '../entries/pages/work-orders/_id_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/work-orders/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/work-orders/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.ab12f141.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/each.5b08259c.js","_app/immutable/chunks/forms.d1ef4f5c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/index.0cd93556.js","_app/immutable/chunks/navigation.21f4a2dd.js"];
export const stylesheets = [];
export const fonts = [];
