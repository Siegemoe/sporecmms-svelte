import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/chunks/0.1772afac.js","_app/immutable/chunks/_layout.e94610d1.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/stores.3ac753b9.js","_app/immutable/chunks/singletons.7c7804ce.js","_app/immutable/chunks/index.7647694d.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/forms.40636029.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/constants.d02042fd.js"];
export const stylesheets = ["_app/immutable/assets/_layout.96de48d4.css"];
export const fonts = [];
