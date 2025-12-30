

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.1254f130.js","_app/immutable/chunks/scheduler.71a1eefe.js","_app/immutable/chunks/index.eeb8cce9.js","_app/immutable/chunks/stores.234b1878.js","_app/immutable/chunks/singletons.62cd2d94.js","_app/immutable/chunks/index.ea98e37b.js"];
export const stylesheets = [];
export const fonts = [];
