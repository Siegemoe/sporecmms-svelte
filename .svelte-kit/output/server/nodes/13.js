import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/chunks/13.f2dff8d2.js","_app/immutable/chunks/_page.4cc5f8c3.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/forms.4811ed8e.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.af756979.js","_app/immutable/chunks/index.9628e424.js"];
export const stylesheets = [];
export const fonts = [];
