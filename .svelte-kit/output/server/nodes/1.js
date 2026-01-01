

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/chunks/1.42e5e4fb.js","_app/immutable/chunks/error.58deb02b.js","_app/immutable/chunks/scheduler.1a6e5117.js","_app/immutable/chunks/index.db98bb86.js","_app/immutable/chunks/stores.1987b915.js","_app/immutable/chunks/singletons.af756979.js","_app/immutable/chunks/index.9628e424.js"];
export const stylesheets = [];
export const fonts = [];
