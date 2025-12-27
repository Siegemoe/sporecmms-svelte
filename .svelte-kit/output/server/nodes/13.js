import * as server from '../entries/pages/onboarding/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/onboarding/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.747f6239.js","_app/immutable/chunks/_page.f36b253a.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/forms.9bc9caf7.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.0d007f75.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
