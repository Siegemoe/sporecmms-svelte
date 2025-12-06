import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.9ff8ceb6.js","_app/immutable/chunks/_page.4061a8a2.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/forms.b92a16ff.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.620b706d.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
