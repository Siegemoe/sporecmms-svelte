import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/chunks/0.f328e84e.js","_app/immutable/chunks/_layout.ddaea7ef.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/stores.65cb5f2c.js","_app/immutable/chunks/singletons.043e8d30.js","_app/immutable/chunks/index.8162ef61.js","_app/immutable/chunks/forms.5409edbc.js","_app/immutable/chunks/parse.bee59afc.js"];
export const stylesheets = ["_app/immutable/assets/_layout.0b7be66b.css"];
export const fonts = [];
