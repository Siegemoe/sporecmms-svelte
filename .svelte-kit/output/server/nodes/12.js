import * as server from '../entries/pages/join-organization/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/join-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/join-organization/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.dc656d1d.js","_app/immutable/chunks/_page.c080c789.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.8bb00b45.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.ca3014e7.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
