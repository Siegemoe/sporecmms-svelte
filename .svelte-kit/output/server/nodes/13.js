import * as server from '../entries/pages/onboarding/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/onboarding/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.b6219d45.js","_app/immutable/chunks/_page.8c0f535e.js","_app/immutable/chunks/scheduler.15e411cb.js","_app/immutable/chunks/index.aa9ac6db.js","_app/immutable/chunks/forms.f1c4a5f2.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/chunks/singletons.db57a7a8.js","_app/immutable/chunks/index.a42bdb25.js"];
export const stylesheets = [];
export const fonts = [];
