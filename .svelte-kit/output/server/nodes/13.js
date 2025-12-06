import * as server from '../entries/pages/users/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/users/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/users/+page.server.ts";
export const imports = ["_app/immutable/chunks/13.1c42d9c0.js","_app/immutable/chunks/_page.55d70550.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/each.12b2b3cf.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.b92a16ff.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.620b706d.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
