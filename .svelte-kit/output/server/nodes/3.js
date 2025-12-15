import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.8d034159.js","_app/immutable/chunks/_page.48701412.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.5409edbc.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.043e8d30.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
