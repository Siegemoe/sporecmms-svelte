<script lang="ts">
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let showFilters = false;
	export let onClear: (() => void) | undefined = undefined;
	export let clearLabel = 'Reset';
	export let mobileTitle = 'Filters & Sort';

	// Optional toggle buttons (e.g., "My Work Orders")
	export let toggleButtons: Array<{
		label: string;
		active: boolean;
		onToggle: () => void;
		title?: string;
	}> = [];

	// Filter dropdowns
	export let filters: Array<{
		value: string | boolean;
		options: Array<{ value: string; label: string }>;
		placeholder: string;
		onChange: (value: string) => void;
		title?: string;
		show?: boolean; // conditional display
	}> = [];

	// Sort dropdown
	export let sortOptions: Array<{ value: string; label: string }>;
	export let sortValue: string;
	export let onSortChange: (value: string) => void;
	export let sortPlaceholder = 'Sort...';

	const dispatch = createEventDispatcher();

	function hasActiveFilters() {
		return toggleButtons.some((b) => b.active) ||
			filters.some((f) => f.value && f.value !== '' && f.value !== false);
	}

	function handleClear() {
		if (onClear) {
			onClear();
		}
		dispatch('clear');
	}
</script>

<div class="bg-spore-white rounded-xl mb-6 shadow-sm border border-spore-cream/50">
	<!-- Mobile Filter Toggle -->
	<div class="md:hidden p-4 border-b border-spore-cream/30 flex justify-between items-center bg-spore-cream/10">
		<span class="text-sm font-bold text-spore-dark uppercase tracking-wide">{mobileTitle}</span>
		<button
			on:click={() => showFilters = !showFilters}
			class="text-spore-orange font-bold text-sm"
			type="button"
			title="Toggle filters"
		>
			{showFilters ? 'Hide' : 'Show'}
		</button>
	</div>

	<!-- Filter Controls -->
	<div class="{showFilters ? 'block' : 'hidden'} md:block p-4 space-y-4 md:space-y-0">
		<div class="flex flex-col md:flex-row md:items-center gap-4">
			<!-- Optional Toggle Buttons -->
			{#each toggleButtons as btn}
				<button
					on:click={btn.onToggle}
					type="button"
					class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors {btn.active ? 'bg-spore-orange/10 text-spore-orange ring-1 ring-spore-orange' : 'bg-spore-cream/20 text-spore-steel hover:bg-spore-cream/30'}"
					title={btn.title}
				>
					<span class="w-4 h-4 rounded-full border border-current flex items-center justify-center">
						{#if btn.active}<span class="w-2 h-2 rounded-full bg-current"></span>{/if}
					</span>
					<span class="text-sm font-bold">{btn.label}</span>
				</button>
			{/each}

			{#if toggleButtons.length > 0}
				<div class="h-6 w-px bg-spore-cream/50 hidden md:block"></div>
			{/if}

			<!-- Clear Button -->
			{#if hasActiveFilters()}
				<button
					on:click={handleClear}
					type="button"
					class="text-xs font-bold text-red-500 hover:text-red-600 px-2"
					title="Clear all filters"
				>
					{clearLabel}
				</button>
				<div class="h-6 w-px bg-spore-cream/50 hidden md:block"></div>
			{/if}

			<!-- Filter Dropdowns -->
			<div class="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 flex-1">
				{#each filters as filter}
					{#if filter.show !== false}
						<select
							bind:value={filter.value}
							on:change={() => filter.onChange(String(filter.value))}
							class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							title={filter.title}
						>
							<option value="">{filter.placeholder}</option>
							{#each filter.options as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					{/if}
				{/each}

				<!-- Sort Dropdown -->
				<select
					bind:value={sortValue}
					on:change={() => onSortChange(sortValue)}
					class="w-full md:w-auto bg-spore-cream/10 border border-spore-cream/30 rounded-lg px-3 py-2 text-sm text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					title="Sort results"
				>
					{#each sortOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>
