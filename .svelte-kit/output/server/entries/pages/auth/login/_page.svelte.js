import { c as create_ssr_component, e as escape, b as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  return `<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4"><div class="max-w-md w-full"> <div class="text-center mb-8" data-svelte-h="svelte-498r17"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1> <p class="text-spore-cream/60 mt-2">Maintenance Management System</p></div>  <div class="bg-spore-white rounded-xl p-8"><h2 class="text-2xl font-bold text-spore-dark mb-6" data-svelte-h="svelte-18b8pfu">Sign In</h2> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">${escape(form.error)}</div>` : ``} <form method="POST" class="space-y-5"><div><label for="email" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-15zf06q">Email</label> <input type="email" id="email" name="email"${add_attribute("value", form?.email ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="you@example.com" required></div> <div data-svelte-h="svelte-eokk8v"><label for="password" class="block text-sm font-bold text-spore-steel mb-2">Password</label> <input type="password" id="password" name="password" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="••••••••" required></div> <button type="submit" ${""} class="w-full bg-spore-forest text-white py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("SIGN IN")}</button></form> <div class="mt-6 text-center" data-svelte-h="svelte-3lw5hn"><p class="text-sm text-spore-steel">Don&#39;t have an account? 
					<a href="/auth/register" class="text-spore-orange font-bold hover:underline">Create one</a></p></div></div></div></div>`;
});
export {
  Page as default
};
