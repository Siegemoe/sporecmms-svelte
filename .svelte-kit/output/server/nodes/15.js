import * as server from '../entries/pages/work-orders/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/work-orders/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/work-orders/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.6c1e701c.js","_app/immutable/chunks/_page.1f99a7e1.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/websocket.3039a98f.js","_app/immutable/chunks/index.8162ef61.js","_app/immutable/chunks/forms.5409edbc.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.043e8d30.js","_app/immutable/chunks/stores.65cb5f2c.js"];
export const stylesheets = [];
export const fonts = [];
