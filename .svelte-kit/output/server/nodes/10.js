import * as server from '../entries/pages/auth/reset-password/_token_/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/reset-password/_token_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/reset-password/[token]/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.052681a4.js","_app/immutable/chunks/_page.e80cd5f0.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.998e8c22.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.f96b86cf.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
