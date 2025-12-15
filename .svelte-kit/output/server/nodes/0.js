import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/chunks/0.b0a908c7.js","_app/immutable/chunks/_layout.4a017d25.js","_app/immutable/chunks/scheduler.82236372.js","_app/immutable/chunks/index.a73b1e10.js","_app/immutable/chunks/stores.93ea7195.js","_app/immutable/chunks/singletons.b20dc6d4.js","_app/immutable/chunks/index.8162ef61.js","_app/immutable/chunks/forms.e1260b91.js","_app/immutable/chunks/parse.bee59afc.js"];
export const stylesheets = ["_app/immutable/assets/_layout.635d9cb8.css"];
export const fonts = [];
