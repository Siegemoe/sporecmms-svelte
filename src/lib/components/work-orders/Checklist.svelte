<script lang="ts">
	import { enhance } from '$app/forms';

	export let items: Array<{
		id: string;
		title: string;
		isCompleted: boolean;
		position: number;
	}>;
	export let workOrderId: string;

	let newItemTitle = '';
	let isSubmitting = false;
	let showAddForm = false;

	function startAdd() {
		showAddForm = true;
		newItemTitle = '';
	}

	function cancelAdd() {
		showAddForm = false;
		newItemTitle = '';
	}

	$: incompleteCount = items.filter((i) => !i.isCompleted).length;
	$: completedCount = items.filter((i) => i.isCompleted).length;
	$: allComplete = items.length > 0 && incompleteCount === 0;
</script>

<div class="bg-spore-white rounded-xl p-6">
	<h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span>✓</span>
			<span>Checklist</span>
		</div>
		{#if items.length > 0}
			<span class="text-sm font-normal text-spore-steel">
				{completedCount}/{items.length} done
			</span>
		{/if}
	</h2>

	<!-- Checklist items -->
	{#if items.length === 0}
		<p class="text-spore-steel text-sm italic mb-4">No checklist items yet.</p>
	{:else}
		<div class="space-y-2 mb-4">
			{#each items as item (item.id)}
				<div
					class="group flex items-center gap-3 p-3 rounded-lg border {item.isCompleted
						? 'bg-spore-forest/5 border-spore-forest/20'
						: 'bg-white border-spore-cream hover:border-spore-orange/30'} transition-colors"
				>
					<!-- Checkbox -->
					<form
						method="POST"
						action="?/toggleChecklistItem"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
							};
						}}
						class="flex-shrink-0"
					>
						<input type="hidden" name="itemId" value={item.id} />
						<input
							type="hidden"
							name="isCompleted"
							value={item.isCompleted ? 'false' : 'true'}
						/>
						<button
							type="submit"
							class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors {item.isCompleted
								? 'bg-spore-forest border-spore-forest text-white'
								: 'border-spore-steel hover:border-spore-orange'}"
							aria-label={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
						>
							{#if item.isCompleted}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					</form>

					<!-- Title -->
					<span
						class="flex-1 text-sm {item.isCompleted
							? 'text-spore-steel line-through'
							: 'text-spore-dark'}"
					>
						{item.title}
					</span>

					<!-- Delete button -->
					<form
						method="POST"
						action="?/deleteChecklistItem"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
							};
						}}
						class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<input type="hidden" name="itemId" value={item.id} />
						<button
							type="submit"
							class="text-spore-steel hover:text-red-500 p-1 rounded"
							on:click={(e) => !confirm('Delete this item?') && e.preventDefault()}
							aria-label="Delete item"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Add item form -->
	{#if showAddForm}
		<form
			method="POST"
			action="?/addChecklistItem"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						newItemTitle = '';
						showAddForm = false;
					}
				};
			}}
			class="flex gap-2"
		>
			<input
				type="text"
				name="title"
				bind:value={newItemTitle}
				placeholder="Add an item..."
				class="flex-1 px-3 py-2 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange text-sm"
				autofocus
				on:keydown={(e) => e.key === 'Escape' && cancelAdd()}
			/>
			<button
				type="submit"
				disabled={isSubmitting || !newItemTitle.trim()}
				class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Add
			</button>
			<button
				type="button"
				on:click={cancelAdd}
				class="px-4 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
			>
				Cancel
			</button>
		</form>
	{:else}
		<button
			on:click={startAdd}
			class="w-full px-4 py-2 rounded-lg border border-dashed border-spore-cream text-spore-steel text-sm font-semibold hover:border-spore-orange hover:text-spore-orange transition-colors"
		>
			+ Add item
		</button>
	{/if}
</div>
