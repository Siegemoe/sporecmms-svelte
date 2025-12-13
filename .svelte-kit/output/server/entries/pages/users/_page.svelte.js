import { c as create_ssr_component, e as escape, g as each, f as add_attribute } from "../../../chunks/ssr.js";
import "devalue";
function getRoleBadgeColor(role) {
  switch (role) {
    case "ADMIN":
      return "bg-spore-orange text-white";
    case "MANAGER":
      return "bg-spore-forest text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let users;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  users = data.users || [];
  return `<div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-t6iemi">Users</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${escape(users.length)} team member${escape(users.length !== 1 ? "s" : "")}</p></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ ADD USER")}</button></div>  ${``}  ${users.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1tc615d">User</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-j44ek2">Email</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-devm0q">Role</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1us0d3z">Joined</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1r8dv0n">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(users, (user) => {
    return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><span class="text-sm font-bold text-spore-dark">${escape(user.firstName || "")} ${escape(user.lastName || "")} ${!user.firstName && !user.lastName ? `<span class="text-spore-steel" data-svelte-h="svelte-6cnpz3">(No name)</span>` : ``} </span></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(user.email)}</td> <td class="px-6 py-4 whitespace-nowrap"><form method="POST" action="?/updateRole" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <select name="role"${add_attribute("value", user.role, 0)} class="${"px-2 py-1 text-xs font-bold uppercase rounded-full border-0 cursor-pointer " + escape(getRoleBadgeColor(user.role), true)}"><option value="TECHNICIAN" data-svelte-h="svelte-1npbobm">Technician</option><option value="MANAGER" data-svelte-h="svelte-17d1rxs">Manager</option><option value="ADMIN" data-svelte-h="svelte-uoqvo8">Admin</option></select> </form></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(new Date(user.createdAt).toLocaleDateString())}</td> <td class="px-6 py-4 whitespace-nowrap text-sm"><form method="POST" action="?/delete" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <button type="submit" class="text-red-500 hover:text-red-400 font-bold transition-colors" data-svelte-h="svelte-gvkpdz">Delete</button> </form></td> </tr>`;
  })}</tbody></table></div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1i6rpvs">👥</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-xk78eh">No users yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-1iuc5bd">Add team members to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-174euj2">+ ADD USER</button></div>`}</div>`;
});
export {
  Page as default
};
