<script lang="ts">
	import '../app.css';
	import { initializeWebSocket } from '$lib/stores/websocket';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		if (data.user) {
			initializeWebSocket();
		}
	});

	$: currentPath = $page.url.pathname;
	$: user = data.user;
	$: isAuthPage = currentPath.startsWith('/auth');
</script>

{#if !isAuthPage && user}
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
<nav class="md:hidden bg-spore-dark border-b border-spore-steel/30 px-4 py-2">
	<div class="flex justify-around">
		<a href="/dashboard" class="text-lg {currentPath === '/dashboard' ? 'text-spore-orange' : 'text-spore-cream/70'}">📊</a>
		<a href="/work-orders" class="text-lg {currentPath.startsWith('/work-orders') ? 'text-spore-orange' : 'text-spore-cream/70'}">📋</a>
		<a href="/sites" class="text-lg {currentPath.startsWith('/sites') ? 'text-spore-orange' : 'text-spore-cream/70'}">🏢</a>
		<a href="/assets" class="text-lg {currentPath.startsWith('/assets') ? 'text-spore-orange' : 'text-spore-cream/70'}">⚙️</a>
		{#if user.role === 'ADMIN'}
			<a href="/users" class="text-lg {currentPath.startsWith('/users') ? 'text-spore-orange' : 'text-spore-cream/70'}">👥</a>
			<a href="/audit-log" class="text-lg {currentPath.startsWith('/audit-log') ? 'text-spore-orange' : 'text-spore-cream/70'}">📜</a>
		{/if}
	</div>
</nav>
{/if}

<!-- Page Content -->
<main class="{isAuthPage ? '' : 'bg-spore-steel min-h-screen'}">
	<slot />
</main>
