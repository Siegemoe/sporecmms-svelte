import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.6fccc56e.js","_app/immutable/chunks/scheduler.d7bb0f2c.js","_app/immutable/chunks/index.87e06830.js","_app/immutable/chunks/stores.b052de97.js","_app/immutable/chunks/singletons.0340fcc2.js","_app/immutable/chunks/index.d78cd8e4.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.a013eb12.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.fb644233.js","_app/immutable/chunks/WorkOrderForm.b6f541a8.js"];
export const stylesheets = ["_app/immutable/assets/0.e2955bef.css"];
export const fonts = [];
