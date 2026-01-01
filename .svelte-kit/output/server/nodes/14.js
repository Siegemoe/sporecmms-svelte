import * as server from '../entries/pages/select-organization/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/select-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/select-organization/+page.server.ts";
export const imports = ["_app/immutable/nodes/14.5ff8861a.js","_app/immutable/chunks/_page.b7ab585b.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/forms.4811ed8e.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.af756979.js","_app/immutable/chunks/index.9628e424.js"];
export const stylesheets = [];
export const fonts = [];
