<script lang="ts">
	import { ASSET_STATUS_COLORS, formatAssetStatus } from '$lib/constants';

	export let status: string;
	export let size: 'sm' | 'md' = 'md';

	const sizeClasses = size === 'sm'
		? 'px-2 py-1 text-xs'
		: 'px-3 py-1 text-sm';

	const colorClass = ASSET_STATUS_COLORS[status as keyof typeof ASSET_STATUS_COLORS]
		|| 'bg-gray-100 text-gray-800';

	const statusLabel = formatAssetStatus(status);
</script>

<span class="{sizeClasses} font-semibold rounded-full {colorClass}" title={statusLabel}>
	{statusLabel}
</span>
