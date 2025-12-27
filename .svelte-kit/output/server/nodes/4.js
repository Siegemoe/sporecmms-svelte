import * as server from '../entries/pages/assets/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.e0612146.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.06f8cfea.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b5aeba36.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
