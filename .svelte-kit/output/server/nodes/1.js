

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.7b192039.js","_app/immutable/chunks/scheduler.d7bb0f2c.js","_app/immutable/chunks/index.87e06830.js","_app/immutable/chunks/stores.b052de97.js","_app/immutable/chunks/singletons.0340fcc2.js","_app/immutable/chunks/index.d78cd8e4.js"];
export const stylesheets = [];
export const fonts = [];
