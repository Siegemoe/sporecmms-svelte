import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.a228d4cf.js","_app/immutable/chunks/scheduler.765195b9.js","_app/immutable/chunks/index.189c3083.js","_app/immutable/chunks/forms.66b03145.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.becaeabb.js","_app/immutable/chunks/index.1d534c61.js"];
export const stylesheets = [];
export const fonts = [];
