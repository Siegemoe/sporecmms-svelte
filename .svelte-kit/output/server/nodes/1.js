

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.dc98e6c7.js","_app/immutable/chunks/error.8bd22d19.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/stores.8c799d02.js","_app/immutable/chunks/singletons.620b706d.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
