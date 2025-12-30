<script lang="ts">
	import { ASSET_TYPES, ASSET_STATUSES, type AssetType, type AssetStatus } from '$lib/constants';

	export let units: Array<{
		id: string;
		site?: { name: string } | null;
		building?: { name: string } | null;
		roomNumber: string;
		name?: string | null;
	}> = [];

	export let name = '';
	export let unitId = '';
	export let type: AssetType = 'OTHER';
	export let status: AssetStatus = 'OPERATIONAL';
	export let description = '';
	export let purchaseDate = '';
	export let warrantyExpiry = '';

	export let submitLabel = 'SAVE';
	export let isSubmitting = false;
	export let showCancel = false;
	export let onCancel: (() => void) | undefined = undefined;

	function getUnitLabel(unit: typeof units[0]): string {
		const parts = [unit.site?.name, `Unit ${unit.roomNumber}`];
		if (unit.building) parts.push(`(${unit.building.name})`);
		if (unit.name) parts.push(`- ${unit.name}`);
		return parts.filter(Boolean).join(' ');
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
	<input
		bind:value={name}
		type="text"
		name="name"
		placeholder="Asset name (e.g., HVAC Unit #1)"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
		required
	/>

	<select
		bind:value={unitId}
		name="unitId"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
		required
	>
		<option value="">Select a unit...</option>
		{#each units as unit}
			<option value={unit.id}>{getUnitLabel(unit)}</option>
		{/each}
	</select>

	<select
		bind:value={type}
		name="type"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
	>
		{#each ASSET_TYPES as typeOption}
			<option value={typeOption}>{typeOption.replace('_', ' ')}</option>
		{/each}
	</select>

	<select
		bind:value={status}
		name="status"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
	>
		{#each ASSET_STATUSES as statusOption}
			<option value={statusOption}>{statusOption.replace('_', ' ')}</option>
		{/each}
	</select>

	<input
		bind:value={purchaseDate}
		type="date"
		name="purchaseDate"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
	/>

	<input
		bind:value={warrantyExpiry}
		type="date"
		name="warrantyExpiry"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
	/>

	<textarea
		bind:value={description}
		name="description"
		placeholder="Description (optional)"
		rows="3"
		class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange md:col-span-2"
	></textarea>

	<div class="flex gap-2 md:col-span-3">
		<button
			type="submit"
			disabled={isSubmitting || !name.trim() || !unitId}
			class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{isSubmitting ? 'SAVING...' : submitLabel}
		</button>
		{#if showCancel && onCancel}
			<button
				type="button"
				on:click={onCancel}
				class="px-6 py-3 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
			>
				CANCEL
			</button>
		{/if}
	</div>
</div>
