import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/chunks/10.8c1d680d.js","_app/immutable/chunks/_page.3540a7cf.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/forms.e1260b91.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.b20dc6d4.js","_app/immutable/chunks/index.8162ef61.js"];
export const stylesheets = [];
export const fonts = [];
