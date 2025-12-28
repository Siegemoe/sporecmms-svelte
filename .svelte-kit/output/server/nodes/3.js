import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/chunks/3.b25f707a.js","_app/immutable/chunks/_page.4ae1fe1b.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.c8c50b43.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.016370c0.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
