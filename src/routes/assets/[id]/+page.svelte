<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let isEditing = false;
	let isSubmitting = false;
	let editData = { name: '', roomId: '' };

	$: asset = data.asset;
	$: rooms = data.rooms || [];
	$: woStats = data.woStats;

	function startEdit() {
		editData = {
			name: asset.name,
			roomId: asset.roomId
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
	<!-- Breadcrumb -->
	<div class="mb-6">
		<a href="/assets" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">
			← Back to Assets
		</a>
	</div>

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
				class="space-y-6"
			>
				<div>
					<label class="block text-sm font-bold text-spore-steel mb-2">Asset Name</label>
					<input
						type="text"
						name="name"
						bind:value={editData.name}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-bold text-spore-steel mb-2">Location</label>
					<select
						name="roomId"
						bind:value={editData.roomId}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
					>
						{#each rooms as room}
							<option value={room.id}>
								{room.site?.name} - Room {room.name}
								{room.building ? ` (Bldg ${room.building})` : ''}
							</option>
						{/each}
					</select>
				</div>

				<div class="flex gap-4 pt-4">
					<button
						type="submit"
						disabled={isSubmitting || !editData.name.trim()}
						class="bg-spore-forest text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
					>
						{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
					</button>
					<button
						type="button"
						on:click={cancelEdit}
						class="px-8 py-3 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
					>
						CANCEL
					</button>
				</div>
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
							{asset.room?.site?.name} • Room {asset.room?.name}
							{#if asset.room?.building} • Bldg {asset.room.building}{/if}
							{#if asset.room?.floor} • Floor {asset.room.floor}{/if}
						</p>
					</div>
					<div class="flex gap-2">
						<button
							on:click={startEdit}
							class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors"
						>
							EDIT
						</button>
						<form method="POST" action="?/delete" use:enhance>
							<button
								type="submit"
								class="px-4 py-2 rounded-lg font-bold text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
								on:click={(e) => !confirm('Delete this asset? All associated work orders will also be deleted.') && e.preventDefault()}
							>
								DELETE
							</button>
						</form>
					</div>
				</div>
			</div>

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
					>
						View All →
					</a>
				</div>

				{#if asset.workOrders && asset.workOrders.length > 0}
					<div class="space-y-3">
						{#each asset.workOrders as wo}
							<a 
								href="/work-orders/{wo.id}"
								class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"
							>
								<div class="flex-1 min-w-0">
									<p class="font-bold text-spore-dark truncate">{wo.title}</p>
									<p class="text-xs text-spore-steel mt-1">
										{wo.failureMode || 'General'} • {new Date(wo.createdAt).toLocaleDateString()}
									</p>
								</div>
								<span class="ml-4 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full {getStatusColor(wo.status)}">
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
						>
							Create Work Order
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
