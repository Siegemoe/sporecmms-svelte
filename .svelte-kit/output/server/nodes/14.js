import * as server from '../entries/pages/work-orders/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/work-orders/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/work-orders/+page.server.ts";
export const imports = ["_app/immutable/nodes/14.6b04277f.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/websocket.7498009b.js","_app/immutable/chunks/index.40078100.js","_app/immutable/chunks/forms.9ef250d9.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.bdb73ca0.js","_app/immutable/chunks/stores.a8838f7a.js"];
export const stylesheets = [];
export const fonts = [];
