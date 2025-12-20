import { c as create_ssr_component, o as onDestroy, e as escape, f as each } from "../../../chunks/ssr.js";
import { w as wsStore } from "../../../chunks/websocket.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let stats;
  let recentWorkOrders;
  let { data } = $$props;
  let wsConnected = false;
  let wsPolling = false;
  let liveFeed = [];
  let lastSeenTimestamp = 0;
  const unsubscribe = wsStore.subscribe((state) => {
    wsConnected = state.isConnected;
    wsPolling = state.isPolling;
    if (state.messages.length > 0) {
      const latest = state.messages[0];
      if (latest.timestamp && latest.timestamp > lastSeenTimestamp) {
        lastSeenTimestamp = latest.timestamp;
        if (latest.type === "WO_UPDATE") {
          const wo = latest.payload;
          liveFeed = [
            {
              type: "update",
              message: `${wo.title} → ${wo.status}`,
              time: /* @__PURE__ */ new Date(),
              id: latest.timestamp
            },
            ...liveFeed
          ].slice(0, 10);
        }
        if (latest.type === "WO_NEW") {
          const wo = latest.payload;
          liveFeed = [
            {
              type: "new",
              message: `New: ${wo.title}`,
              time: /* @__PURE__ */ new Date(),
              id: latest.timestamp
            },
            ...liveFeed
          ].slice(0, 10);
        }
      }
    }
  });
  onDestroy(() => unsubscribe());
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  stats = data.stats;
  recentWorkOrders = data.recentWorkOrders || [];
  return `${$$result.head += `<!-- HEAD_svelte-6500cf_START -->${$$result.title = `<title>Dashboard — Spore CMMS</title>`, ""}<!-- HEAD_svelte-6500cf_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="mb-10"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-1nvtx26">Dashboard</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
    wsConnected ? "text-spore-orange" : wsPolling ? "text-spore-forest" : "text-spore-cream/50",
    true
  )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
    wsConnected ? "bg-spore-orange animate-pulse" : wsPolling ? "bg-spore-forest animate-pulse" : "bg-spore-cream/30",
    true
  )}" aria-hidden="true"></span> ${wsConnected ? `Live updates enabled` : `${wsPolling ? `Polling updates` : `Connecting...`}`}</span></div></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2 space-y-8"> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-cby6zq">Total WOs</p> <p class="text-3xl font-extrabold text-spore-dark mt-1">${escape(stats?.total || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-1i4hqk4">Pending</p> <p class="text-3xl font-extrabold text-spore-orange mt-1">${escape(stats?.pending || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-m6iuib">In Progress</p> <p class="text-3xl font-extrabold text-spore-steel mt-1">${escape(stats?.inProgress || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-vsahe6">Completed</p> <p class="text-3xl font-extrabold text-spore-forest mt-1">${escape(stats?.completed || 0)}</p></div></div>  <div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50"><h2 class="text-lg font-bold text-spore-dark mb-5" data-svelte-h="svelte-10azdkw">Quick Actions</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><a href="/work-orders" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2" data-svelte-h="svelte-12ncqgl">📋</span> <span class="text-sm font-semibold text-spore-steel" data-svelte-h="svelte-5clwys">All Work Orders</span></a> <a href="/sites" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2" data-svelte-h="svelte-5v5cv7">🏢</span> <span class="text-sm font-semibold text-spore-steel" data-svelte-h="svelte-11nhmkp">Sites</span></a> <a href="/assets" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2" data-svelte-h="svelte-1m2jx05">⚙️</span> <span class="text-sm font-semibold text-spore-steel" data-svelte-h="svelte-1di72oi">Assets</span></a> <a href="/work-orders?create=true" class="flex flex-col items-center p-5 bg-spore-orange rounded-xl hover:bg-spore-orange/90 transition-colors shadow-sm hover:shadow-md"><span class="text-2xl mb-2" data-svelte-h="svelte-122o1go">➕</span> <span class="text-sm font-bold text-white" data-svelte-h="svelte-4naslt">New WO</span></a></div></div>  <div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50"><div class="flex justify-between items-center mb-5"><h2 class="text-lg font-bold text-spore-dark" data-svelte-h="svelte-1umgn2y">Recent Work Orders</h2> <a href="/work-orders" class="text-sm font-semibold text-spore-orange hover:text-spore-orange/80" data-svelte-h="svelte-1ohthn9">View all →</a></div> ${recentWorkOrders.length > 0 ? `<div class="space-y-3">${each(recentWorkOrders, (wo) => {
    return `<div class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg border border-spore-cream/50"><div class="flex-1 min-w-0"><p class="text-sm font-bold text-spore-dark truncate">${escape(wo.title)}</p> <p class="text-xs text-spore-steel mt-1">${escape(wo.asset?.room?.name ? `Room ${wo.asset.room.name}` : "")} ${escape(wo.asset?.room?.building ? ` • Bldg ${wo.asset.room.building}` : "")} ${escape(wo.asset?.room?.floor ? ` • Floor ${wo.asset.room.floor}` : "")} </p></div> <span class="${"ml-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full " + escape(
      wo.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
      true
    ) + " " + escape(
      wo.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
      true
    ) + " " + escape(
      wo.status === "PENDING" ? "bg-spore-steel text-white" : "",
      true
    ) + " " + escape(
      wo.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
      true
    )}">${escape(wo.status.replace("_", " "))}</span> </div>`;
  })}</div>` : `<p class="text-spore-steel text-sm" data-svelte-h="svelte-bae9j6">No recent work orders</p>`}</div></div>  <div class="space-y-8"><div class="bg-spore-dark rounded-xl p-6 border border-spore-steel/30"><div class="flex items-center justify-between mb-5"><h2 class="text-lg font-bold text-spore-cream" data-svelte-h="svelte-846tpj">Live Feed</h2> <span class="${"flex items-center gap-2 text-xs font-semibold " + escape(
    wsConnected ? "text-spore-orange" : wsPolling ? "text-spore-forest" : "text-spore-cream/50",
    true
  )}"><span class="${"w-2 h-2 rounded-full " + escape(
    wsConnected ? "bg-spore-orange animate-pulse" : wsPolling ? "bg-spore-forest animate-pulse" : "bg-spore-cream/30",
    true
  )}"></span> ${wsConnected ? `Live` : `${wsPolling ? `Polling` : `Offline`}`}</span></div> ${liveFeed.length > 0 ? `<div class="space-y-3">${each(liveFeed, (item) => {
    return `<div class="${"flex items-start gap-3 p-3 rounded-lg " + escape(
      item.type === "new" ? "bg-spore-forest/20" : "bg-spore-steel/50",
      true
    )}"><span class="text-base">${escape(item.type === "new" ? "🆕" : "🔄")}</span> <div class="flex-1 min-w-0"><p class="text-sm font-medium text-spore-cream truncate">${escape(item.message)}</p> <p class="text-xs text-spore-cream/50 mt-1">${escape(item.time.toLocaleTimeString())} </p></div> </div>`;
  })}</div>` : `<div class="text-center py-10"><p class="text-spore-cream/50 text-sm font-medium" data-svelte-h="svelte-jard1z">Waiting for activity...</p> <p class="text-xs text-spore-cream/30 mt-2" data-svelte-h="svelte-h90cnw">Updates appear here in real-time</p></div>`}</div>  ${data.sites && data.sites.length > 0 ? `<div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-bold text-spore-dark mb-5" data-svelte-h="svelte-ifb08s">Sites</h2> <div class="space-y-3">${each(data.sites, (site) => {
    return `<a href="${"/sites/" + escape(site.id, true)}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"><span class="text-sm font-bold text-spore-dark">${escape(site.name)}</span> <span class="text-xs font-semibold text-spore-steel">${escape(site._count?.rooms || 0)} rooms</span> </a>`;
  })}</div></div>` : ``}</div></div></div>`;
});
export {
  Page as default
};
