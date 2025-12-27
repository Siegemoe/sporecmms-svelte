import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.eee268a2.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/stores.9094d3b6.js","_app/immutable/chunks/singletons.4193ceeb.js","_app/immutable/chunks/index.7647694d.js","_app/immutable/chunks/forms.675ef35f.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.d02042fd.js"];
export const stylesheets = ["_app/immutable/assets/0.96de48d4.css"];
export const fonts = [];
