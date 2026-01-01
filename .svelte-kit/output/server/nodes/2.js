import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/chunks/2.4b56285a.js","_app/immutable/chunks/_page.a7320398.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/forms.4d10594c.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b8573d35.js","_app/immutable/chunks/index.9628e424.js"];
export const stylesheets = [];
export const fonts = [];
