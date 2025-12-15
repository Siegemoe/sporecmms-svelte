import * as server from '../entries/pages/sites/_id_/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sites/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sites/[id]/+page.server.ts";
export const imports = ["_app/immutable/chunks/12.dff4465c.js","_app/immutable/chunks/_page.53cb366b.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.e1260b91.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b20dc6d4.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
