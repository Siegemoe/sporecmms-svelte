import * as server from '../entries/pages/assets/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.2555026d.js","_app/immutable/chunks/scheduler.765195b9.js","_app/immutable/chunks/index.189c3083.js","_app/immutable/chunks/forms.66b03145.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.becaeabb.js","_app/immutable/chunks/index.1d534c61.js","_app/immutable/chunks/constants.30bce2a0.js","_app/immutable/chunks/AssetForm.4a6b558f.js"];
export const stylesheets = [];
export const fonts = [];
