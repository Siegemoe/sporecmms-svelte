import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.32888bc8.js","_app/immutable/chunks/scheduler.d7bb0f2c.js","_app/immutable/chunks/index.87e06830.js","_app/immutable/chunks/forms.a013eb12.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.0340fcc2.js","_app/immutable/chunks/index.d78cd8e4.js"];
export const stylesheets = [];
export const fonts = [];
