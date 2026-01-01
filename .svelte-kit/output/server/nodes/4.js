import * as server from '../entries/pages/assets/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/[id]/+page.server.ts";
export const imports = ["_app/immutable/chunks/4.65d4cd0c.js","_app/immutable/chunks/_page.12e0d92b.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/forms.4811ed8e.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.af756979.js","_app/immutable/chunks/index.9628e424.js","_app/immutable/chunks/constants.cc7bddc0.js","_app/immutable/chunks/AssetForm.f3459561.js"];
export const stylesheets = [];
export const fonts = [];
