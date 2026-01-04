<script lang="ts">
	import { getStatusColor, formatStatus } from '$lib/constants';

	export let status: string;
	export let size: 'sm' | 'md' = 'sm';

	$: colorClass = getStatusColor(status);
	$: formattedStatus = formatStatus(status);
	$: sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs';
</script>

<span class="{sizeClass} font-semibold rounded-full {colorClass} whitespace-nowrap">
	{formattedStatus}
</span>
