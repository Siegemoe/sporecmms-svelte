

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.7d8b155a.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/stores.a8838f7a.js","_app/immutable/chunks/singletons.bdb73ca0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
