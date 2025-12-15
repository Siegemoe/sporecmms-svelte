<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';

	export let assets: Array<{ id: string; name: string; room?: { id: string; name: string; building?: { id: string; name: string }; site?: { name?: string } } }> = [];
	export let buildings: Array<{ id: string; name: string; site?: { name?: string } }> = [];
	export let rooms: Array<{ id: string; name: string; building?: { id: string; name: string }; site?: { name?: string } }> = [];

	let showCreateForm = false;
	let isSubmitting = false;
	let selectionMode = 'asset'; // 'asset' | 'room' | 'building'
	let newWO = { title: '', description: '', assetId: '', failureMode: 'General', roomId: '', buildingId: '' };

	const dispatch = createEventDispatcher();

	const failureModes = ['General', 'Electrical', 'Plumbing', 'HVAC', 'Structural', 'Safety', 'Cosmetic', 'Other'];

	function closeForm() {
		showCreateForm = false;
		newWO = { title: '', description: '', assetId: '', failureMode: 'General', roomId: '', buildingId: '' };
		selectionMode = 'asset';
		dispatch('close');
	}

	function handleFormSubmit() {
		isSubmitting = true;
		console.log('QuickFAB: Form submitted with data:', {
			title: newWO.title,
			assetId: newWO.assetId,
			roomId: newWO.roomId,
			buildingId: newWO.buildingId,
			description: newWO.description,
			failureMode: newWO.failureMode,
			selectionMode
		});
	}
</script>


<!-- Floating Action Button -->
{#if !showCreateForm}
	<!-- Mobile FAB - hidden on desktop -->
	<button
		type="button"
		on:click={() => {
			console.log('QuickFAB: FAB clicked, showing form');
			showCreateForm = true;
		}}
		class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 lg:hidden"
		title="Create Work Order"
		aria-label="Create Work Order"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</button>

	<!-- Desktop FAB - hidden on mobile -->
	<button
		type="button"
		on:click={() => {
			console.log('QuickFAB: FAB clicked, showing form');
			showCreateForm = true;
		}}
		class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 hidden lg:flex"
		title="Create Work Order"
		aria-label="Create Work Order"
	>
		<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</button>
{/if}

<!-- Quick Create Modal/Sheet -->
{#if showCreateForm}
	<div class="fixed inset-0 z-50 flex items-end justify-center">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			on:click={closeForm}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === 'Enter' && closeForm()}
			aria-label="Close form"
		></div>

		<!-- Single Form Element -->
		<form
			method="POST"
			action="/work-orders?/create"
			use:enhance={() => {
				handleFormSubmit();
				return async ({ update }) => {
					const result = await update();
					if (result.type === 'success') {
						closeForm();
						isSubmitting = false;
					} else {
						isSubmitting = false;
					}
				};
			}}
		>
			<!-- Mobile: Bottom Sheet -->
			<div class="lg:hidden relative bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
				<!-- Handle -->
				<div class="flex justify-center py-3">
					<div class="w-12 h-1 bg-gray-300 rounded-full"></div>
				</div>

				<!-- Header -->
				<div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-bold text-gray-900">Quick Work Order</h2>
						<button
							type="button"
							on:click={closeForm}
							class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							aria-label="Close"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Form -->
				<div class="p-4 space-y-4">
					<!-- Selection Mode Toggle -->
					<div class="flex gap-2 flex-wrap">
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'asset' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'asset'; newWO.assetId = ''; }}
						>
							Asset
						</button>
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'room' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'room'; newWO.roomId = ''; }}
						>
							Room
						</button>
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'building' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'building'; newWO.buildingId = ''; }}
						>
							Building
						</button>
					</div>

					<!-- Hidden field for selection mode -->
					<input type="hidden" name="selectionMode" value={selectionMode} />

					<div>
						<label for="fab-wo-title" class="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
						<input
							type="text"
							id="fab-wo-title"
							name="title"
							bind:value={newWO.title}
							placeholder="Brief description of the issue"
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900 placeholder-gray-500"
							required
							aria-required="true"
						/>
					</div>

					<!-- Asset Selection -->
					{#if selectionMode === 'asset'}
						<div>
							<label for="fab-wo-asset" class="block text-sm font-semibold text-gray-900 mb-2">Asset *</label>
							<select
								id="fab-wo-asset"
								name="assetId"
								bind:value={newWO.assetId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select an asset...</option>
								{#each assets as asset}
									<option value={asset.id}>
										{asset.name} {asset.room?.site?.name ? `- ${asset.room.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>

					<!-- Room Selection -->
					{:else if selectionMode === 'room'}
						<div>
							<label for="fab-wo-room" class="block text-sm font-semibold text-gray-900 mb-2">Room *</label>
							<select
								id="fab-wo-room"
								name="roomId"
								bind:value={newWO.roomId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select a room...</option>
								{#each rooms as room}
									<option value={room.id}>
										{room.name} {room.building ? `- ${room.building.name}` : ''} {room.site?.name ? `- ${room.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>

					<!-- Building Selection -->
					{:else if selectionMode === 'building'}
						<div>
							<label for="fab-wo-building" class="block text-sm font-semibold text-gray-900 mb-2">Building *</label>
							<select
								id="fab-wo-building"
								name="buildingId"
								bind:value={newWO.buildingId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select a building...</option>
								{#each buildings as building}
									<option value={building.id}>
										{building.name} {building.site?.name ? `- ${building.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>
					{/if}

					<div>
						<label for="fab-wo-failure" class="block text-sm font-semibold text-gray-900 mb-2">Failure Mode</label>
						<select
							id="fab-wo-failure"
							name="failureMode"
							bind:value={newWO.failureMode}
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
						>
							{#each failureModes as mode}
								<option value={mode}>{mode}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="fab-wo-description" class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
						<textarea
							id="fab-wo-description"
							name="description"
							bind:value={newWO.description}
							placeholder="Additional details (optional)"
							rows="3"
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900 placeholder-gray-500 resize-none"
						></textarea>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							on:click={closeForm}
							class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !newWO.title.trim() || (selectionMode === 'asset' && !newWO.assetId) || (selectionMode === 'room' && !newWO.roomId) || (selectionMode === 'building' && !newWO.buildingId)}
							class="flex-1 bg-spore-orange text-white px-4 py-3 rounded-lg font-semibold hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							aria-busy={isSubmitting}
						>
							{#if isSubmitting}
								<span class="flex items-center justify-center gap-2">
									<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Creating...
								</span>
							{:else}
								Create Work Order
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Desktop: Modal -->
			<div class="hidden lg:block relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
				<!-- Header -->
				<div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-bold text-gray-900">Quick Work Order</h2>
						<button
							type="button"
							on:click={closeForm}
							class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							aria-label="Close"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Form Content -->
				<div class="p-6 space-y-4">
					<!-- Selection Mode Toggle -->
					<div class="flex gap-2 flex-wrap">
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'asset' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'asset'; newWO.assetId = ''; }}
						>
							Asset
						</button>
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'room' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'room'; newWO.roomId = ''; }}
						>
							Room
						</button>
						<button
							type="button"
							class="px-3 py-1 text-xs rounded-full {selectionMode === 'building' ? 'bg-spore-orange text-white' : 'bg-gray-200 text-gray-700'}"
							on:click={() => { selectionMode = 'building'; newWO.buildingId = ''; }}
						>
							Building
						</button>
					</div>

					<!-- Hidden field for selection mode -->
					<input type="hidden" name="selectionMode" value={selectionMode} />

					<div>
						<label for="fab-wo-title-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
						<input
							type="text"
							id="fab-wo-title-desktop"
							name="title"
							bind:value={newWO.title}
							placeholder="Brief description of the issue"
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900 placeholder-gray-500"
							required
							aria-required="true"
						/>
					</div>

					<!-- Asset Selection -->
					{#if selectionMode === 'asset'}
						<div>
							<label for="fab-wo-asset-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Asset *</label>
							<select
								id="fab-wo-asset-desktop"
								name="assetId"
								bind:value={newWO.assetId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select an asset...</option>
								{#each assets as asset}
									<option value={asset.id}>
										{asset.name} {asset.room?.site?.name ? `- ${asset.room.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>

					<!-- Room Selection -->
					{:else if selectionMode === 'room'}
						<div>
							<label for="fab-wo-room-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Room *</label>
							<select
								id="fab-wo-room-desktop"
								name="roomId"
								bind:value={newWO.roomId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select a room...</option>
								{#each rooms as room}
									<option value={room.id}>
										{room.name} {room.building ? `- ${room.building.name}` : ''} {room.site?.name ? `- ${room.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>

					<!-- Building Selection -->
					{:else if selectionMode === 'building'}
						<div>
							<label for="fab-wo-building-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Building *</label>
							<select
								id="fab-wo-building-desktop"
								name="buildingId"
								bind:value={newWO.buildingId}
								class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
								required
								aria-required="true"
							>
								<option value="">Select a building...</option>
								{#each buildings as building}
									<option value={building.id}>
										{building.name} {building.site?.name ? `- ${building.site.name}` : ''}
									</option>
								{/each}
							</select>
						</div>
					{/if}

					<div>
						<label for="fab-wo-failure-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Failure Mode</label>
						<select
							id="fab-wo-failure-desktop"
							name="failureMode"
							bind:value={newWO.failureMode}
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900"
						>
							{#each failureModes as mode}
								<option value={mode}>{mode}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="fab-wo-description-desktop" class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
						<textarea
							id="fab-wo-description-desktop"
							name="description"
							bind:value={newWO.description}
							placeholder="Additional details (optional)"
							rows="3"
							class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spore-orange focus:border-spore-orange text-gray-900 placeholder-gray-500 resize-none"
						></textarea>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							on:click={closeForm}
							class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !newWO.title.trim() || (selectionMode === 'asset' && !newWO.assetId) || (selectionMode === 'room' && !newWO.roomId) || (selectionMode === 'building' && !newWO.buildingId)}
							class="flex-1 bg-spore-orange text-white px-4 py-3 rounded-lg font-semibold hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							aria-busy={isSubmitting}
						>
							{#if isSubmitting}
								<span class="flex items-center justify-center gap-2">
									<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Creating...
								</span>
							{:else}
								Create Work Order
							{/if}
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
{/if}