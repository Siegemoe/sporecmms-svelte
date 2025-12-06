import * as server from '../entries/pages/auth/register/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/register/+page.server.ts";
export const imports = ["_app/immutable/chunks/8.f44aa075.js","_app/immutable/chunks/_page.df02af6a.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.c4a6f134.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.dec2cbf6.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
