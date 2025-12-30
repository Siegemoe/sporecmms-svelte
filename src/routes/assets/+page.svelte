<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { ASSET_TYPES, ASSET_STATUSES, formatAssetStatus, type AssetType, type AssetStatus } from '$lib/constants';
	import AssetStatusBadge from '$lib/components/AssetStatusBadge.svelte';
	import AssetForm from '$lib/components/AssetForm.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';

	export let data: PageData;

	let showCreateForm = false;
	let isSubmitting = false;
	let showFilters = false;
	let newAsset = {
		name: '',
		unitId: '',
		type: 'OTHER' as AssetType,
		status: 'OPERATIONAL' as AssetStatus,
		description: '',
		purchaseDate: '',
		warrantyExpiry: ''
	};
	let editingAssetId: string | null = null;
	let editingAsset = {
		name: '',
		unitId: '',
		type: 'OTHER' as AssetType,
		status: 'OPERATIONAL' as AssetStatus,
		description: '',
		purchaseDate: '',
		warrantyExpiry: ''
	};

	// Filter state - initialize from URL params
	let filterType = data.type || '';
	let filterStatus = data.status || '';
	let filterSite = data.siteId || '';
	let sortOption = data.sort || 'created';
	let searchValue = data.search || '';

	$: assets = data.assets || [];
	$: units = data.units || [];
	$: sites = data.sites || [];

	function applyFilters() {
		const params = new URLSearchParams();
		if (filterType) params.set('type', filterType);
		if (filterStatus) params.set('status', filterStatus);
		if (filterSite) params.set('siteId', filterSite);
		if (sortOption && sortOption !== 'created') params.set('sort', sortOption);
		if (searchValue) params.set('search', searchValue);

		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function clearFilters() {
		filterType = '';
		filterStatus = '';
		filterSite = '';
		sortOption = 'created';
		searchValue = '';
		applyFilters();
	}

	function startEdit(asset: any) {
		editingAssetId = asset.id;
		editingAsset = {
			name: asset.name,
			unitId: asset.Unit?.id || asset.unitId,
			type: (asset.type || 'OTHER') as AssetType,
			status: (asset.status || 'OPERATIONAL') as AssetStatus,
			description: asset.description || '',
			purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
			warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : ''
		};
	}

	function cancelEdit() {
		editingAssetId = null;
		editingAsset = {
			name: '',
			unitId: '',
			type: 'OTHER',
			status: 'OPERATIONAL',
			description: '',
			purchaseDate: '',
			warrantyExpiry: ''
		};
	}
</script>

<svelte:head>
	<title>Assets — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
		<div>
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Assets</h1>
			<p class="text-spore-cream/60 mt-2 text-sm font-medium">
				{assets.length} total asset{assets.length !== 1 ? 's' : ''}
			</p>
		</div>
		<button
			on:click={() => showCreateForm = !showCreateForm}
			title={showCreateForm ? 'Close create form' : 'Create a new asset'}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide"
		>
			{showCreateForm ? 'CANCEL' : '+ NEW ASSET'}
		</button>
	</div>

	<!-- Filter Bar -->
	<FilterBar
		bind:showFilters
		bind:searchValue={searchValue}
		searchPlaceholder="Search assets..."
		searchTitle="Search by name or description"
		onSearch={(v) => { searchValue = v; applyFilters(); }}
		toggleButtons={[]}
		filters={[
			{
				value: filterType,
				placeholder: 'All Types',
				title: 'Filter by asset type',
				onChange: (v) => { filterType = v; applyFilters(); },
				options: ASSET_TYPES.map(t => ({ value: t, label: t.replace('_', ' ') }))
			},
			{
				value: filterStatus,
				placeholder: 'All Statuses',
				title: 'Filter by status',
				onChange: (v) => { filterStatus = v; applyFilters(); },
				options: ASSET_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))
			},
			{
				value: filterSite,
				placeholder: 'All Sites',
				title: 'Filter by site',
				onChange: (v) => { filterSite = v; applyFilters(); },
				show: sites.length > 0,
				options: sites.map(s => ({ value: s.id, label: s.name }))
			}
		]}
		sortOptions={[
			{ value: 'created', label: 'Newest' },
			{ value: 'name', label: 'Name' },
			{ value: 'type', label: 'Type' },
			{ value: 'status', label: 'Status' }
		]}
		bind:sortValue={sortOption}
		onSortChange={(v) => { sortOption = v; applyFilters(); }}
		onClear={clearFilters}
		clearLabel="Reset"
	/>

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="bg-spore-white rounded-xl p-6 mb-8">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Create New Asset</h2>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						showCreateForm = false;
						newAsset = {
							name: '',
							unitId: '',
							type: 'OTHER',
							status: 'OPERATIONAL',
							description: '',
							purchaseDate: '',
							warrantyExpiry: ''
						};
					};
				}}
			>
				<AssetForm
					bind:name={newAsset.name}
					bind:unitId={newAsset.unitId}
					bind:type={newAsset.type}
					bind:status={newAsset.status}
					bind:description={newAsset.description}
					bind:purchaseDate={newAsset.purchaseDate}
					bind:warrantyExpiry={newAsset.warrantyExpiry}
					{units}
					submitLabel="CREATE ASSET"
					{isSubmitting}
					showCancel={true}
					onCancel={() => showCreateForm = false}
				/>
			</form>
		</div>
	{/if}

	<!-- Assets Table -->
	{#if assets.length > 0}
		<div class="bg-spore-white rounded-xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full">
					<thead class="bg-spore-dark">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Asset</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Type</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Status</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden md:table-cell">Location</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider text-center">WO</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell">Created</th>
							<th class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each assets as asset (asset.id)}
							{#if editingAssetId === asset.id}
								<!-- Edit Row -->
								<tr class="bg-spore-orange/10">
									<td class="p-2" colspan="7">
										<form
											method="POST"
											action="?/update"
											use:enhance={() => {
												isSubmitting = true;
												return async ({ update }) => {
													await update();
													isSubmitting = false;
													cancelEdit();
												};
											}}
										>
											<input type="hidden" name="assetId" value={asset.id} />
											<AssetForm
												bind:name={editingAsset.name}
												bind:unitId={editingAsset.unitId}
												bind:type={editingAsset.type}
												bind:status={editingAsset.status}
												bind:description={editingAsset.description}
												bind:purchaseDate={editingAsset.purchaseDate}
												bind:warrantyExpiry={editingAsset.warrantyExpiry}
												{units}
												submitLabel="SAVE"
												{isSubmitting}
												showCancel={true}
												onCancel={cancelEdit}
											/>
										</form>
									</td>
								</tr>
							{:else}
								<!-- View Row -->
								<tr class="hover:bg-spore-cream/20 transition-colors group">
									<td class="px-4 py-3">
										<a href="/assets/{asset.id}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors block" title="View asset details">
											{asset.name}
											{#if asset.description}
												<span class="text-xs text-spore-steel/70 font-normal block">{asset.description.slice(0, 50)}{asset.description.length > 50 ? '...' : ''}</span>
											{/if}
										</a>
									</td>
									<td class="px-4 py-3">
										<span class="px-2 py-1 text-xs font-semibold rounded-full bg-spore-cream/20 text-spore-steel" title="Asset type: {formatAssetStatus(asset.type || 'OTHER')}">
											{formatAssetStatus(asset.type || 'OTHER')}
										</span>
									</td>
									<td class="px-4 py-3">
										<AssetStatusBadge status={asset.status} size="sm" />
									</td>
									<td class="px-4 py-3 hidden md:table-cell">
										<div class="text-sm text-spore-steel" title="Location: {asset.Unit?.Site?.name || 'Unknown'} - Unit {asset.Unit?.roomNumber || 'N/A'}">
											<span class="font-medium">{asset.Unit?.Site?.name || 'Unknown'}</span>
											<br/>
											<span class="text-xs">
												Unit {asset.Unit?.roomNumber || 'N/A'}
												{asset.Unit?.name ? ` - ${asset.Unit.name}` : ''}
												{asset.Unit?.Building ? ` • Bldg ${asset.Unit.Building.name}` : ''}
												{asset.Unit?.floor ? ` • Floor ${asset.Unit.floor}` : ''}
											</span>
										</div>
									</td>
									<td class="px-4 py-3 text-center">
										{#if asset._count?.WorkOrder > 0}
											<span class="px-2 py-1 text-xs font-bold rounded-full bg-spore-orange/10 text-spore-orange" title="{asset._count.WorkOrder} work order{asset._count.WorkOrder > 1 ? 's' : ''} associated">
												{asset._count.WorkOrder}
											</span>
										{:else}
											<span class="text-xs text-spore-steel/50" title="No work orders">0</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm text-spore-steel hidden lg:table-cell">
										<span title="Created on {new Date(asset.createdAt).toLocaleDateString()}">{new Date(asset.createdAt).toLocaleDateString()}</span>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2">
										<a
											href="/assets/{asset.id}"
											class="text-spore-forest hover:text-spore-forest/70 transition-colors"
											title="View full details"
										>
											View
										</a>
										<button
											on:click={() => startEdit(asset)}
											class="text-spore-orange hover:text-spore-orange/70 transition-colors"
											title="Edit this asset"
										>
											Edit
										</button>
										<form
											method="POST"
											action="?/delete"
											use:enhance
											class="inline"
										>
											<input type="hidden" name="assetId" value={asset.id} />
											<button
												type="submit"
												class="text-red-500 hover:text-red-400 transition-colors"
												title="Delete this asset"
												on:click|preventDefault={(e) => {
													if (confirm('Delete this asset? This will also delete all associated work orders.')) {
														e.currentTarget.closest('form')?.requestSubmit();
													}
												}}
											>
												Delete
											</button>
										</form>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl">
			<div class="text-5xl mb-4">⚙️</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No assets found</h3>
			<p class="text-spore-steel mb-6">
				Try adjusting your filters or create your first asset to start tracking equipment
			</p>
			<button
				on:click={() => showCreateForm = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold"
				title="Create your first asset"
			>
				+ CREATE ASSET
			</button>
		</div>
	{/if}
</div>
