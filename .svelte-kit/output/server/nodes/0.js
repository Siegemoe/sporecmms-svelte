import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.716f7a47.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/stores.a8838f7a.js","_app/immutable/chunks/singletons.bdb73ca0.js","_app/immutable/chunks/index.40078100.js","_app/immutable/chunks/forms.9ef250d9.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/each.12b2b3cf.js"];
export const stylesheets = ["_app/immutable/assets/0.bcb74662.css"];
export const fonts = [];
