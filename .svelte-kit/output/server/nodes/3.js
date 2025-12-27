import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/chunks/3.9f272f46.js","_app/immutable/chunks/_page.9797ed4e.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.76aea569.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.7108c41a.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
