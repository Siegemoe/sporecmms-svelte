

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.65fa6434.js","_app/immutable/chunks/error.339d5798.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/stores.f0526f9e.js","_app/immutable/chunks/singletons.710e10d0.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
