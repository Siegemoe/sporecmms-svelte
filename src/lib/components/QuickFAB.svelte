<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';

	export let assets: Array<{ id: string; name: string; room?: { site?: { name?: string } } }> = [];
	// export let userRole: string | null = null; // Available for future role-based features

	let showCreateForm = false;
	let isSubmitting = false;
	let newWO = { title: '', description: '', assetId: '', failureMode: 'General' };

	const dispatch = createEventDispatcher();

	const failureModes = ['General', 'Electrical', 'Plumbing', 'HVAC', 'Structural', 'Safety', 'Cosmetic', 'Other'];

	function closeForm() {
		showCreateForm = false;
		newWO = { title: '', description: '', assetId: '', failureMode: 'General' };
		dispatch('close');
	}

	function handleFormSubmit() {
		isSubmitting = true;
	}
</script>

<!-- Floating Action Button -->
{#if !showCreateForm}
	<button
		type="button"
		on:click={() => showCreateForm = true}
		class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 lg:hidden"
		title="Create Work Order"
		aria-label="Create Work Order"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</button>

	<!-- Desktop FAB -->
	<button
		type="button"
		on:click={() => showCreateForm = true}
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

		<!-- Mobile: Bottom Sheet -->
		<div class="relative bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto lg:hidden">
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
				<form
					method="POST"
					action="/work-orders?/create"
					use:enhance={() => {
						handleFormSubmit();
						return async ({ update }) => {
							await update();
							closeForm();
							isSubmitting = false;
						};
					}}
					class="space-y-4"
				>
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
							disabled={isSubmitting || !newWO.title.trim() || !newWO.assetId}
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
				</form>
			</div>
		</div>

		<!-- Desktop: Modal -->
		<div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 hidden lg:block">
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

			<!-- Form -->
			<div class="p-6 space-y-4">
				<form
					method="POST"
					action="/work-orders?/create"
					use:enhance={() => {
						handleFormSubmit();
						return async ({ update }) => {
							await update();
							closeForm();
							isSubmitting = false;
						};
					}}
					class="space-y-4"
				>
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
							disabled={isSubmitting || !newWO.title.trim() || !newWO.assetId}
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
				</form>
			</div>
		</div>
	</div>
{/if}