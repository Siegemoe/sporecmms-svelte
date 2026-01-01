import { c as create_ssr_component, g as escape, v as validate_component, e as each, f as add_attribute } from "../../../chunks/ssr.js";
import "devalue";
import { g as goto, F as FilterBar } from "../../../chunks/FilterBar.js";
import { p as page } from "../../../chunks/stores.js";
function getRoleBadgeClasses(role) {
  const baseClasses = "px-2 py-1 text-xs font-bold uppercase rounded-full border-0 cursor-pointer";
  const colorClasses = {
    ADMIN: "bg-spore-orange text-white",
    MANAGER: "bg-spore-forest text-white",
    TECHNICIAN: "bg-spore-steel text-white"
  };
  return `${baseClasses} ${colorClasses[role]}`;
}
const ROLE_NAMES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician"
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let users;
  let { data } = $$props;
  let showFilters = false;
  let searchValue = "";
  let filterRole = "";
  let filterStatus = "";
  let sortOption = "name";
  function applyFilters() {
    const params = new URLSearchParams();
    if (searchValue)
      params.set("search", searchValue);
    if (filterRole)
      params.set("role", filterRole);
    if (filterStatus)
      params.set("status", filterStatus);
    if (sortOption !== "name")
      params.set("sort", sortOption);
    const queryString = params.toString();
    goto(`?${queryString}`, { replaceState: true, keepFocus: true });
  }
  function clearFilters() {
    searchValue = "";
    filterRole = "";
    filterStatus = "";
    sortOption = "name";
    goto("?", { replaceState: true, keepFocus: true });
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    users = data.users || [];
    {
      if (page.url) {
        const urlParams = page.url.searchParams;
        searchValue = urlParams.get("search") || "";
        filterRole = urlParams.get("role") || "";
        filterStatus = urlParams.get("status") || "";
        sortOption = urlParams.get("sort") || "name";
      }
    }
    $$rendered = `<div class="max-w-7xl mx-auto px-4 py-10"> <div class="mb-8"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-t6iemi">Users</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${escape(users.length)} team member${escape(users.length !== 1 ? "s" : "")}</p></div> <div class="flex gap-3"><a href="/users/security" class="bg-spore-steel text-spore-cream px-6 py-3 rounded-xl hover:bg-spore-steel/90 transition-colors text-sm font-bold tracking-wide" data-svelte-h="svelte-6mogsj">🔒 Security</a> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ ADD USER")}</button></div></div>  ${validate_component(FilterBar, "FilterBar").$$render(
      $$result,
      {
        searchPlaceholder: "Search users...",
        searchTitle: "Search by name or email",
        onSearch: (v) => {
          searchValue = v;
          applyFilters();
        },
        toggleButtons: [],
        filters: [
          {
            value: filterRole,
            placeholder: "All Roles",
            title: "Filter by role",
            onChange: (v) => {
              filterRole = v;
              applyFilters();
            },
            options: Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label }))
          },
          {
            value: filterStatus,
            placeholder: "All Status",
            title: "Filter by status",
            onChange: (v) => {
              filterStatus = v;
              applyFilters();
            },
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]
          }
        ],
        sortOptions: [
          { value: "name", label: "Name" },
          { value: "email", label: "Email" },
          { value: "role", label: "Role" },
          { value: "joined", label: "Joined" },
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
    )}</div>  ${``}  ${users.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1tc615d">User</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-j44ek2">Email</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-devm0q">Role</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-9iareg">Status</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1us0d3z">Joined</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1r8dv0n">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(users, (user) => {
      return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><span class="text-sm font-bold text-spore-dark">${escape(user.firstName || "")} ${escape(user.lastName || "")} ${!user.firstName && !user.lastName ? `<span class="text-spore-steel" data-svelte-h="svelte-6cnpz3">(No name)</span>` : ``} </span></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(user.email)}</td> <td class="px-6 py-4 whitespace-nowrap"><form method="POST" action="?/updateRole" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <select name="role"${add_attribute("value", user.role, 0)}${add_attribute("class", getRoleBadgeClasses(user.role), 0)}>${each(["TECHNICIAN", "MANAGER", "ADMIN"], (role) => {
        return `<option${add_attribute("value", role, 0)}>${escape(ROLE_NAMES[role])}</option>`;
      })}</select> </form></td> <td class="px-6 py-4 whitespace-nowrap"><span class="${"px-2 py-1 text-xs font-medium rounded-full " + escape(
        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
        true
      )}">${escape(user.isActive ? "Active" : "Inactive")} </span></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(new Date(user.createdAt).toLocaleDateString())}</td> <td class="px-6 py-4 whitespace-nowrap text-sm"><form method="POST" action="?/delete" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <button type="submit" class="text-red-500 hover:text-red-400 font-bold transition-colors" data-svelte-h="svelte-gvkpdz">Delete</button> </form></td> </tr>`;
    })}</tbody></table></div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1i6rpvs">👥</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-xk78eh">No users yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-1iuc5bd">Add team members to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-174euj2">+ ADD USER</button></div>`}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
