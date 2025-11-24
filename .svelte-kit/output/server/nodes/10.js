import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.00dd911a.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/forms.d1ef4f5c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/index.0cd93556.js","_app/immutable/chunks/navigation.21f4a2dd.js"];
export const stylesheets = [];
export const fonts = [];
