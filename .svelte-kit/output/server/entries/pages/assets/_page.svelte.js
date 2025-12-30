import { c as create_ssr_component, g as add_attribute, f as each, e as escape, v as validate_component } from "../../../chunks/ssr.js";
import "devalue";
import { g as goto, F as FilterBar } from "../../../chunks/FilterBar.js";
import { A as ASSET_TYPES, a as ASSET_STATUSES, f as formatAssetStatus } from "../../../chunks/constants.js";
import { A as AssetStatusBadge } from "../../../chunks/AssetStatusBadge.js";
function getUnitLabel(unit) {
  const parts = [unit.site?.name, `Unit ${unit.roomNumber}`];
  if (unit.building)
    parts.push(`(${unit.building.name})`);
  if (unit.name)
    parts.push(`- ${unit.name}`);
  return parts.filter(Boolean).join(" ");
}
const AssetForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { units = [] } = $$props;
  let { name = "" } = $$props;
  let { unitId = "" } = $$props;
  let { type = "OTHER" } = $$props;
  let { status = "OPERATIONAL" } = $$props;
  let { description = "" } = $$props;
  let { purchaseDate = "" } = $$props;
  let { warrantyExpiry = "" } = $$props;
  let { submitLabel = "SAVE" } = $$props;
  let { isSubmitting = false } = $$props;
  let { showCancel = false } = $$props;
  let { onCancel = void 0 } = $$props;
  if ($$props.units === void 0 && $$bindings.units && units !== void 0)
    $$bindings.units(units);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.unitId === void 0 && $$bindings.unitId && unitId !== void 0)
    $$bindings.unitId(unitId);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.purchaseDate === void 0 && $$bindings.purchaseDate && purchaseDate !== void 0)
    $$bindings.purchaseDate(purchaseDate);
  if ($$props.warrantyExpiry === void 0 && $$bindings.warrantyExpiry && warrantyExpiry !== void 0)
    $$bindings.warrantyExpiry(warrantyExpiry);
  if ($$props.submitLabel === void 0 && $$bindings.submitLabel && submitLabel !== void 0)
    $$bindings.submitLabel(submitLabel);
  if ($$props.isSubmitting === void 0 && $$bindings.isSubmitting && isSubmitting !== void 0)
    $$bindings.isSubmitting(isSubmitting);
  if ($$props.showCancel === void 0 && $$bindings.showCancel && showCancel !== void 0)
    $$bindings.showCancel(showCancel);
  if ($$props.onCancel === void 0 && $$bindings.onCancel && onCancel !== void 0)
    $$bindings.onCancel(onCancel);
  return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><input type="text" name="name" placeholder="Asset name (e.g., HVAC Unit #1)" title="Enter a descriptive name for this asset" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" required${add_attribute("value", name, 0)}> <select name="unitId" title="Select the unit where this asset is located" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange" required><option value="" data-svelte-h="svelte-1v0ye9v">Select a unit...</option>${each(units, (unit) => {
    return `<option${add_attribute("value", unit.id, 0)}>${escape(getUnitLabel(unit))}</option>`;
  })}</select> <select name="type" title="Choose the asset type/category" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange">${each(ASSET_TYPES, (typeOption) => {
    return `<option${add_attribute("value", typeOption, 0)}>${escape(typeOption.replace("_", " "))}</option>`;
  })}</select> <select name="status" title="Set the current operational status of this asset" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange">${each(ASSET_STATUSES, (statusOption) => {
    return `<option${add_attribute("value", statusOption, 0)}>${escape(statusOption.replace("_", " "))}</option>`;
  })}</select> <input type="date" name="purchaseDate" title="Enter the date this asset was purchased" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", purchaseDate, 0)}> <input type="date" name="warrantyExpiry" title="Enter the warranty expiration date" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", warrantyExpiry, 0)}> <textarea name="description" placeholder="Description (optional)" title="Add additional details about this asset" rows="3" class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange md:col-span-2">${escape(description || "")}</textarea> <div class="flex gap-2 md:col-span-3"><button type="submit" ${isSubmitting || !name.trim() || !unitId ? "disabled" : ""} title="Save this asset" class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">${escape(isSubmitting ? "SAVING..." : submitLabel)}</button> ${showCancel && onCancel ? `<button type="button" title="Cancel and return to view mode" class="px-6 py-3 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors" data-svelte-h="svelte-ez49ph">CANCEL</button>` : ``}</div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let assets;
  let units;
  let sites;
  let { data } = $$props;
  let isSubmitting = false;
  let showFilters = false;
  let editingAssetId = null;
  let editingAsset = {
    name: "",
    unitId: "",
    type: "OTHER",
    status: "OPERATIONAL",
    description: "",
    purchaseDate: "",
    warrantyExpiry: ""
  };
  let filterType = data.type || "";
  let filterStatus = data.status || "";
  let filterSite = data.siteId || "";
  let sortOption = data.sort || "created";
  let searchValue = data.search || "";
  function applyFilters() {
    const params = new URLSearchParams();
    if (filterType)
      params.set("type", filterType);
    if (filterStatus)
      params.set("status", filterStatus);
    if (filterSite)
      params.set("siteId", filterSite);
    if (sortOption && sortOption !== "created")
      params.set("sort", sortOption);
    if (searchValue)
      params.set("search", searchValue);
    goto(`?${params.toString()}`, { keepFocus: true });
  }
  function clearFilters() {
    filterType = "";
    filterStatus = "";
    filterSite = "";
    sortOption = "created";
    searchValue = "";
    applyFilters();
  }
  function cancelEdit() {
    editingAssetId = null;
    editingAsset = {
      name: "",
      unitId: "",
      type: "OTHER",
      status: "OPERATIONAL",
      description: "",
      purchaseDate: "",
      warrantyExpiry: ""
    };
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    assets = data.assets || [];
    units = data.units || [];
    sites = data.sites || [];
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-5egb08_START -->${$$result.title = `<title>Assets — Spore CMMS</title>`, ""}<!-- HEAD_svelte-5egb08_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-b9dnm5">Assets</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${escape(assets.length)} total asset${escape(assets.length !== 1 ? "s" : "")}</p></div> <button${add_attribute(
      "title",
      "Create a new asset",
      0
    )} class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ NEW ASSET")}</button></div>  ${validate_component(FilterBar, "FilterBar").$$render(
      $$result,
      {
        searchPlaceholder: "Search assets...",
        searchTitle: "Search by name or description",
        onSearch: (v) => {
          searchValue = v;
          applyFilters();
        },
        toggleButtons: [],
        filters: [
          {
            value: filterType,
            placeholder: "All Types",
            title: "Filter by asset type",
            onChange: (v) => {
              filterType = v;
              applyFilters();
            },
            options: ASSET_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") }))
          },
          {
            value: filterStatus,
            placeholder: "All Statuses",
            title: "Filter by status",
            onChange: (v) => {
              filterStatus = v;
              applyFilters();
            },
            options: ASSET_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))
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
            options: sites.map((s) => ({ value: s.id, label: s.name }))
          }
        ],
        sortOptions: [
          { value: "created", label: "Newest" },
          { value: "name", label: "Name" },
          { value: "type", label: "Type" },
          { value: "status", label: "Status" }
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
    )}  ${``}  ${assets.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark"><tr><th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-eph96p">Asset</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1skifmx">Type</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-1wy5e1r">Status</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden md:table-cell" data-svelte-h="svelte-2ejboa">Location</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider text-center" data-svelte-h="svelte-1creitc">WO</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell" data-svelte-h="svelte-4skpp3">Created</th> <th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider" data-svelte-h="svelte-vmrd6s">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(assets, (asset) => {
      return `${editingAssetId === asset.id ? ` <tr class="bg-spore-orange/10"><td class="p-2" colspan="7"><form method="POST" action="?/update"><input type="hidden" name="assetId"${add_attribute("value", asset.id, 0)}> ${validate_component(AssetForm, "AssetForm").$$render(
        $$result,
        {
          units,
          submitLabel: "SAVE",
          isSubmitting,
          showCancel: true,
          onCancel: cancelEdit,
          name: editingAsset.name,
          unitId: editingAsset.unitId,
          type: editingAsset.type,
          status: editingAsset.status,
          description: editingAsset.description,
          purchaseDate: editingAsset.purchaseDate,
          warrantyExpiry: editingAsset.warrantyExpiry
        },
        {
          name: ($$value) => {
            editingAsset.name = $$value;
            $$settled = false;
          },
          unitId: ($$value) => {
            editingAsset.unitId = $$value;
            $$settled = false;
          },
          type: ($$value) => {
            editingAsset.type = $$value;
            $$settled = false;
          },
          status: ($$value) => {
            editingAsset.status = $$value;
            $$settled = false;
          },
          description: ($$value) => {
            editingAsset.description = $$value;
            $$settled = false;
          },
          purchaseDate: ($$value) => {
            editingAsset.purchaseDate = $$value;
            $$settled = false;
          },
          warrantyExpiry: ($$value) => {
            editingAsset.warrantyExpiry = $$value;
            $$settled = false;
          }
        },
        {}
      )} </form></td> </tr>` : ` <tr class="hover:bg-spore-cream/20 transition-colors group"><td class="px-4 py-3"><a href="${"/assets/" + escape(asset.id, true)}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors block" title="View asset details">${escape(asset.name)} ${asset.description ? `<span class="text-xs text-spore-steel/70 font-normal block">${escape(asset.description.slice(0, 50))}${escape(asset.description.length > 50 ? "..." : "")}</span>` : ``} </a></td> <td class="px-4 py-3"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-spore-cream/20 text-spore-steel" title="${"Asset type: " + escape(formatAssetStatus(asset.type || "OTHER"), true)}">${escape(formatAssetStatus(asset.type || "OTHER"))} </span></td> <td class="px-4 py-3">${validate_component(AssetStatusBadge, "AssetStatusBadge").$$render($$result, { status: asset.status, size: "sm" }, {}, {})}</td> <td class="px-4 py-3 hidden md:table-cell"><div class="text-sm text-spore-steel" title="${"Location: " + escape(asset.Unit?.Site?.name || "Unknown", true) + " - Unit " + escape(asset.Unit?.roomNumber || "N/A", true)}"><span class="font-medium">${escape(asset.Unit?.Site?.name || "Unknown")}</span> <br> <span class="text-xs">Unit ${escape(asset.Unit?.roomNumber || "N/A")} ${escape(asset.Unit?.name ? ` - ${asset.Unit.name}` : "")} ${escape(asset.Unit?.Building ? ` • Bldg ${asset.Unit.Building.name}` : "")} ${escape(asset.Unit?.floor ? ` • Floor ${asset.Unit.floor}` : "")}</span> </div></td> <td class="px-4 py-3 text-center">${asset._count?.WorkOrder > 0 ? `<span class="px-2 py-1 text-xs font-bold rounded-full bg-spore-orange/10 text-spore-orange" title="${escape(asset._count.WorkOrder, true) + " work order" + escape(asset._count.WorkOrder > 1 ? "s" : "", true) + " associated"}">${escape(asset._count.WorkOrder)} </span>` : `<span class="text-xs text-spore-steel/50" title="No work orders" data-svelte-h="svelte-taiusr">0</span>`}</td> <td class="px-4 py-3 text-sm text-spore-steel hidden lg:table-cell"><span title="${"Created on " + escape(new Date(asset.createdAt).toLocaleDateString(), true)}">${escape(new Date(asset.createdAt).toLocaleDateString())}</span></td> <td class="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2"><a href="${"/assets/" + escape(asset.id, true)}" class="text-spore-forest hover:text-spore-forest/70 transition-colors" title="View full details">View</a> <button class="text-spore-orange hover:text-spore-orange/70 transition-colors" title="Edit this asset" data-svelte-h="svelte-1utif9h">Edit</button> <form method="POST" action="?/delete" class="inline"><input type="hidden" name="assetId"${add_attribute("value", asset.id, 0)}> <button type="submit" class="text-red-500 hover:text-red-400 transition-colors" title="Delete this asset" data-svelte-h="svelte-70kg7d">Delete</button> </form></td> </tr>`}`;
    })}</tbody></table></div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1mat6ie">⚙️</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-vaoz6w">No assets found</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-ba34d9">Try adjusting your filters or create your first asset to start tracking equipment</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" title="Create your first asset" data-svelte-h="svelte-muj3ii">+ CREATE ASSET</button></div>`}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
