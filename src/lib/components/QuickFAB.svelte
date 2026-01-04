<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';
	import { FAILURE_MODES } from '$lib/constants';
	import WorkOrderForm from '$lib/components/work-orders/WorkOrderForm.svelte';

	export let assets: Array<{ id: string; name: string; room?: { id: string; name: string; building?: { id: string; name: string }; site?: { name?: string } } }> = [];
	export let buildings: Array<{ id: string; name: string; site?: { name?: string } }> = [];
	export let rooms: Array<{ id: string; name: string; building?: { id: string; name: string }; site?: { name?: string } }> = [];
	export let templates: Array<{
		id: string;
		name: string;
		_itemCount?: number;
		title?: string | null;
		workDescription?: string | null;
		priority?: string;
	}> = [];

	let showCreateForm = false;
	let isSubmitting = false;

	const dispatch = createEventDispatcher();

	function closeForm() {
		showCreateForm = false;
		dispatch('close');
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
	<div class="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			on:click={closeForm}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === 'Enter' && closeForm()}
			aria-label="Close form"
		></div>

		<!-- Modal Container -->
		<div class="relative w-full lg:max-w-2xl lg:mx-4 max-h-[90vh] flex flex-col bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl overflow-hidden z-50">
			<!-- Header -->
			<div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
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

			<!-- Form Content -->
			<div class="p-6 overflow-y-auto">
				<WorkOrderForm
					assets={assets}
					units={rooms}
					buildings={buildings}
					sites={[]} 
					users={[]} 
					templates={templates}
					bind:isSubmitting
					on:success={() => {
						closeForm();
						// Optional: trigger toast or refresh
					}}
					on:cancel={closeForm}
				/>
			</div>
		</div>
	</div>
{/if}