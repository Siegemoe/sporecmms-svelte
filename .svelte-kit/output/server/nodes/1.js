

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/chunks/1.07229c09.js","_app/immutable/chunks/error.75a5ba9e.js","_app/immutable/chunks/scheduler.150511e5.js","_app/immutable/chunks/index.7311d585.js","_app/immutable/chunks/stores.2956f071.js","_app/immutable/chunks/singletons.dec2cbf6.js","_app/immutable/chunks/index.40078100.js"];
export const stylesheets = [];
export const fonts = [];
