import { c as create_ssr_component, a as subscribe, e as escape, b as add_attribute } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import "devalue";
const app = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let user;
  let isAuthPage;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  currentPath = $page.url.pathname;
  user = data.user;
  isAuthPage = currentPath.startsWith("/auth");
  $$unsubscribe_page();
  return `${!isAuthPage && user ? ` <nav class="bg-spore-dark border-b border-spore-steel/30"><div class="max-w-7xl mx-auto px-4"><div class="flex justify-between h-16"><div class="flex items-center gap-10"> <a href="/dashboard" class="flex items-center gap-2" data-svelte-h="svelte-sc039f"><span class="text-2xl font-extrabold text-spore-cream tracking-tight">SPORE</span> <span class="text-xs font-medium text-spore-steel uppercase tracking-widest">CMMS</span></a>  <div class="hidden md:flex items-center gap-1"><a href="/dashboard" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath === "/dashboard" ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Dashboard</a> <a href="/work-orders" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath.startsWith("/work-orders") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Work Orders</a> <a href="/sites" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath.startsWith("/sites") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Sites</a> <a href="/assets" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath.startsWith("/assets") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Assets</a> ${user.role === "ADMIN" ? `<a href="/users" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath.startsWith("/users") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Users</a> <a href="/audit-log" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath.startsWith("/audit-log") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Audit Log</a>` : ``}</div></div>  <div class="flex items-center gap-4"><a href="/profile" class="hidden sm:block text-right hover:opacity-80 transition-opacity"><p class="text-sm font-semibold text-spore-cream">${escape(user.firstName || user.email.split("@")[0])}</p> <p class="text-xs text-spore-steel capitalize">${escape(user.role.toLowerCase())}</p></a> <form method="POST" action="/auth/logout" data-svelte-h="svelte-4tekxq"><button type="submit" class="text-sm font-semibold text-spore-cream/50 hover:text-spore-cream transition-colors" title="Sign out of your account">Logout</button></form></div></div></div></nav>  <nav class="md:hidden bg-spore-dark border-b border-spore-steel/30 px-4 py-2"><div class="flex justify-around"><a href="/dashboard" class="${"text-lg " + escape(
    currentPath === "/dashboard" ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">📊</a> <a href="/work-orders" class="${"text-lg " + escape(
    currentPath.startsWith("/work-orders") ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">📋</a> <a href="/sites" class="${"text-lg " + escape(
    currentPath.startsWith("/sites") ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">🏢</a> <a href="/assets" class="${"text-lg " + escape(
    currentPath.startsWith("/assets") ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">⚙️</a> ${user.role === "ADMIN" ? `<a href="/users" class="${"text-lg " + escape(
    currentPath.startsWith("/users") ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">👥</a> <a href="/audit-log" class="${"text-lg " + escape(
    currentPath.startsWith("/audit-log") ? "text-spore-orange" : "text-spore-cream/70",
    true
  )}">📜</a>` : ``}</div></nav>` : ``}  <main${add_attribute("class", isAuthPage ? "" : "bg-spore-steel min-h-screen", 0)}>${slots.default ? slots.default({}) : ``}</main>`;
});
export {
  Layout as default
};
