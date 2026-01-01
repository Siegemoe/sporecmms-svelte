import * as server from '../entries/pages/onboarding/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/onboarding/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.5141a0be.js","_app/immutable/chunks/scheduler.ba200a68.js","_app/immutable/chunks/index.80ab9a85.js","_app/immutable/chunks/forms.c2c344f8.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.a0a40bc0.js","_app/immutable/chunks/index.d89378c2.js"];
export const stylesheets = [];
export const fonts = [];
