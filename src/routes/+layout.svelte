<script lang="ts">
	import '../app.css';
	// import { initializeWebSocket } from '$lib/stores/websocket';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import QuickFAB from '$lib/components/QuickFAB.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Temporarily disable WebSocket to debug login issue
	onMount(() => {
		// if (data.user) {
		// 	initializeWebSocket();
		// }

		// Close dropdown when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			const orgMenu = document.getElementById('org-menu');
			if (orgMenu && !orgMenu.classList.contains('hidden')) {
				const target = event.target as HTMLElement;
				if (!target.closest('#org-menu') && !target.closest('button[onclick*="org-menu"]')) {
					orgMenu.classList.add('hidden');
				}
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	$: currentPath = $page.url.pathname;
	$: user = data.user;
	$: authState = data.authState;
	$: isAuthPage = currentPath.startsWith('/auth');
	$: isLandingPage = currentPath === '/';
	$: isOnboardingPage = currentPath.startsWith('/onboarding') || currentPath.startsWith('/join-organization') || currentPath.startsWith('/select-organization');

	// Show FAB on all authenticated pages except work orders create page and auth/onboarding pages
	$: showFAB = user && authState === 'org_member' && !isAuthPage && !isLandingPage && !isOnboardingPage && !currentPath.startsWith('/work-orders/new');
</script>

{#if !isAuthPage && !isLandingPage && !isOnboardingPage && user && authState === 'org_member'}
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

					<!-- Work Orders Dropdown -->
					<div class="relative">
						<button
							class="px-4 py-2 text-sm font-semibold tracking-wide transition-colors flex items-center gap-1
								{(currentPath.startsWith('/work-orders') || currentPath.startsWith('/templates'))
									? 'text-spore-orange'
									: 'text-spore-cream/70 hover:text-spore-cream'}"
							on:click={() => document.getElementById('wo-menu')?.classList.toggle('hidden')}
						>
							Work Orders
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
							</svg>
						</button>

						<!-- Work Orders Dropdown Menu -->
						<div id="wo-menu" class="hidden absolute left-0 mt-2 w-48 bg-spore-cream rounded-lg shadow-lg border border-spore-forest/20 z-50">
							<div class="py-1">
								<a
									href="/work-orders"
									on:click={() => document.getElementById('wo-menu')?.classList.add('hidden')}
									class="block px-4 py-2 text-sm font-bold text-spore-forest hover:bg-spore-forest/10 transition-colors"
								>
									Work Order Manager
								</a>
								<a
									href="/templates"
									on:click={() => document.getElementById('wo-menu')?.classList.add('hidden')}
									class="block px-4 py-2 text-sm font-bold text-spore-forest hover:bg-spore-forest/10 transition-colors"
								>
									Template Manager
								</a>
							</div>
						</div>
					</div>

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
				{#if data.organizations && data.organizations.length > 1}
					<div class="relative hidden sm:block">
						<button
							class="text-right hover:opacity-80 transition-opacity"
							on:click={() => document.getElementById('org-menu')?.classList.toggle('hidden')}
						>
							<p class="text-sm font-semibold text-spore-cream">
								{user?.firstName || user?.email?.split('@')[0] || 'User'}
							</p>
							<p class="text-xs text-spore-orange flex items-center gap-1">
								{data.currentOrganization?.name || 'Select Organization'}
								<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
								</svg>
							</p>
						</button>

						<!-- Organization Dropdown -->
						<div id="org-menu" class="hidden absolute right-0 mt-2 w-56 bg-spore-dark rounded-lg shadow-lg border border-spore-steel/30 z-50">
							<div class="py-1">
								{#each data.organizations as org}
									<form method="POST" action="/select-organization" class="contents">
										<input type="hidden" name="organizationId" value={org.id} />
										<button
											type="submit"
											class="w-full px-4 py-2 text-left text-sm hover:bg-spore-cream/10 transition-colors {org.id === data.currentOrganization?.id ? 'text-spore-orange bg-spore-cream/5' : 'text-spore-cream/80'}"
										>
											{org.name}
											{#if org.id === data.currentOrganization?.id}
												<span class="ml-2 text-xs">(Current)</span>
											{/if}
										</button>
									</form>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<a href="/profile" class="hidden sm:block text-right hover:opacity-80 transition-opacity">
						<p class="text-sm font-semibold text-spore-cream">
							{user?.firstName || user?.email?.split('@')[0] || 'User'}
						</p>
						<p class="text-xs text-spore-steel capitalize">{user?.role?.toLowerCase() || 'member'}</p>
					</a>
				{/if}
				<form method="POST" action="/auth/logout">
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
<nav class="md:hidden bg-spore-dark border-b border-spore-steel/30">
	{#if data.organizations && data.organizations.length > 1}
		<!-- Organization switcher for mobile -->
		<div class="px-4 py-3 border-b border-spore-steel/20">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-spore-steel uppercase tracking-wider">Organization</span>
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-spore-orange truncate max-w-[180px]">
						{data.currentOrganization?.name || 'Select...'}
					</span>
					<a href="/select-organization" class="text-spore-cream/60 hover:text-spore-cream transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	{/if}

	<div class="flex justify-around items-center py-3 shadow-lg">
		<a href="/dashboard" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath === '/dashboard' ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">📊</span>
			<span class="text-xs font-medium">Dashboard</span>
		</a>
		<a href="/work-orders" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath.startsWith('/work-orders') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">📋</span>
			<span class="text-xs font-medium">Work Orders</span>
		</a>
		<a href="/templates" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors {currentPath.startsWith('/templates') ? 'text-spore-orange bg-spore-cream/10' : 'text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5'}">
			<span class="text-xl leading-none">📝</span>
			<span class="text-xs font-medium">Templates</span>
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
<Breadcrumb />

<main class="{isAuthPage || isLandingPage ? '' : 'bg-spore-steel min-h-screen'}">
	<slot />
</main>

<!-- Quick FAB -->
{#if showFAB}
	<QuickFAB assets={data.assets || []} buildings={data.buildings || []} rooms={data.rooms || []} templates={data.templates || []} />
{/if}
