import { c as create_ssr_component, b as validate_store, d as subscribe, o as onDestroy, e as escape, f as add_attribute, g as each } from "../../../chunks/ssr.js";
import { w as wsStore } from "../../../chunks/websocket.js";
import "devalue";
import { p as page } from "../../../chunks/stores.js";
function getUserName(user) {
  if (!user)
    return "Unassigned";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email || "Unknown";
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  validate_store(page, "page");
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  let workOrders = data.workOrders || [];
  data.assets || [];
  let users = data.users || [];
  let myOnly = data.myOnly || false;
  let wsConnected = false;
  let lastUpdate = null;
  let showCreateForm = false;
  const unsubscribe = wsStore.subscribe((state) => {
    wsConnected = state.isConnected;
    if (state.messages.length > 0) {
      const latest = state.messages[0];
      if (latest.type === "WO_UPDATE" && latest.payload) {
        const updated = latest.payload;
        workOrders = workOrders.map((wo) => {
          if (wo.id === updated.id) {
            lastUpdate = `${updated.title} → ${updated.status}`;
            return { ...wo, ...updated };
          }
          return wo;
        });
      }
      if (latest.type === "WO_NEW" && latest.payload) {
        const newWo = latest.payload;
        if (!workOrders.some((wo) => wo.id === newWo.id)) {
          workOrders = [newWo, ...workOrders];
          lastUpdate = `New: ${newWo.title}`;
        }
      }
    }
  });
  onDestroy(() => unsubscribe());
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  {
    if (data.workOrders)
      workOrders = data.workOrders;
  }
  {
    if (data.assets)
      data.assets;
  }
  {
    if (data.users)
      users = data.users;
  }
  myOnly = data.myOnly || false;
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-178cqdl_START -->${$$result.title = `<title>Work Orders — Spore CMMS</title>`, ""}<!-- HEAD_svelte-178cqdl_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-hmu04k">Work Orders</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
    wsConnected ? "text-spore-orange" : "text-spore-cream/50",
    true
  )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
    wsConnected ? "bg-spore-orange animate-pulse" : "bg-spore-cream/30",
    true
  )}" aria-hidden="true"></span> ${escape(wsConnected ? "Live updates enabled" : "Connecting...")}</span> ${lastUpdate ? `<span class="text-sm font-medium text-spore-orange animate-pulse" role="status" aria-live="polite">${escape(lastUpdate)}</span>` : ``}</div></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide"${add_attribute("aria-expanded", showCreateForm, 0)} aria-controls="create-form">${escape("+ NEW WORK ORDER")}</button></div>  <div class="flex items-center gap-3 mb-6"><span class="text-sm font-medium text-spore-cream/70" data-svelte-h="svelte-snu8mb">All</span> <a${add_attribute("href", myOnly ? "/work-orders" : "/work-orders?my=true", 0)} class="${"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + escape(myOnly ? "bg-spore-orange" : "bg-spore-steel/50", true)}" role="switch"${add_attribute("aria-checked", myOnly, 0)}><span class="${"inline-block h-4 w-4 transform rounded-full bg-white transition-transform " + escape(myOnly ? "translate-x-6" : "translate-x-1", true)}"></span></a> <span class="text-sm font-medium text-spore-cream/70" data-svelte-h="svelte-10q70yy">My Work Orders</span></div>  ${``}  ${workOrders && workOrders.length > 0 ? `<div class="bg-spore-white rounded-xl shadow-sm border border-spore-cream/50 overflow-hidden"> <div class="hidden md:block overflow-x-auto"><table class="min-w-full" role="table" aria-label="Work orders list"><thead class="bg-spore-dark"><tr><th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1gaugch">Title</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-esg2m9">Status</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1yp9u9b">Assigned</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1fv7xew">Location</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-58w39q">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
    return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors focus:outline-none focus:underline">${escape(workOrder.title)} </a></td> <td class="px-6 py-4 whitespace-nowrap"><span class="${"px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full " + escape(
      workOrder.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "PENDING" ? "bg-spore-steel text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
      true
    ) + " " + escape(
      workOrder.status === "CANCELLED" ? "bg-red-600 text-white" : "",
      true
    )}">${escape(workOrder.status.replace("_", " "))} </span></td> <td class="px-6 py-4 whitespace-nowrap"><form method="POST" action="?/assign" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="text-sm bg-transparent border-0 text-spore-steel cursor-pointer hover:text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange rounded"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
      return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName(user))}</option>`;
    })}</select> </form></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel font-medium">${workOrder.asset ? `${escape(workOrder.asset.name)}` : `${workOrder.building ? `${escape(workOrder.building.name)} ${escape(workOrder.building.site?.name ? `- ${workOrder.building.site.name}` : "")}` : `${workOrder.room ? `${escape(workOrder.room.name)} ${escape(workOrder.room.building?.name ? `- ${workOrder.room.building.name}` : "")} ${escape(workOrder.room.site?.name ? `- ${workOrder.room.site.name}` : "")}` : `N/A`}`}`}</td> <td class="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-4"><form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="text-spore-orange hover:text-spore-orange/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed" ${workOrder.status === "IN_PROGRESS" ? "disabled" : ""} title="${"Start working on " + escape(workOrder.title, true)}" aria-label="${"Start work order: " + escape(workOrder.title, true)}">Start
										</button></form> <form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="text-spore-forest hover:text-spore-forest/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed" ${workOrder.status === "COMPLETED" ? "disabled" : ""} title="${"Mark " + escape(workOrder.title, true) + " as completed"}" aria-label="${"Complete work order: " + escape(workOrder.title, true)}">Complete
										</button></form> <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-spore-steel hover:text-spore-dark focus:outline-none focus:underline" title="${"View details for " + escape(workOrder.title, true)}">View
									</a></td> </tr>`;
  })}</tbody></table></div>  <div class="md:hidden divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
    return `<div class="p-4 hover:bg-spore-cream/10 transition-colors"><div class="flex items-start justify-between mb-3"><h3 class="text-base font-bold text-spore-dark flex-1 mr-3"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="hover:text-spore-orange transition-colors focus:outline-none focus:underline">${escape(workOrder.title)} </a></h3> <span class="${"px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full " + escape(
      workOrder.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "PENDING" ? "bg-spore-steel text-white" : "",
      true
    ) + " " + escape(
      workOrder.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
      true
    ) + " " + escape(
      workOrder.status === "CANCELLED" ? "bg-red-600 text-white" : "",
      true
    )}">${escape(workOrder.status.replace("_", " "))} </span></div> <div class="space-y-2 mb-4"><div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-8jdlm4">Location:</span> <span class="text-sm text-spore-dark">${workOrder.asset ? `${escape(workOrder.asset.name)}` : `${workOrder.building ? `${escape(workOrder.building.name)} ${escape(workOrder.building.site?.name ? `- ${workOrder.building.site.name}` : "")}` : `${workOrder.room ? `${escape(workOrder.room.name)} ${escape(workOrder.room.building?.name ? `- ${workOrder.room.building.name}` : "")} ${escape(workOrder.room.site?.name ? `- ${workOrder.room.site.name}` : "")}` : `N/A`}`}`} </span></div> <div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-1es34l">Assigned:</span> <form method="POST" action="?/assign" class="flex-1 max-w-[150px]"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="w-full text-sm bg-spore-cream/30 border border-spore-cream/50 rounded-lg px-2 py-1 text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
      return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName(user))}</option>`;
    })}</select></form> </div></div> <div class="flex gap-2 text-sm font-bold"><form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="w-full bg-spore-orange text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-orange/90 focus:outline-none focus:ring-1 focus:ring-spore-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${workOrder.status === "IN_PROGRESS" ? "disabled" : ""} aria-label="${"Start work order: " + escape(workOrder.title, true)}">Start
								</button></form> <form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="w-full bg-spore-forest text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-forest/90 focus:outline-none focus:ring-1 focus:ring-spore-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${workOrder.status === "COMPLETED" ? "disabled" : ""} aria-label="${"Complete work order: " + escape(workOrder.title, true)}">Complete
								</button></form> <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="flex-1 bg-spore-cream text-spore-dark py-2 px-3 rounded-lg font-medium text-center hover:bg-spore-cream/70 focus:outline-none focus:ring-1 focus:ring-spore-cream transition-colors">View
							</a></div> </div>`;
  })}</div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl" role="status"><div class="text-5xl mb-4" aria-hidden="true" data-svelte-h="svelte-idje0l">📋</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-14qcuvf">No work orders yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-jrvcoi">Create your first work order to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold" data-svelte-h="svelte-19pqfzv">+ CREATE WORK ORDER</button></div>`}</div>`;
});
export {
  Page as default
};
