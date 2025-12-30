import * as server from '../entries/pages/assets/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.d05f714b.js","_app/immutable/chunks/scheduler.71a1eefe.js","_app/immutable/chunks/index.eeb8cce9.js","_app/immutable/chunks/forms.61f2d11f.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.62cd2d94.js","_app/immutable/chunks/index.ea98e37b.js","_app/immutable/chunks/constants.30bce2a0.js","_app/immutable/chunks/AssetForm.5e62a901.js"];
export const stylesheets = [];
export const fonts = [];
