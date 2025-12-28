import { c as create_ssr_component, b as validate_store, d as subscribe, o as onDestroy, e as escape, g as add_attribute, f as each } from "../../../chunks/ssr.js";
import { w as wsStore } from "../../../chunks/websocket.js";
import "devalue";
import { p as page } from "../../../chunks/stores.js";
import { D as DEFAULT_SORT_OPTION, W as WORK_ORDER_STATUSES, P as PRIORITIES, a as WORK_ORDER_PRIORITY_COLORS, b as WORK_ORDER_STATUS_COLORS } from "../../../chunks/constants.js";
function getUserName(user) {
  if (!user)
    return "Unassigned";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email || "Unknown";
}
function isOverdue(dueDate, status) {
  if (status === "COMPLETED")
    return false;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
function getOverdueClass(dueDate, status) {
  return isOverdue(dueDate, status) ? "text-red-500 font-semibold" : "text-spore-dark";
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  validate_store(page, "page");
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  let workOrders = data.workOrders || [];
  data.assets || [];
  data.units || [];
  data.buildings || [];
  let sites = data.sites || [];
  let users = data.users || [];
  let filterStatus = data.status || "";
  let filterPriority = data.priority || "";
  let filterSite = data.siteId || "";
  let sortOption = data.sort || DEFAULT_SORT_OPTION;
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
    if (data.units)
      data.units;
  }
  {
    if (data.buildings)
      data.buildings;
  }
  {
    if (data.sites)
      sites = data.sites;
  }
  {
    if (data.users)
      users = data.users;
  }
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-178cqdl_START -->${$$result.title = `<title>Work Orders — Spore CMMS</title>`, ""}<!-- HEAD_svelte-178cqdl_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-hmu04k">Work Orders</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
    wsConnected ? "text-spore-orange" : "text-spore-cream/50",
    true
  )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
    wsConnected ? "bg-spore-orange animate-pulse" : "bg-spore-cream/30",
    true
  )}" aria-hidden="true"></span> ${escape(wsConnected ? "Live updates enabled" : "Connecting...")}</span> ${lastUpdate ? `<span class="text-sm font-medium text-spore-orange animate-pulse" role="status" aria-live="polite">${escape(lastUpdate)}</span>` : ``}</div></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide shadow-lg"${add_attribute("aria-expanded", showCreateForm, 0)} aria-controls="create-form">${escape("+ NEW WORK ORDER")}</button></div>  <div class="bg-spore-white rounded-xl mb-6 shadow-sm border border-spore-cream/50"> <div class="md:hidden p-4 border-b border-spore-cream/30 flex justify-between items-center bg-spore-cream/10"><span class="text-sm font-bold text-spore-dark uppercase tracking-wide" data-svelte-h="svelte-1t2qdoi">Filters &amp; Sort</span> <button class="text-spore-orange font-bold text-sm">${escape("Show")}</button></div>  <div class="${escape("hidden", true) + " md:block p-4 space-y-4 md:space-y-0"}"><div class="flex flex-col md:flex-row md:items-center gap-4"> <button class="${"flex items-center gap-2 px-3 py-2 rounded-lg transition-colors " + escape(
    myOnly ? "bg-spore-orange/10 text-spore-orange ring-1 ring-spore-orange" : "bg-spore-cream/20 text-spore-steel hover:bg-spore-cream/30",
    true
  )}"><span class="w-4 h-4 rounded-full border border-current flex items-center justify-center">${myOnly ? `<span class="w-2 h-2 rounded-full bg-current"></span>` : ``}</span> <span class="text-sm font-bold" data-svelte-h="svelte-eyf1ik">My Work Orders</span></button> <div class="h-6 w-px bg-spore-cream/50 hidden md:block"></div>  ${filterStatus || filterPriority || filterSite || sortOption !== "dueDate" || myOnly ? `<button class="text-xs font-bold text-red-500 hover:text-red-600 px-2" data-svelte-h="svelte-3ex7ri">Reset</button> <div class="h-6 w-px bg-spore-cream/50 hidden md:block"></div>` : ``}  <div class="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 flex-1"><select class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-1n598p3">All Statuses</option>${each(WORK_ORDER_STATUSES, (s) => {
    return `<option${add_attribute("value", s, 0)}>${escape(s.replace("_", " "))}</option>`;
  })}</select> <select class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-1sepmzx">All Priorities</option>${each(PRIORITIES, (p) => {
    return `<option${add_attribute("value", p, 0)}>${escape(p)}</option>`;
  })}</select> ${sites.length > 0 ? `<select class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-128kygr">All Sites</option>${each(sites, (s) => {
    return `<option${add_attribute("value", s.id, 0)}>${escape(s.name)}</option>`;
  })}</select>` : ``}  <select class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"><option value="dueDate" data-svelte-h="svelte-uuj5mk">Due Date</option><option value="priority" data-svelte-h="svelte-11hy9v2">Priority</option><option value="created" data-svelte-h="svelte-1ksm85e">Newest</option><option value="updated" data-svelte-h="svelte-162axp8">Updated</option></select></div></div></div></div>  ${``}  ${workOrders && workOrders.length > 0 ? `<div class="bg-spore-white rounded-xl shadow-sm border border-spore-cream/50 overflow-hidden"> <div class="hidden md:block overflow-x-auto"><table class="min-w-full" role="table" aria-label="Work orders list"><thead class="bg-spore-dark"><tr><th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-3znkiu">Title</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-19faq7s">Priority</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-11id8rq">Status</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1eniqmk">Assigned</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell" data-svelte-h="svelte-1n0iefz">Location</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell" data-svelte-h="svelte-12ixr6g">Due Date</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-4s34th">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
    return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-4 py-3"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors focus:outline-none focus:underline block">${escape(workOrder.title)} </a></td> <td class="px-4 py-3 whitespace-nowrap"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(WORK_ORDER_PRIORITY_COLORS[workOrder.priority] || WORK_ORDER_PRIORITY_COLORS.MEDIUM, true)}">${escape(workOrder.priority)} </span></td> <td class="px-4 py-3 whitespace-nowrap"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(WORK_ORDER_STATUS_COLORS[workOrder.status] || "", true)}">${escape(workOrder.status.replace("_", " "))} </span></td> <td class="px-4 py-3 whitespace-nowrap"><form method="POST" action="?/assign" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="text-xs bg-transparent border-0 text-spore-steel cursor-pointer hover:text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange rounded min-w-[120px]"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
      return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName(user))}</option>`;
    })}</select> </form></td> <td class="px-4 py-3 text-sm text-spore-steel font-medium hidden lg:table-cell">${workOrder.asset ? `${escape(workOrder.asset.name)}` : `${workOrder.building ? `${escape(workOrder.building.name)} ${escape(workOrder.building.site?.name ? `- ${workOrder.building.site.name}` : "")}` : `${workOrder.unit ? `Unit ${escape(workOrder.unit.roomNumber)} ${escape(workOrder.unit.name ? `- ${workOrder.unit.name}` : "")} ${escape(workOrder.unit.building ? ` • ${workOrder.unit.building.name}` : "")} ${escape(workOrder.unit.site?.name ? ` • ${workOrder.unit.site.name}` : "")}` : `${workOrder.site ? `${escape(workOrder.site.name)}` : `N/A`}`}`}`}</td> <td class="px-4 py-3 text-sm text-spore-steel hidden lg:table-cell">${workOrder.dueDate ? `${escape(new Date(workOrder.dueDate).toLocaleDateString())} ${isOverdue(workOrder.dueDate, workOrder.status) ? `<span class="text-red-500 font-semibold" data-svelte-h="svelte-w65mx2">(Overdue)</span>` : ``}` : `-`}</td> <td class="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2">${workOrder.status === "PENDING" ? `<form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="text-spore-orange hover:text-spore-orange/70 focus:outline-none focus:underline" title="${"Start working on " + escape(workOrder.title, true)}">Start</button> </form>` : ``} ${workOrder.status === "IN_PROGRESS" ? `<form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="text-spore-forest hover:text-spore-forest/70 focus:outline-none focus:underline" title="${"Mark " + escape(workOrder.title, true) + " as completed"}">Complete</button> </form>` : ``} <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-spore-steel hover:text-spore-dark focus:outline-none focus:underline" title="${"View details for " + escape(workOrder.title, true)}">View
									</a></td> </tr>`;
  })}</tbody></table></div>  <div class="md:hidden divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
    return `<div class="p-4 hover:bg-spore-cream/10 transition-colors"><div class="flex items-start justify-between mb-2"><h3 class="text-base font-bold text-spore-dark flex-1 mr-2"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="hover:text-spore-orange transition-colors focus:outline-none focus:underline">${escape(workOrder.title)} </a></h3> <div class="flex flex-col gap-1"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(WORK_ORDER_PRIORITY_COLORS[workOrder.priority] || WORK_ORDER_PRIORITY_COLORS.MEDIUM, true)}">${escape(workOrder.priority)}</span> <span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(WORK_ORDER_STATUS_COLORS[workOrder.status] || "", true)}">${escape(workOrder.status.replace("_", " "))}</span> </div></div> <div class="space-y-2 mb-4"><div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-8jdlm4">Location:</span> <span class="text-sm text-spore-dark text-right">${workOrder.asset ? `${escape(workOrder.asset.name)}` : `${workOrder.building ? `${escape(workOrder.building.name)}` : `${workOrder.unit ? `Unit ${escape(workOrder.unit.roomNumber)}` : `${workOrder.site ? `${escape(workOrder.site.name)}` : `N/A`}`}`}`} </span></div> ${workOrder.dueDate ? `<div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-1t4sczn">Due:</span> <span class="${"text-sm " + escape(getOverdueClass(workOrder.dueDate, workOrder.status), true)}">${escape(new Date(workOrder.dueDate).toLocaleDateString())} ${isOverdue(workOrder.dueDate, workOrder.status) ? `(Overdue)` : ``}</span> </div>` : ``} <div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-1es34l">Assigned:</span> <form method="POST" action="?/assign" class="flex-1 max-w-[150px]"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="w-full text-sm bg-spore-cream/30 border border-spore-cream/50 rounded-lg px-2 py-1 text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
      return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName(user))}</option>`;
    })}</select></form> </div></div> <div class="flex gap-2 text-sm font-bold">${workOrder.status === "PENDING" ? `<form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="w-full bg-spore-orange text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-orange/90 focus:outline-none focus:ring-1 focus:ring-spore-orange transition-colors" aria-label="${"Start work order: " + escape(workOrder.title, true)}">Start</button> </form>` : ``} ${workOrder.status === "IN_PROGRESS" ? `<form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="w-full bg-spore-forest text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-forest/90 focus:outline-none focus:ring-1 focus:ring-spore-forest transition-colors" aria-label="${"Complete work order: " + escape(workOrder.title, true)}">Complete</button> </form>` : ``} <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="flex-1 bg-spore-cream text-spore-dark py-2 px-3 rounded-lg font-medium text-center hover:bg-spore-cream/70 focus:outline-none focus:ring-1 focus:ring-spore-cream transition-colors">View
							</a></div> </div>`;
  })}</div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl" role="status"><div class="text-5xl mb-4" aria-hidden="true" data-svelte-h="svelte-idje0l">📋</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-14qcuvf">No work orders yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-jrvcoi">Create your first work order to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold" data-svelte-h="svelte-19pqfzv">+ CREATE WORK ORDER</button></div>`}</div>`;
});
export {
  Page as default
};
