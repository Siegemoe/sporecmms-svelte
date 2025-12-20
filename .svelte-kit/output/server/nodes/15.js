import * as server from '../entries/pages/sites/_id_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sites/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sites/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.d831fa0b.js","_app/immutable/chunks/_page.7d5eb30c.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.c20b576d.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.53ff7e9a.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
