import { c as create_ssr_component, e as escape, f as each } from "../../../../chunks/ssr.js";
import "devalue";
function getStatusColor(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-spore-forest text-white";
    case "IN_PROGRESS":
      return "bg-spore-orange text-white";
    case "PENDING":
      return "bg-spore-steel text-white";
    case "ON_HOLD":
      return "bg-spore-cream text-spore-steel";
    case "CANCELLED":
      return "bg-red-600 text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let asset;
  let woStats;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  asset = data.asset;
  data.rooms || [];
  woStats = data.woStats;
  return `<div class="max-w-4xl mx-auto px-4 py-10"> <div class="mb-6" data-svelte-h="svelte-c9soqw"><a href="/assets" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">← Back to Assets</a></div> ${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(asset.name)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">${escape(asset.room?.site?.name)} • Room ${escape(asset.room?.name)} ${asset.room?.building ? `• Bldg ${escape(asset.room.building)}` : ``} ${asset.room?.floor ? `• Floor ${escape(asset.room.floor)}` : ``}</p></div> <div class="flex gap-2"><button class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" data-svelte-h="svelte-9ofjog">EDIT</button> <form method="POST" action="?/delete" data-svelte-h="svelte-8pxr33"><button type="submit" class="px-4 py-2 rounded-lg font-bold text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors" onclick="return confirm('Delete this asset? All associated work orders will also be deleted.')">DELETE</button></form></div></div></div>  <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream"><div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-dark">${escape(woStats.total)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-14h9nd3">Total WOs</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-steel">${escape(woStats.pending)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-vg7ifd">Pending</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-orange">${escape(woStats.inProgress)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-bf56gq">In Progress</p></div> <div class="p-4 text-center"><p class="text-2xl font-extrabold text-spore-forest">${escape(woStats.completed)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-300hz3">Completed</p></div></div>  <div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold text-spore-dark" data-svelte-h="svelte-1ez9epy">Work Order History</h2> <a href="${"/work-orders?asset=" + escape(asset.id, true)}" class="text-sm font-bold text-spore-orange hover:text-spore-orange/80">View All →</a></div> ${asset.workOrders && asset.workOrders.length > 0 ? `<div class="space-y-3">${each(asset.workOrders, (wo) => {
    return `<a href="${"/work-orders/" + escape(wo.id, true)}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"><div class="flex-1 min-w-0"><p class="font-bold text-spore-dark truncate">${escape(wo.title)}</p> <p class="text-xs text-spore-steel mt-1">${escape(wo.failureMode || "General")} • ${escape(new Date(wo.createdAt).toLocaleDateString())} </p></div> <span class="${"ml-4 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor(wo.status), true)}">${escape(wo.status.replace("_", " "))}</span> </a>`;
  })}</div>` : `<div class="text-center py-8 bg-spore-cream/20 rounded-lg" data-svelte-h="svelte-1gkpby5"><p class="text-spore-steel">No work orders for this asset</p> <a href="/work-orders" class="inline-block mt-4 bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 transition-colors">Create Work Order</a></div>`}</div></div>`}</div>`;
});
export {
  Page as default
};
