

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.54dc783a.js","_app/immutable/chunks/error.b3194ec5.js","_app/immutable/chunks/scheduler.a6309769.js","_app/immutable/chunks/index.e9baf4e7.js","_app/immutable/chunks/stores.8b195d01.js","_app/immutable/chunks/singletons.b6722d67.js","_app/immutable/chunks/index.7647694d.js"];
export const stylesheets = [];
export const fonts = [];
