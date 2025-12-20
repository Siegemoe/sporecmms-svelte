import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.51f5ce5a.js","_app/immutable/chunks/_layout.6b93f694.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/stores.fb790df1.js","_app/immutable/chunks/singletons.9a0b4e84.js","_app/immutable/chunks/index.7647694d.js","_app/immutable/chunks/forms.4aa9eb62.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/constants.d02042fd.js"];
export const stylesheets = ["_app/immutable/assets/_layout.e56c15d8.css"];
export const fonts = [];
