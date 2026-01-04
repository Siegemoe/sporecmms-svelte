import { c as create_ssr_component, a as createEventDispatcher, b as validate_store, d as subscribe, e as each, f as add_attribute, g as escape, v as validate_component } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import "devalue";
const app = "";
const QuickFAB = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { assets = [] } = $$props;
  let { buildings = [] } = $$props;
  let { rooms = [] } = $$props;
  let { templates = [] } = $$props;
  createEventDispatcher();
  if ($$props.assets === void 0 && $$bindings.assets && assets !== void 0)
    $$bindings.assets(assets);
  if ($$props.buildings === void 0 && $$bindings.buildings && buildings !== void 0)
    $$bindings.buildings(buildings);
  if ($$props.rooms === void 0 && $$bindings.rooms && rooms !== void 0)
    $$bindings.rooms(rooms);
  if ($$props.templates === void 0 && $$bindings.templates && templates !== void 0)
    $$bindings.templates(templates);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = ` ${` <button type="button" class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 lg:hidden" title="Create Work Order" aria-label="Create Work Order"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button>  <button type="button" class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 hidden lg:flex" title="Create Work Order" aria-label="Create Work Order"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button>`}  ${``}`;
  } while (!$$settled);
  return $$rendered;
});
const breadcrumbConfig = {
  excludedPaths: [
    "/",
    "/auth.*",
    "/onboarding",
    "/join-organization",
    "/select-organization"
  ],
  routes: [
    { path: "/dashboard", title: "Dashboard", icon: "📊" },
    {
      path: "/work-orders",
      title: "Work Orders",
      icon: "📋",
      parent: "/dashboard"
    },
    {
      path: "/work-orders/[id]",
      title: "Work Order",
      dynamic: true,
      fetchTitle: (_params, data) => data.pageData?.workOrder?.title || "Work Order",
      parent: "/work-orders"
    },
    {
      path: "/sites",
      title: "Sites",
      icon: "🏢",
      parent: "/dashboard"
    },
    {
      path: "/sites/[id]",
      title: "Site",
      dynamic: true,
      fetchTitle: (_params, data) => data.pageData?.site?.name || "Site",
      parent: "/sites"
    },
    {
      path: "/assets",
      title: "Assets",
      icon: "⚙️",
      parent: "/dashboard"
    },
    {
      path: "/assets/[id]",
      title: "Asset",
      dynamic: true,
      fetchTitle: (_params, data) => data.pageData?.asset?.name || "Asset",
      parent: "/assets"
    },
    {
      path: "/templates",
      title: "Templates",
      icon: "📝",
      parent: "/dashboard"
    },
    {
      path: "/templates/[id]",
      title: "Template",
      dynamic: true,
      fetchTitle: (_params, data) => data.pageData?.template?.name || "Template",
      parent: "/templates"
    },
    {
      path: "/work-orders/new",
      title: "New Work Order",
      parent: "/work-orders"
    },
    {
      path: "/users",
      title: "Users",
      icon: "👥",
      parent: "/dashboard"
    },
    { path: "/users/security", title: "Security", parent: "/users" },
    {
      path: "/audit-log",
      title: "Audit Log",
      icon: "📜",
      parent: "/dashboard"
    },
    { path: "/profile", title: "Profile" }
  ]
};
function isPathExcluded(pathname) {
  return breadcrumbConfig.excludedPaths.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}
function patternToRegex(pattern) {
  return new RegExp(
    "^" + pattern.replace(/\[([^\]]+)\]/g, "([^/]+)") + "$"
  );
}
function extractParams(pattern, pathname) {
  const regex = patternToRegex(pattern);
  const match = pathname.match(regex);
  if (!match)
    return null;
  const paramNames = pattern.match(/\[([^\]]+)\]/g) || [];
  const params = {};
  paramNames.forEach((param, index) => {
    const paramName = param.slice(1, -1);
    params[paramName] = match[index + 1];
  });
  return params;
}
function findRoute(pathname) {
  for (const route of breadcrumbConfig.routes) {
    const params = extractParams(route.path, pathname);
    if (params) {
      return { route, params };
    }
  }
  return null;
}
function getParentPath(routePath, explicitParent) {
  if (explicitParent)
    return explicitParent;
  const segments = routePath.split("/").filter(Boolean);
  if (segments.length <= 1)
    return null;
  segments.pop();
  return "/" + segments.join("/");
}
function buildHref(pattern, params) {
  let href = pattern;
  Object.entries(params).forEach(([key, value]) => {
    href = href.replace(`[${key}]`, value);
  });
  return href;
}
function getBreadcrumbs(pathname, pageParams, pageData, userRole) {
  const items = [];
  const match = findRoute(pathname);
  if (!match)
    return items;
  const { route, params } = match;
  if (route.role && route.role !== userRole)
    return items;
  const visited = /* @__PURE__ */ new Set();
  const buildHierarchy = (currentPath) => {
    if (visited.has(currentPath))
      return [];
    visited.add(currentPath);
    const routeMatch = findRoute(currentPath);
    if (!routeMatch)
      return [];
    const { route: currentRoute, params: currentParams } = routeMatch;
    if (currentRoute.role && currentRoute.role !== userRole)
      return [];
    const parentPath = getParentPath(currentRoute.path, currentRoute.parent);
    const parentItems = parentPath ? buildHierarchy(parentPath) : [];
    let title = currentRoute.title;
    if (currentRoute.dynamic && currentRoute.fetchTitle) {
      title = currentRoute.fetchTitle(currentParams, { pageData, user: { role: userRole } });
    }
    const href = buildHref(currentRoute.path, currentParams);
    const isCurrentPage = href === pathname;
    return [
      ...parentItems,
      {
        title,
        href: isCurrentPage ? void 0 : href,
        icon: currentRoute.icon
      }
    ];
  };
  return buildHierarchy(pathname);
}
const Breadcrumb = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showBreadcrumbs;
  let breadcrumbs;
  let $page, $$unsubscribe_page;
  validate_store(page, "page");
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let currentPathname = "";
  {
    if ($page.url) {
      currentPathname = $page.url.pathname;
    }
  }
  showBreadcrumbs = !isPathExcluded(currentPathname);
  breadcrumbs = getBreadcrumbs(
    currentPathname,
    $page.params || {},
    {
      pageData: $page.data,
      user: { role: $page.data?.user?.role }
    },
    $page.data?.user?.role
  );
  $$unsubscribe_page();
  return `${showBreadcrumbs && breadcrumbs.length > 0 ? `<nav class="bg-spore-steel" aria-label="Breadcrumb"><div class="max-w-7xl mx-auto px-4 py-2"><ol class="flex items-center gap-2 text-sm overflow-x-auto">${each(breadcrumbs, (crumb, index) => {
    return `<li class="flex items-center gap-2">${index > 0 ? `<svg class="w-4 h-4 text-spore-cream/30 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg> ` : ``}}
						${crumb.href ? `<a${add_attribute("href", crumb.href, 0)} class="text-spore-cream/60 hover:text-spore-orange transition-colors truncate max-w-[200px]">${escape(crumb.title)} </a>` : `<span class="text-spore-orange font-semibold truncate max-w-[200px]">${escape(crumb.title)} </span>`} </li>`;
  })}</ol></div></nav>` : ``}`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let user;
  let authState;
  let isAuthPage;
  let isLandingPage;
  let isOnboardingPage;
  let showFAB;
  let $page, $$unsubscribe_page;
  validate_store(page, "page");
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  currentPath = $page.url.pathname;
  user = data.user;
  authState = data.authState;
  isAuthPage = currentPath.startsWith("/auth");
  isLandingPage = currentPath === "/";
  isOnboardingPage = currentPath.startsWith("/onboarding") || currentPath.startsWith("/join-organization") || currentPath.startsWith("/select-organization");
  showFAB = user && authState === "org_member" && !isAuthPage && !isLandingPage && !isOnboardingPage && !currentPath.startsWith("/work-orders/new");
  $$unsubscribe_page();
  return `${!isAuthPage && !isLandingPage && !isOnboardingPage && user && authState === "org_member" ? ` <nav class="bg-spore-dark border-b border-spore-steel/30"><div class="max-w-7xl mx-auto px-4"><div class="flex justify-between h-16"><div class="flex items-center gap-10"> <a href="/dashboard" class="flex items-center gap-2"><span class="text-2xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-p6fqmb">SPORE</span> <span class="text-xs font-medium text-spore-steel uppercase tracking-widest" data-svelte-h="svelte-1fermaa">CMMS</span></a>  <div class="hidden md:flex items-center gap-1"><a href="/dashboard" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
    currentPath === "/dashboard" ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Dashboard</a>  <div class="relative"><button class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors flex items-center gap-1 " + escape(
    currentPath.startsWith("/work-orders") || currentPath.startsWith("/templates") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
    true
  )}">Work Orders
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>  <div id="wo-menu" class="hidden absolute left-0 mt-2 w-48 bg-spore-cream rounded-lg shadow-lg border border-spore-forest/20 z-50"><div class="py-1"><a href="/work-orders" class="block px-4 py-2 text-sm font-bold text-spore-forest hover:bg-spore-forest/10 transition-colors" data-svelte-h="svelte-19kcx05">Work Order Manager</a> <a href="/templates" class="block px-4 py-2 text-sm font-bold text-spore-forest hover:bg-spore-forest/10 transition-colors" data-svelte-h="svelte-vgv6ve">Template Manager</a></div></div></div> <a href="/sites" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
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
  )}">Audit Log</a>` : ``}</div></div>  <div class="flex items-center gap-4">${data.organizations && data.organizations.length > 1 ? `<div class="relative hidden sm:block"><button class="text-right hover:opacity-80 transition-opacity"><p class="text-sm font-semibold text-spore-cream">${escape(user?.firstName || user?.email?.split("@")[0] || "User")}</p> <p class="text-xs text-spore-orange flex items-center gap-1">${escape(data.currentOrganization?.name || "Select Organization")} <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></p></button>  <div id="org-menu" class="hidden absolute right-0 mt-2 w-56 bg-spore-dark rounded-lg shadow-lg border border-spore-steel/30 z-50"><div class="py-1">${each(data.organizations, (org) => {
    return `<form method="POST" action="/select-organization" class="contents"><input type="hidden" name="organizationId"${add_attribute("value", org.id, 0)}> <button type="submit" class="${"w-full px-4 py-2 text-left text-sm hover:bg-spore-cream/10 transition-colors " + escape(
      org.id === data.currentOrganization?.id ? "text-spore-orange bg-spore-cream/5" : "text-spore-cream/80",
      true
    )}">${escape(org.name)} ${org.id === data.currentOrganization?.id ? `<span class="ml-2 text-xs" data-svelte-h="svelte-1b39yym">(Current)</span>` : ``}</button> </form>`;
  })}</div></div></div>` : `<a href="/profile" class="hidden sm:block text-right hover:opacity-80 transition-opacity"><p class="text-sm font-semibold text-spore-cream">${escape(user?.firstName || user?.email?.split("@")[0] || "User")}</p> <p class="text-xs text-spore-steel capitalize">${escape(user?.role?.toLowerCase() || "member")}</p></a>`} <form method="POST" action="/auth/logout"><button type="submit" class="text-sm font-semibold text-spore-cream/50 hover:text-spore-cream transition-colors" title="Sign out of your account" data-svelte-h="svelte-ou1opy">Logout</button></form></div></div></div></nav>  <nav class="md:hidden bg-spore-dark border-b border-spore-steel/30">${data.organizations && data.organizations.length > 1 ? ` <div class="px-4 py-3 border-b border-spore-steel/20"><div class="flex items-center justify-between"><span class="text-xs font-semibold text-spore-steel uppercase tracking-wider" data-svelte-h="svelte-1ihtktw">Organization</span> <div class="flex items-center gap-2"><span class="text-sm font-medium text-spore-orange truncate max-w-[180px]">${escape(data.currentOrganization?.name || "Select...")}</span> <a href="/select-organization" class="text-spore-cream/60 hover:text-spore-cream transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></a></div></div></div>` : ``} <div class="flex justify-around items-center py-3 shadow-lg"><a href="/dashboard" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
    currentPath === "/dashboard" ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-xl leading-none" data-svelte-h="svelte-n8oaaj">📊</span> <span class="text-xs font-medium" data-svelte-h="svelte-q6iwf9">Dashboard</span></a> <a href="/work-orders" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/work-orders") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-xl leading-none" data-svelte-h="svelte-ud50em">📋</span> <span class="text-xs font-medium" data-svelte-h="svelte-t3cpir">Work Orders</span></a> <a href="/templates" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/templates") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-xl leading-none" data-svelte-h="svelte-108gef0">📝</span> <span class="text-xs font-medium" data-svelte-h="svelte-fxknzk">Templates</span></a> <a href="/sites" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/sites") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-xl leading-none" data-svelte-h="svelte-1oi8lds">🏢</span> <span class="text-xs font-medium" data-svelte-h="svelte-1vga3wp">Sites</span></a> <a href="/assets" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/assets") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-xl leading-none" data-svelte-h="svelte-170tr8u">⚙️</span> <span class="text-xs font-medium" data-svelte-h="svelte-1vr39kw">Assets</span></a> ${user.role === "ADMIN" ? `<div class="flex gap-2"><a href="/users" class="${"flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/users") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-lg leading-none" data-svelte-h="svelte-kzuy6d">👥</span></a> <a href="/audit-log" class="${"flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors " + escape(
    currentPath.startsWith("/audit-log") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
    true
  )}"><span class="text-lg leading-none" data-svelte-h="svelte-r3t20g">📜</span></a></div>` : ``}</div></nav>` : ``}  ${validate_component(Breadcrumb, "Breadcrumb").$$render($$result, {}, {}, {})} <main${add_attribute(
    "class",
    isAuthPage || isLandingPage ? "" : "bg-spore-steel min-h-screen",
    0
  )}>${slots.default ? slots.default({}) : ``}</main>  ${showFAB ? `${validate_component(QuickFAB, "QuickFAB").$$render(
    $$result,
    {
      assets: data.assets || [],
      buildings: data.buildings || [],
      rooms: data.rooms || [],
      templates: data.templates || []
    },
    {},
    {}
  )}` : ``}`;
});
export {
  Layout as default
};
