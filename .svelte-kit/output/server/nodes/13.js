import * as server from '../entries/pages/users/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/users/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/users/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.502e7645.js","_app/immutable/chunks/_page.51ff81a6.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.5409edbc.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.043e8d30.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
