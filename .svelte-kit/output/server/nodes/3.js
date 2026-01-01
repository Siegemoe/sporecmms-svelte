import * as server from '../entries/pages/assets/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/assets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/assets/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.819e6860.js","_app/immutable/chunks/_page.5e447d39.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/forms.4811ed8e.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.af756979.js","_app/immutable/chunks/index.9628e424.js","_app/immutable/chunks/constants.cc7bddc0.js","_app/immutable/chunks/AssetForm.f3459561.js","_app/immutable/chunks/FilterBar.818eb3a9.js"];
export const stylesheets = [];
export const fonts = [];
