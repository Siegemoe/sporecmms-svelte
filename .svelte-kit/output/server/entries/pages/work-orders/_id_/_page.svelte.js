import { c as create_ssr_component, e as escape, f as each, g as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import { W as WORK_ORDER_STATUSES } from "../../../../chunks/constants.js";
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
  let workOrder;
  let { data } = $$props;
  const statuses = WORK_ORDER_STATUSES;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  workOrder = data.workOrder;
  data.assets || [];
  return `<div class="max-w-4xl mx-auto px-4 py-10"> <div class="mb-6"><a href="/work-orders" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium" data-svelte-h="svelte-14416lk">← Back to Work Orders</a></div> ${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(workOrder.title)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">Created ${escape(new Date(workOrder.createdAt).toLocaleDateString())}</p></div> <span class="${"px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor(workOrder.status), true)}">${escape(workOrder.status.replace("_", " "))}</span></div></div>  <div class="p-6 space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-exijn3">Asset</h3> <p class="text-spore-dark font-semibold">${escape(workOrder.asset?.name || "Unassigned")}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-2zeft2">Location</h3> <p class="text-spore-dark font-semibold">${workOrder.asset?.room ? `${escape(workOrder.asset.room.site?.name ?? "Unknown Site")} • Room ${escape(workOrder.asset.room.name ?? "Unknown Room")} ${workOrder.asset.room.building ? `• ${escape(workOrder.asset.room.building.name ?? "Unknown Building")}` : ``} ${workOrder.asset.room.floor ? `• Floor ${escape(workOrder.asset.room.floor)}` : ``}` : `No location`}</p></div>  <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-11fnt6e">Last Updated</h3> <p class="text-spore-dark font-semibold">${escape(new Date(workOrder.updatedAt).toLocaleString())}</p></div></div>  ${workOrder.description ? `<div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-rq73nx">Description</h3> <p class="text-spore-dark whitespace-pre-wrap">${escape(workOrder.description)}</p></div>` : ``}  <div class="border-t border-spore-cream pt-6"><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-4" data-svelte-h="svelte-c3uwlf">Change Status</h3> <div class="flex flex-wrap gap-2">${each(statuses, (status) => {
    return `<form method="POST" action="?/updateStatus"><input type="hidden" name="status"${add_attribute("value", status, 0)}> <button type="submit" ${workOrder.status === status ? "disabled" : ""} class="${"px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed " + escape(getStatusColor(status), true) + " hover:opacity-80"}">${escape(status.replace("_", " "))}</button> </form>`;
  })}</div></div>  <div class="border-t border-spore-cream pt-6 flex gap-4"><button class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" data-svelte-h="svelte-e0q83b">EDIT WORK ORDER</button> <form method="POST" action="?/delete"><button type="submit" class="px-6 py-3 rounded-lg font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors" data-svelte-h="svelte-1jld8fa">DELETE</button></form></div></div></div>`}</div>`;
});
export {
  Page as default
};
