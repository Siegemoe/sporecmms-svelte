import * as server from '../entries/pages/sites/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sites/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sites/+page.server.ts";
export const imports = ["_app/immutable/nodes/11.1c211154.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/each.5b08259c.js","_app/immutable/chunks/forms.d1ef4f5c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/index.0cd93556.js","_app/immutable/chunks/navigation.21f4a2dd.js"];
export const stylesheets = [];
export const fonts = [];
