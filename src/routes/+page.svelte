<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Fallback client-side redirect (for build/fallback page scenario)
	onMount(() => {
		if (browser) {
			goto('/auth/login');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-spore-steel">
	<p class="text-spore-cream/50">Redirecting...</p>
</div>
