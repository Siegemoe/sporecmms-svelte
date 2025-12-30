

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.a0d1f7d7.js","_app/immutable/chunks/scheduler.765195b9.js","_app/immutable/chunks/index.189c3083.js","_app/immutable/chunks/stores.a8273ce7.js","_app/immutable/chunks/singletons.becaeabb.js","_app/immutable/chunks/index.1d534c61.js"];
export const stylesheets = [];
export const fonts = [];
