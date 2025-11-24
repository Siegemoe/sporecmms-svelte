<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let showCreateForm = false;
	let isSubmitting = false;
	let newAsset = { name: '', roomId: '' };
	let editingAssetId: string | null = null;
	let editingAsset = { name: '', roomId: '' };

	$: assets = data.assets || [];
	$: rooms = data.rooms || [];
	$: roomFilter = data.roomFilter;

	function clearFilter() {
		goto('/assets');
	}

	function startEdit(asset: any) {
		editingAssetId = asset.id;
		editingAsset = { name: asset.name, roomId: asset.roomId };
	}

	function cancelEdit() {
		editingAssetId = null;
		editingAsset = { name: '', roomId: '' };
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
				{#if roomFilter}
					Showing assets for selected room
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
						newAsset = { name: '', roomId: '' };
					};
				}}
				class="grid grid-cols-1 sm:grid-cols-3 gap-4"
			>
				<input
					type="text"
					name="name"
					bind:value={newAsset.name}
					placeholder="Asset name (e.g., HVAC Unit #1)"
					class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					required
				/>
				<select
					name="roomId"
					bind:value={newAsset.roomId}
					class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					required
				>
					<option value="">Select a room...</option>
					{#each rooms as room}
						<option value={room.id}>
							{room.site?.name} - Room {room.name}
							{room.building ? ` (Bldg ${room.building})` : ''}
						</option>
					{/each}
				</select>
				<button
					type="submit"
					disabled={isSubmitting || !newAsset.name.trim() || !newAsset.roomId}
					class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'CREATING...' : 'CREATE ASSET'}
				</button>
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
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Asset</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Location</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Work Orders</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Created</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each assets as asset (asset.id)}
							{#if editingAssetId === asset.id}
								<!-- Edit Row -->
								<tr class="bg-spore-orange/10">
									<td class="px-6 py-4" colspan="5">
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
											class="flex flex-wrap items-center gap-4"
										>
											<input type="hidden" name="assetId" value={asset.id} />
											<input
												type="text"
												name="name"
												bind:value={editingAsset.name}
												class="flex-1 min-w-[200px] px-3 py-2 rounded border border-spore-orange bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"
												required
											/>
											<select
												name="roomId"
												bind:value={editingAsset.roomId}
												class="px-3 py-2 rounded border border-spore-orange bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"
												required
											>
												{#each rooms as room}
													<option value={room.id}>
														{room.site?.name} - Room {room.name}
													</option>
												{/each}
											</select>
											<button
												type="submit"
												disabled={isSubmitting || !editingAsset.name.trim()}
												class="bg-spore-forest text-white px-4 py-2 rounded font-bold text-xs hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
											>
												{isSubmitting ? 'SAVING...' : 'SAVE'}
											</button>
											<button
												type="button"
												on:click={cancelEdit}
												class="px-4 py-2 rounded font-bold text-xs text-spore-steel hover:bg-spore-cream transition-colors"
											>
												CANCEL
											</button>
										</form>
									</td>
								</tr>
							{:else}
								<!-- View Row -->
								<tr class="hover:bg-spore-cream/20 transition-colors group">
									<td class="px-6 py-4 whitespace-nowrap">
										<a href="/assets/{asset.id}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors">
											{asset.name}
										</a>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm text-spore-steel">
											<span class="font-medium">{asset.room?.site?.name || 'Unknown'}</span>
											<br/>
											<span class="text-xs">
												Room {asset.room?.name || 'N/A'}
												{asset.room?.building ? ` • Bldg ${asset.room.building}` : ''}
												{asset.room?.floor ? ` • Floor ${asset.room.floor}` : ''}
											</span>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if asset._count?.workOrders > 0}
											<span class="px-3 py-1 text-xs font-bold rounded-full bg-spore-orange/10 text-spore-orange">
												{asset._count.workOrders} WO{asset._count.workOrders !== 1 ? 's' : ''}
											</span>
										{:else}
											<span class="text-sm text-spore-steel/50">None</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">
										{new Date(asset.createdAt).toLocaleDateString()}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-3">
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
				{#if roomFilter}
					No assets in this room
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
