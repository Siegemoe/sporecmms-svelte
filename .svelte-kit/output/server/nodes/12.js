import * as server from '../entries/pages/join-organization/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/join-organization/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/join-organization/+page.server.ts";
export const imports = ["_app/immutable/chunks/12.286dad6a.js","_app/immutable/chunks/_page.8d609ab5.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.8138a532.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.455fa47a.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
