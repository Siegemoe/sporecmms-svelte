import { c as create_ssr_component, b as validate_store, d as subscribe, o as onDestroy, g as escape, f as add_attribute, v as validate_component, e as each } from "../../../chunks/ssr.js";
import { w as wsStore } from "../../../chunks/websocket.js";
import "devalue";
import { i as invalidateAll, g as goto, F as FilterBar } from "../../../chunks/FilterBar.js";
import { p as page } from "../../../chunks/stores.js";
import { D as DEFAULT_SORT_OPTION, W as WORK_ORDER_STATUSES, P as PRIORITIES, c as WORK_ORDER_PRIORITY_COLORS, d as WORK_ORDER_STATUS_COLORS } from "../../../chunks/constants.js";
function getUserName(user) {
  if (!user)
    return "Unassigned";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email || "Unknown";
}
function isOverdue(dueDate, status) {
  if (status === "COMPLETED" || !dueDate)
    return false;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
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
  function getSiteOptions() {
    return sites.map((s) => ({ value: s.id, label: s.name }));
  }
  let filterStatus = data.status || "";
  let filterPriority = data.priority || "";
  let filterSite = data.siteId || "";
  let sortOption = data.sort || DEFAULT_SORT_OPTION;
  let showFilters = false;
  let myOnly = data.myOnly || false;
  let searchValue = data.search || "";
  function applyFilters() {
    const params = new URLSearchParams();
    if (myOnly)
      params.set("my", "true");
    if (filterStatus)
      params.set("status", filterStatus);
    if (filterPriority)
      params.set("priority", filterPriority);
    if (filterSite)
      params.set("siteId", filterSite);
    if (sortOption && sortOption !== DEFAULT_SORT_OPTION)
      params.set("sort", sortOption);
    if (searchValue)
      params.set("search", searchValue);
    goto(`?${params.toString()}`, { keepFocus: true });
  }
  function clearFilters() {
    filterStatus = "";
    filterPriority = "";
    filterSite = "";
    sortOption = DEFAULT_SORT_OPTION;
    myOnly = false;
    searchValue = "";
    applyFilters();
  }
  function toggleMyOrders() {
    myOnly = !myOnly;
    applyFilters();
  }
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
            return { ...wo, status: updated.status };
          }
          return wo;
        });
      }
      if (latest.type === "WO_NEW" && latest.payload) {
        const newWoPayload = latest.payload;
        if (!workOrders.some((wo) => wo.id === newWoPayload.id)) {
          lastUpdate = `New: ${newWoPayload.title}`;
          invalidateAll();
        }
      }
    }
  });
  onDestroy(() => unsubscribe());
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
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
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-178cqdl_START -->${$$result.title = `<title>Work Orders — Spore CMMS</title>`, ""}<!-- HEAD_svelte-178cqdl_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-hmu04k">Work Orders</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
      wsConnected ? "text-spore-orange" : "text-spore-cream/50",
      true
    )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
      wsConnected ? "bg-spore-orange animate-pulse" : "bg-spore-cream/30",
      true
    )}" aria-hidden="true"></span> ${escape(wsConnected ? "Live updates enabled" : "Connecting...")}</span> ${lastUpdate ? `<span class="text-sm font-medium text-spore-orange animate-pulse" role="status" aria-live="polite">${escape(lastUpdate)}</span>` : ``}</div></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide shadow-lg"${add_attribute("aria-expanded", showCreateForm, 0)} aria-controls="create-form">${escape("+ NEW WORK ORDER")}</button></div>  ${validate_component(FilterBar, "FilterBar").$$render(
      $$result,
      {
        searchPlaceholder: "Search work orders...",
        searchTitle: "Search by title or description",
        onSearch: (v) => {
          searchValue = v;
          applyFilters();
        },
        toggleButtons: [
          {
            label: "My Work Orders",
            active: myOnly,
            onToggle: toggleMyOrders,
            title: "Show only my assigned work orders"
          }
        ],
        filters: [
          {
            value: filterStatus,
            placeholder: "All Statuses",
            title: "Filter by status",
            onChange: (v) => {
              filterStatus = v;
              applyFilters();
            },
            options: WORK_ORDER_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))
          },
          {
            value: filterPriority,
            placeholder: "All Priorities",
            title: "Filter by priority",
            onChange: (v) => {
              filterPriority = v;
              applyFilters();
            },
            options: PRIORITIES.map((p) => ({ value: p, label: p }))
          },
          {
            value: filterSite,
            placeholder: "All Sites",
            title: "Filter by site",
            onChange: (v) => {
              filterSite = v;
              applyFilters();
            },
            show: sites.length > 0,
            options: getSiteOptions()
          }
        ],
        sortOptions: [
          { value: "dueDate", label: "Due Date" },
          { value: "priority", label: "Priority" },
          { value: "created", label: "Newest" },
          { value: "updated", label: "Updated" }
        ],
        onSortChange: (v) => {
          sortOption = v;
          applyFilters();
        },
        onClear: clearFilters,
        clearLabel: "Reset",
        showFilters,
        searchValue,
        sortValue: sortOption
      },
      {
        showFilters: ($$value) => {
          showFilters = $$value;
          $$settled = false;
        },
        searchValue: ($$value) => {
          searchValue = $$value;
          $$settled = false;
        },
        sortValue: ($$value) => {
          sortOption = $$value;
          $$settled = false;
        }
      },
      {}
    )}  ${``}  ${workOrders && workOrders.length > 0 ? `<div class="bg-spore-white rounded-xl shadow-sm border border-spore-cream/50 overflow-hidden"> <div class="hidden md:block overflow-x-auto"><table class="min-w-full" role="table" aria-label="Work orders list"><thead class="bg-spore-dark"><tr><th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-3znkiu">Title</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-19faq7s">Priority</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-11id8rq">Status</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1eniqmk">Assigned</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell" data-svelte-h="svelte-1n0iefz">Location</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell" data-svelte-h="svelte-12ixr6g">Due Date</th> <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-4s34th">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
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
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
