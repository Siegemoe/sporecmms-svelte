import * as server from '../entries/pages/select-organization/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/select-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/select-organization/+page.server.ts";
export const imports = ["_app/immutable/chunks/15.84d2a205.js","_app/immutable/chunks/_page.5c6a3106.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.8bb00b45.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.ca3014e7.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
