import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/14.da5cacc0.js","_app/immutable/chunks/_page.b82a64cd.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.76aea569.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.7108c41a.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
