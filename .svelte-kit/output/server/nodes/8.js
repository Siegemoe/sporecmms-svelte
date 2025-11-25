import * as server from '../entries/pages/auth/register/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/register/+page.server.ts";
export const imports = ["_app/immutable/chunks/8.0f62a3a6.js","_app/immutable/chunks/_page.ac5c1ce2.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.a32d4a07.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.710e10d0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
