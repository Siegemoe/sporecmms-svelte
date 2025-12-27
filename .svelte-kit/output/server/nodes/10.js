import * as server from '../entries/pages/auth/reset-password/_token_/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/reset-password/_token_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/reset-password/[token]/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.6e965865.js","_app/immutable/chunks/_page.efb46c7c.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.8bb00b45.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.ca3014e7.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
