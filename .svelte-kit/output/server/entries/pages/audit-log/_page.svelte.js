import { c as create_ssr_component, d as each, e as escape, b as add_attribute } from "../../../chunks/ssr.js";
function getUserName(user) {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email;
}
function formatAction(action) {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
function getActionColor(action) {
  if (action.includes("DELETED"))
    return "text-red-500";
  if (action.includes("CREATED"))
    return "text-spore-forest";
  if (action.includes("CHANGED") || action.includes("ASSIGNED"))
    return "text-spore-orange";
  return "text-spore-steel";
}
function formatDetails(details) {
  if (!details)
    return "";
  if (typeof details === "object") {
    return Object.entries(details).filter(([_, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join(", ");
  }
  return String(details);
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let auditLogs;
  let page;
  let totalPages;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  auditLogs = data.auditLogs || [];
  page = data.page;
  totalPages = data.totalPages;
  return `${$$result.head += `<!-- HEAD_svelte-111n33w_START -->${$$result.title = `<title>Audit Log — Spore CMMS</title>`, ""}<!-- HEAD_svelte-111n33w_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"><div class="mb-8" data-svelte-h="svelte-o4yp00"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Audit Log</h1> <p class="text-spore-cream/60 mt-2">Track all changes made in your organization</p></div> ${auditLogs.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark" data-svelte-h="svelte-jysngp"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">When</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Who</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Action</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Details</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(auditLogs, (log) => {
    return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel"><time${add_attribute("datetime", log.createdAt.toString(), 0)}>${escape(new Date(log.createdAt).toLocaleString())} </time></td> <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-spore-dark">${escape(getUserName(log.user))}</td> <td class="px-6 py-4 whitespace-nowrap"><span class="${"text-sm font-bold " + escape(getActionColor(log.action), true)}">${escape(formatAction(log.action))} </span></td> <td class="px-6 py-4 text-sm text-spore-steel max-w-md truncate"${add_attribute("title", formatDetails(log.details), 0)}>${escape(formatDetails(log.details))}</td> </tr>`;
  })}</tbody></table></div></div>  ${totalPages > 1 ? `<div class="flex justify-center gap-2 mt-6">${page > 1 ? `<a href="${"/audit-log?page=" + escape(page - 1, true)}" class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold">← Previous</a>` : ``} <span class="px-4 py-2 text-spore-cream/60 text-sm">Page ${escape(page)} of ${escape(totalPages)}</span> ${page < totalPages ? `<a href="${"/audit-log?page=" + escape(page + 1, true)}" class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold">Next →</a>` : ``}</div>` : ``}` : `<div class="text-center py-16 bg-spore-white rounded-xl" data-svelte-h="svelte-7g3wy2"><div class="text-5xl mb-4">📜</div> <h3 class="text-xl font-bold text-spore-dark mb-2">No activity yet</h3> <p class="text-spore-steel">Actions will be recorded here as users make changes</p></div>`}</div>`;
});
export {
  Page as default
};
