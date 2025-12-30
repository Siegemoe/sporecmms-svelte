<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { ASSET_TYPES, formatAssetStatus, type AssetType, type AssetStatus } from '$lib/constants';
	import AssetStatusBadge from '$lib/components/AssetStatusBadge.svelte';
	import AssetForm from '$lib/components/AssetForm.svelte';

	export let data: PageData;

	let showCreateForm = false;
	let isSubmitting = false;
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

	$: assets = data.assets || [];
	$: units = data.units || [];
	$: unitFilter = data.unitFilter;

	function clearFilter() {
		goto('/assets');
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
				{#if unitFilter}
					Showing assets for selected unit
					<button on:click={clearFilter} class="ml-2 text-spore-orange hover:underline">Clear filter</button>
				{:else}
					{assets.length} total asset{assets.length !== 1 ? 's' : ''}
				{/if}
			</p>
		</div>
		<button
			on:click={() => showCreateForm = !showCreateForm}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide"
		>
			{showCreateForm ? 'CANCEL' : '+ NEW ASSET'}
		</button>
	</div>

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
										<a href="/assets/{asset.id}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors block">
											{asset.name}
											{#if asset.description}
												<span class="text-xs text-spore-steel/70 font-normal block">{asset.description.slice(0, 50)}{asset.description.length > 50 ? '...' : ''}</span>
											{/if}
										</a>
									</td>
									<td class="px-4 py-3">
										<span class="px-2 py-1 text-xs font-semibold rounded-full bg-spore-cream/20 text-spore-steel">
											{formatAssetStatus(asset.type || 'OTHER')}
										</span>
									</td>
									<td class="px-4 py-3">
										<AssetStatusBadge status={asset.status} size="sm" />
									</td>
									<td class="px-4 py-3 hidden md:table-cell">
										<div class="text-sm text-spore-steel">
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
											<span class="px-2 py-1 text-xs font-bold rounded-full bg-spore-orange/10 text-spore-orange">
												{asset._count.WorkOrder}
											</span>
										{:else}
											<span class="text-xs text-spore-steel/50">0</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm text-spore-steel hidden lg:table-cell">
										{new Date(asset.createdAt).toLocaleDateString()}
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2">
										<a
											href="/assets/{asset.id}"
											class="text-spore-forest hover:text-spore-forest/70 transition-colors"
										>
											View
										</a>
										<button
											on:click={() => startEdit(asset)}
											class="text-spore-orange hover:text-spore-orange/70 transition-colors"
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
			<h3 class="text-xl font-bold text-spore-dark mb-2">No assets yet</h3>
			<p class="text-spore-steel mb-6">
				{#if unitFilter}
					No assets in this unit
				{:else}
					Create your first asset to start tracking equipment
				{/if}
			</p>
			<button
				on:click={() => showCreateForm = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold"
			>
				+ CREATE ASSET
			</button>
		</div>
	{/if}
</div>
