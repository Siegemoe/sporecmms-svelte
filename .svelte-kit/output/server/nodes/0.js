import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.d6773105.js","_app/immutable/chunks/_layout.2017d786.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/websocket.9dc1f895.js","_app/immutable/chunks/index.40078100.js","_app/immutable/chunks/stores.8c799d02.js","_app/immutable/chunks/singletons.620b706d.js","_app/immutable/chunks/forms.b92a16ff.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/each.12b2b3cf.js"];
export const stylesheets = ["_app/immutable/assets/_layout.bcb74662.css"];
export const fonts = [];
