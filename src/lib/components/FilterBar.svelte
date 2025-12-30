<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';

	export let showFilters = false;
	export let onClear: (() => void) | undefined = undefined;
	export let clearLabel = 'Reset';
	export let mobileTitle = 'Filters & Sort';

	// Search
	export let searchValue = '';
	export let searchPlaceholder = 'Search...';
	export let onSearch: ((value: string) => void) | undefined = undefined;
	export let searchTitle = 'Search';

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
		return searchValue.trim() !== '' ||
			toggleButtons.some((b) => b.active) ||
			filters.some((f) => f.value && f.value !== '' && f.value !== false);
	}

	function handleClear() {
		searchValue = '';
		if (onSearch) onSearch('');
		if (onClear) {
			onClear();
		}
		dispatch('clear');
	}

	function handleSearchInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		searchValue = input.value;
		// Debounce could be added here, but for now call immediately
		if (onSearch) onSearch(searchValue);
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (onSearch) onSearch(searchValue);
			(e.currentTarget as HTMLInputElement).blur();
		}
	}
</script>

<div class="bg-spore-white rounded-xl mb-6 shadow-sm border border-spore-cream/50">
	<!-- Search Bar -->
	<div class="p-4 border-b border-spore-cream/30">
		<div class="relative">
			<input
				type="text"
				bind:value={searchValue}
				on:input={handleSearchInput}
				on:keydown={handleSearchKeydown}
				placeholder={searchPlaceholder}
				title={searchTitle}
				class="w-full pl-10 pr-4 py-2 bg-spore-cream/10 border border-spore-cream/30 rounded-lg text-sm text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
			/>
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spore-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			{#if searchValue}
				<button
					type="button"
					on:click={() => { searchValue = ''; if (onSearch) onSearch(''); }}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-spore-steel hover:text-spore-dark"
					title="Clear search"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

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
