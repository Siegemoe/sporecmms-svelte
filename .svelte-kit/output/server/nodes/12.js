import * as server from '../entries/pages/onboarding/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/onboarding/+page.server.ts";
export const imports = ["_app/immutable/chunks/12.b80d35e6.js","_app/immutable/chunks/_page.1ce7b63f.js","_app/immutable/chunks/scheduler.69bdaf09.js","_app/immutable/chunks/index.1e166d6a.js","_app/immutable/chunks/forms.04d7d5bb.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.2f80c8a5.js","_app/immutable/chunks/index.5edc714e.js"];
export const stylesheets = [];
export const fonts = [];
