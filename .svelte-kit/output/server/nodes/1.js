

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.b46f9116.js","_app/immutable/chunks/scheduler.1dbefa40.js","_app/immutable/chunks/index.316c407f.js","_app/immutable/chunks/stores.ff84b20e.js","_app/immutable/chunks/singletons.31dab2c1.js","_app/immutable/chunks/index.0cd93556.js"];
export const stylesheets = [];
export const fonts = [];
