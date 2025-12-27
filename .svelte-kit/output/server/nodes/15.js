import * as server from '../entries/pages/select-organization/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/select-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/select-organization/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.50542c8d.js","_app/immutable/chunks/_page.6bfbfdab.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.b7713f1d.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b6722d67.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
