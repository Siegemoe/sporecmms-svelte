import * as server from '../entries/pages/join-organization/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/join-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/join-organization/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.74b52a33.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.86b304d9.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.d9275eaf.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
