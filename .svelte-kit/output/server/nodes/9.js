import * as server from '../entries/pages/auth/register/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/register/+page.server.ts";
export const imports = ["_app/immutable/chunks/9.31f3bd05.js","_app/immutable/chunks/_page.5178a01a.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.998e8c22.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.f96b86cf.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
