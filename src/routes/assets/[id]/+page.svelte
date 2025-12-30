<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { ASSET_TYPES, formatAssetStatus, type AssetType, type AssetStatus } from '$lib/constants';
	import AssetStatusBadge from '$lib/components/AssetStatusBadge.svelte';
	import AssetForm from '$lib/components/AssetForm.svelte';

	export let data: PageData;

	let isEditing = false;
	let isSubmitting = false;
	let editData = {
		name: '',
		unitId: '',
		type: 'OTHER' as AssetType,
		status: 'OPERATIONAL' as AssetStatus,
		description: '',
		purchaseDate: '',
		warrantyExpiry: ''
	};

	$: asset = data.asset;
	$: units = data.units || [];
	$: woStats = data.woStats;

	function startEdit() {
		editData = {
			name: asset.name,
			unitId: asset.unitId || asset.Unit?.id || '',
			type: (asset.type || 'OTHER') as AssetType,
			status: (asset.status || 'OPERATIONAL') as AssetStatus,
			description: asset.description || '',
			purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
			warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : ''
		};
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'COMPLETED': return 'bg-spore-forest text-white';
			case 'IN_PROGRESS': return 'bg-spore-orange text-white';
			case 'PENDING': return 'bg-spore-steel text-white';
			case 'ON_HOLD': return 'bg-spore-cream text-spore-steel';
			case 'CANCELLED': return 'bg-red-600 text-white';
			default: return 'bg-spore-steel text-white';
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-10">
	{#if isEditing}
		<!-- Edit Mode -->
		<div class="bg-spore-white rounded-xl p-8">
			<h1 class="text-2xl font-extrabold text-spore-dark mb-6">Edit Asset</h1>
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						isEditing = false;
					};
				}}
			>
				<AssetForm
					bind:name={editData.name}
					bind:unitId={editData.unitId}
					bind:type={editData.type}
					bind:status={editData.status}
					bind:description={editData.description}
					bind:purchaseDate={editData.purchaseDate}
					bind:warrantyExpiry={editData.warrantyExpiry}
					{units}
					submitLabel="SAVE CHANGES"
					{isSubmitting}
					showCancel={true}
					onCancel={cancelEdit}
				/>
			</form>
		</div>

	{:else}
		<!-- View Mode -->
		<div class="bg-spore-white rounded-xl overflow-hidden">
			<!-- Header -->
			<div class="bg-spore-dark p-6">
				<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
					<div>
						<h1 class="text-2xl font-extrabold text-spore-cream">{asset.name}</h1>
						<p class="text-spore-cream/60 mt-1 text-sm">
							{asset.Unit?.Site?.name} • Unit {asset.Unit?.roomNumber || asset.Unit?.name || 'N/A'}
							{#if asset.Unit?.Building} • Bldg {asset.Unit.Building.name}{/if}
							{#if asset.Unit?.floor} • Floor {asset.Unit.floor}{/if}
						</p>
					</div>
					<div class="flex gap-2">
						<button
							on:click={startEdit}
							class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors"
							title="Edit asset details"
						>
							EDIT
						</button>
						<form method="POST" action="?/delete" use:enhance>
							<button
								type="submit"
								class="px-4 py-2 rounded-lg font-bold text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
								title="Delete this asset"
								on:click={(e) => !confirm('Delete this asset? All associated work orders will also be deleted.') && e.preventDefault()}
							>
								DELETE
							</button>
						</form>
					</div>
				</div>
			</div>

			<!-- Asset Details -->
			<div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream">
				<div class="p-4 border-r border-spore-cream">
					<p class="text-xs font-bold text-spore-steel uppercase mb-1">Type</p>
					<p class="text-sm font-medium text-spore-dark">{formatAssetStatus(asset.type || 'OTHER')}</p>
				</div>
				<div class="p-4 border-r border-spore-cream">
					<p class="text-xs font-bold text-spore-steel uppercase mb-1">Status</p>
					<AssetStatusBadge status={asset.status} size="sm" />
				</div>
				<div class="p-4 border-r border-spore-cream">
					<p class="text-xs font-bold text-spore-steel uppercase mb-1">Purchase Date</p>
					<p class="text-sm font-medium text-spore-dark">
						{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
					</p>
				</div>
				<div class="p-4">
					<p class="text-xs font-bold text-spore-steel uppercase mb-1">Warranty</p>
					<p class="text-sm font-medium text-spore-dark">
						{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}
					</p>
				</div>
			</div>

			{#if asset.description}
				<div class="p-4 border-b border-spore-cream bg-spore-cream/10">
					<p class="text-xs font-bold text-spore-steel uppercase mb-1">Description</p>
					<p class="text-sm text-spore-dark">{asset.description}</p>
				</div>
			{/if}

			<!-- Stats Row -->
			<div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream">
				<div class="p-4 text-center border-r border-spore-cream">
					<p class="text-2xl font-extrabold text-spore-dark">{woStats.total}</p>
					<p class="text-xs font-bold text-spore-steel uppercase">Total WOs</p>
				</div>
				<div class="p-4 text-center border-r border-spore-cream">
					<p class="text-2xl font-extrabold text-spore-steel">{woStats.pending}</p>
					<p class="text-xs font-bold text-spore-steel uppercase">Pending</p>
				</div>
				<div class="p-4 text-center border-r border-spore-cream">
					<p class="text-2xl font-extrabold text-spore-orange">{woStats.inProgress}</p>
					<p class="text-xs font-bold text-spore-steel uppercase">In Progress</p>
				</div>
				<div class="p-4 text-center">
					<p class="text-2xl font-extrabold text-spore-forest">{woStats.completed}</p>
					<p class="text-xs font-bold text-spore-steel uppercase">Completed</p>
				</div>
			</div>

			<!-- Work Order History -->
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-lg font-bold text-spore-dark">Work Order History</h2>
					<a
						href="/work-orders?asset={asset.id}"
						class="text-sm font-bold text-spore-orange hover:text-spore-orange/80"
						title="View all work orders for this asset"
					>
						View All →
					</a>
				</div>

				{#if asset.WorkOrder && asset.WorkOrder.length > 0}
					<div class="space-y-3">
						{#each asset.WorkOrder as wo}
							<a
								href="/work-orders/{wo.id}"
								class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"
								title="View work order: {wo.title}"
							>
								<div class="flex-1 min-w-0">
									<p class="font-bold text-spore-dark truncate">{wo.title}</p>
									<p class="text-xs text-spore-steel mt-1">
										Created {new Date(wo.createdAt).toLocaleDateString()}
									</p>
								</div>
								<span class="ml-4 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full {getStatusColor(wo.status)}" title="Status: {wo.status.replace('_', ' ')}">
									{wo.status.replace('_', ' ')}
								</span>
							</a>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 bg-spore-cream/20 rounded-lg">
						<p class="text-spore-steel">No work orders for this asset</p>
						<a
							href="/work-orders"
							class="inline-block mt-4 bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 transition-colors"
							title="Create a new work order"
						>
							Create Work Order
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
