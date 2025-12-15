<script lang="ts">
	import '../app.css';
	// import { initializeWebSocket } from '$lib/stores/websocket';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import QuickFAB from '$lib/components/QuickFAB.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Temporarily disable WebSocket to debug login issue
	onMount(() => {
		// if (data.user) {
		// 	initializeWebSocket();
		// }
	});

	$: currentPath = $page.url.pathname;
	$: user = data.user;
	$: isAuthPage = currentPath.startsWith('/auth');
	$: isLandingPage = currentPath === '/';

	// Show FAB on all authenticated pages except work orders create page and auth pages
	$: showFAB = user && !isAuthPage && !isLandingPage && !currentPath.startsWith('/work-orders/new');
</script>

{#if !isAuthPage && !isLandingPage && user}
<!-- Navigation - Dark with orange accent -->
<nav class="bg-spore-dark border-b border-spore-steel/30">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex justify-between h-16">
			<div class="flex items-center gap-10">
				<!-- Logo -->
				<a href="/dashboard" class="flex items-center gap-2">
					<span class="text-2xl font-extrabold text-spore-cream tracking-tight">SPORE</span>
					<span class="text-xs font-medium text-spore-steel uppercase tracking-widest">CMMS</span>
				</a>
				
				<!-- Nav Links -->
				<div class="hidden md:flex items-center gap-1">
					<a 
						href="/dashboard" 
						class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
							{currentPath === '/dashboard' 
								? 'text-spore-orange' 
								: 'text-spore-cream/70 hover:text-spore-cream'}"
					>
						Dashboard
					</a>
					<a 
						href="/work-orders" 
						class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
							{currentPath.startsWith('/work-orders') 
								? 'text-spore-orange' 
								: 'text-spore-cream/70 hover:text-spore-cream'}"
					>
						Work Orders
					</a>
					<a 
						href="/sites" 
						class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
							{currentPath.startsWith('/sites') 
								? 'text-spore-orange' 
								: 'text-spore-cream/70 hover:text-spore-cream'}"
					>
						Sites
					</a>
					<a 
						href="/assets" 
						class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
							{currentPath.startsWith('/assets') 
								? 'text-spore-orange' 
								: 'text-spore-cream/70 hover:text-spore-cream'}"
					>
						Assets
					</a>
					{#if user.role === 'ADMIN'}
						<a 
							href="/users" 
							class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
								{currentPath.startsWith('/users') 
									? 'text-spore-orange' 
									: 'text-spore-cream/70 hover:text-spore-cream'}"
						>
							Users
						</a>
						<a 
							href="/audit-log" 
							class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors
								{currentPath.startsWith('/audit-log') 
									? 'text-spore-orange' 
									: 'text-spore-cream/70 hover:text-spore-cream'}"
						>
							Audit Log
						</a>
					{/if}
				</div>
			</div>

			<!-- User Menu -->
			<div class="flex items-center gap-4">
				<a href="/profile" class="hidden sm:block text-right hover:opacity-80 transition-opacity">
					<p class="text-sm font-semibold text-spore-cream">
						{user.firstName || user.email.split('@')[0]}
					</p>
					<p class="text-xs text-spore-steel capitalize">{user.role.toLowerCase()}</p>
				</a>
				<form method="POST" action="/auth/logout" use:enhance>
					<button 
						type="submit"
						class="text-sm font-semibold text-spore-cream/50 hover:text-spore-cream transition-colors"
						title="Sign out of your account"
					>
						Logout
					</button>
				</form>
			</div>
		</div>
	</div>
</nav>

<!-- Mobile nav -->
<nav class="md:hidden bg-spore-dark border-b border-spore-steel/30 px-4 py-3 shadow-lg">
	<div class="flex justify-around items-center">
		<a href="/dashboard" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath === '/dashboard' ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">📊</span>
			<span class="text-xs font-medium">Dashboard</span>
		</a>
		<a href="/work-orders" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath.startsWith('/work-orders') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">📋</span>
			<span class="text-xs font-medium">Work Orders</span>
		</a>
		<a href="/sites" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath.startsWith('/sites') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">🏢</span>
			<span class="text-xs font-medium">Sites</span>
		</a>
		<a href="/assets" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath.startsWith('/assets') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">⚙️</span>
			<span class="text-xs font-medium">Assets</span>
		</a>
		{#if user.role === 'ADMIN'}
			<div class="flex gap-2">
				<a href="/users" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors {currentPath.startsWith('/users') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
					<span class="text-lg leading-none">👥</span>
				</a>
				<a href="/audit-log" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors {currentPath.startsWith('/audit-log') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
					<span class="text-lg leading-none">📜</span>
				</a>
			</div>
		{/if}
	</div>
</nav>
{/if}

<!-- Page Content -->
<main class="{isAuthPage || isLandingPage ? '' : 'bg-spore-steel min-h-screen'}">
	<slot />
</main>

<!-- Quick FAB -->
{#if showFAB}
	<QuickFAB assets={data.assets || []} buildings={data.buildings || []} rooms={data.rooms || []} />
{/if}
