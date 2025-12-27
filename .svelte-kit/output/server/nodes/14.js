import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/14.0fe0d1c8.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.06f8cfea.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b5aeba36.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
