import { c as create_ssr_component, e as escape, v as validate_component, f as each } from "../../../../chunks/ssr.js";
import "devalue";
import { f as formatAssetStatus } from "../../../../chunks/constants.js";
import { A as AssetStatusBadge } from "../../../../chunks/AssetStatusBadge.js";
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
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    asset = data.asset;
    data.units || [];
    woStats = data.woStats;
    $$rendered = `<div class="max-w-4xl mx-auto px-4 py-10"> <div class="mb-6"><a href="/assets" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium" title="Return to assets list" data-svelte-h="svelte-mi54uc">← Back to Assets</a></div> ${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(asset.name)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">${escape(asset.Unit?.Site?.name)} • Unit ${escape(asset.Unit?.roomNumber || asset.Unit?.name || "N/A")} ${asset.Unit?.Building ? `• Bldg ${escape(asset.Unit.Building.name)}` : ``} ${asset.Unit?.floor ? `• Floor ${escape(asset.Unit.floor)}` : ``}</p></div> <div class="flex gap-2"><button class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" title="Edit asset details" data-svelte-h="svelte-5dr1pk">EDIT</button> <form method="POST" action="?/delete"><button type="submit" class="px-4 py-2 rounded-lg font-bold text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors" title="Delete this asset" data-svelte-h="svelte-4gr9cf">DELETE</button></form></div></div></div>  <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream"><div class="p-4 border-r border-spore-cream"><p class="text-xs font-bold text-spore-steel uppercase mb-1" data-svelte-h="svelte-1eht0mz">Type</p> <p class="text-sm font-medium text-spore-dark">${escape(formatAssetStatus(asset.type || "OTHER"))}</p></div> <div class="p-4 border-r border-spore-cream"><p class="text-xs font-bold text-spore-steel uppercase mb-1" data-svelte-h="svelte-5ns9e1">Status</p> ${validate_component(AssetStatusBadge, "AssetStatusBadge").$$render($$result, { status: asset.status, size: "sm" }, {}, {})}</div> <div class="p-4 border-r border-spore-cream"><p class="text-xs font-bold text-spore-steel uppercase mb-1" data-svelte-h="svelte-sdqaom">Purchase Date</p> <p class="text-sm font-medium text-spore-dark">${escape(asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A")}</p></div> <div class="p-4"><p class="text-xs font-bold text-spore-steel uppercase mb-1" data-svelte-h="svelte-1d90ozn">Warranty</p> <p class="text-sm font-medium text-spore-dark">${escape(asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "N/A")}</p></div></div> ${asset.description ? `<div class="p-4 border-b border-spore-cream bg-spore-cream/10"><p class="text-xs font-bold text-spore-steel uppercase mb-1" data-svelte-h="svelte-16yaad1">Description</p> <p class="text-sm text-spore-dark">${escape(asset.description)}</p></div>` : ``}  <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream"><div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-dark">${escape(woStats.total)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-14h9nd3">Total WOs</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-steel">${escape(woStats.pending)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-vg7ifd">Pending</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-orange">${escape(woStats.inProgress)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-bf56gq">In Progress</p></div> <div class="p-4 text-center"><p class="text-2xl font-extrabold text-spore-forest">${escape(woStats.completed)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-300hz3">Completed</p></div></div>  <div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold text-spore-dark" data-svelte-h="svelte-1ez9epy">Work Order History</h2> <a href="${"/work-orders?asset=" + escape(asset.id, true)}" class="text-sm font-bold text-spore-orange hover:text-spore-orange/80" title="View all work orders for this asset">View All →</a></div> ${asset.WorkOrder && asset.WorkOrder.length > 0 ? `<div class="space-y-3">${each(asset.WorkOrder, (wo) => {
      return `<a href="${"/work-orders/" + escape(wo.id, true)}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50" title="${"View work order: " + escape(wo.title, true)}"><div class="flex-1 min-w-0"><p class="font-bold text-spore-dark truncate">${escape(wo.title)}</p> <p class="text-xs text-spore-steel mt-1">Created ${escape(new Date(wo.createdAt).toLocaleDateString())} </p></div> <span class="${"ml-4 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor(wo.status), true)}" title="${"Status: " + escape(wo.status.replace("_", " "), true)}">${escape(wo.status.replace("_", " "))}</span> </a>`;
    })}</div>` : `<div class="text-center py-8 bg-spore-cream/20 rounded-lg"><p class="text-spore-steel" data-svelte-h="svelte-17d3vfe">No work orders for this asset</p> <a href="/work-orders" class="inline-block mt-4 bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 transition-colors" title="Create a new work order" data-svelte-h="svelte-1fwtl72">Create Work Order</a></div>`}</div></div>`}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
