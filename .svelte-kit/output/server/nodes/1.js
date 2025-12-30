

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/chunks/1.23b974bd.js","_app/immutable/chunks/error.45ac46e4.js","_app/immutable/chunks/scheduler.69bdaf09.js","_app/immutable/chunks/index.1e166d6a.js","_app/immutable/chunks/stores.af54aea6.js","_app/immutable/chunks/singletons.2f80c8a5.js","_app/immutable/chunks/index.5edc714e.js"];
export const stylesheets = [];
export const fonts = [];
