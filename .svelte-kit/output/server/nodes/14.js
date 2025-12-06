import * as server from '../entries/pages/work-orders/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/work-orders/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/work-orders/+page.server.ts";
export const imports = ["_app/immutable/chunks/14.6054b7f5.js","_app/immutable/chunks/_page.014ca7a9.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/websocket.9dc1f895.js","_app/immutable/chunks/index.40078100.js","_app/immutable/chunks/forms.b92a16ff.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.620b706d.js","_app/immutable/chunks/stores.8c799d02.js"];
export const stylesheets = [];
export const fonts = [];
