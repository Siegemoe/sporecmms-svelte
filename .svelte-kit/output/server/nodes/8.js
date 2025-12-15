import * as server from '../entries/pages/auth/register/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/register/+page.server.ts";
export const imports = ["_app/immutable/chunks/8.6974cb0a.js","_app/immutable/chunks/_page.f9c1aa13.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.5409edbc.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.043e8d30.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
