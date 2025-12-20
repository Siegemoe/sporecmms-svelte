import * as server from '../entries/pages/auth/reset-password/_token_/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/reset-password/_token_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/reset-password/[token]/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.de2ac825.js","_app/immutable/chunks/_page.475c6e58.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/forms.f1c4a5f2.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.db57a7a8.js","_app/immutable/chunks/index.a42bdb25.js","_app/immutable/chunks/validation.3f53e523.js"];
export const stylesheets = [];
export const fonts = [];
