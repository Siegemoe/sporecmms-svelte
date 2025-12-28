<script lang="ts">
	import { onDestroy } from 'svelte';
	import { wsStore } from '$lib/stores/websocket';
	import type { PageData } from './$types';

	export let data: PageData;

	const LIVE_FEED_MAX_ITEMS = 10;

	let wsConnected = false;
	let wsPolling = false;
	let liveFeed: Array<{ type: string; message: string; time: Date; id: number }> = [];

	const unsubscribe = wsStore.subscribe((state) => {
		wsConnected = state.isConnected;
		wsPolling = state.isPolling;

		if (state.messages.length > 0) {
			const latest = state.messages[0];

			if (latest.type === 'WO_UPDATE') {
				const wo = latest.payload as { title: string; status: string };
				liveFeed = [
					{ type: 'update', message: `${wo.title} → ${wo.status}`, time: new Date(), id: latest.timestamp },
					...liveFeed
				].slice(0, LIVE_FEED_MAX_ITEMS);
			}

			if (latest.type === 'WO_NEW') {
				const wo = latest.payload as { title: string };
				liveFeed = [
					{ type: 'new', message: `New: ${wo.title}`, time: new Date(), id: latest.timestamp },
					...liveFeed
				].slice(0, LIVE_FEED_MAX_ITEMS);
			}
		}
	});

	onDestroy(() => unsubscribe());

	$: stats = data.stats;
	$: recentWorkOrders = data.recentWorkOrders || [];

	// Stats configuration for DRY rendering
	const statsConfig = [
		{ label: 'Total WOs', value: stats?.total || 0, color: 'text-spore-dark' },
		{ label: 'Pending', value: stats?.pending || 0, color: 'text-spore-orange' },
		{ label: 'In Progress', value: stats?.inProgress || 0, color: 'text-spore-steel' },
		{ label: 'Completed', value: stats?.completed || 0, color: 'text-spore-forest' }
	];

	// Quick actions configuration for DRY rendering
	const quickActions = [
		{ icon: '📋', label: 'All Work Orders', href: '/work-orders' },
		{ icon: '🏢', label: 'Sites', href: '/sites' },
		{ icon: '⚙️', label: 'Assets', href: '/assets' },
		{ icon: '➕', label: 'New WO', href: '/work-orders?create=true', primary: true }
	];

	// Status badge utility function
	function getStatusBadgeClasses(status: string): string {
		const base = 'px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full';
		const styles: Record<string, string> = {
			COMPLETED: 'bg-spore-forest text-white',
			IN_PROGRESS: 'bg-spore-orange text-white',
			PENDING: 'bg-spore-steel text-white',
			ON_HOLD: 'bg-spore-cream text-spore-steel'
		};
		return `${base} ${styles[status] || 'bg-spore-cream text-spore-steel'}`;
	}
</script>

<svelte:head>
	<title>Dashboard — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="mb-10">
		<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Dashboard</h1>
		<div class="flex items-center gap-3 mt-2">
			<span
				class="flex items-center gap-2 text-sm font-medium {wsConnected ? 'text-spore-orange' : wsPolling ? 'text-spore-forest' : 'text-spore-cream/50'}"
				role="status"
				aria-live="polite"
			>
				<span class="w-2 h-2 rounded-full {wsConnected ? 'bg-spore-orange animate-pulse' : wsPolling ? 'bg-spore-forest animate-pulse' : 'bg-spore-cream/30'}" aria-hidden="true"></span>
				{#if wsConnected}
					Live updates enabled
				{:else if wsPolling}
					Polling updates
				{:else}
					Connecting...
				{/if}
			</span>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left Column -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Stats Cards -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each statsConfig as stat}
					<div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50">
						<p class="text-xs font-semibold text-spore-steel uppercase tracking-wide">{stat.label}</p>
						<p class="text-3xl font-extrabold {stat.color} mt-1">{stat.value}</p>
					</div>
				{/each}
			</div>

			<!-- Quick Actions -->
			<div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50">
				<h2 class="text-lg font-bold text-spore-dark mb-5">Quick Actions</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each quickActions as action}
						<a
							href={action.href}
							class="flex flex-col items-center p-5 {action.primary
								? 'bg-spore-orange rounded-xl hover:bg-spore-orange/90 transition-colors shadow-sm hover:shadow-md'
								: 'bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30'}"
						>
							<span class="text-2xl mb-2">{action.icon}</span>
							<span class="text-sm font-semibold {action.primary ? 'text-white font-bold' : 'text-spore-steel'}">{action.label}</span>
						</a>
					{/each}
				</div>
			</div>

			<!-- Recent Work Orders -->
			<div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50">
				<div class="flex justify-between items-center mb-5">
					<h2 class="text-lg font-bold text-spore-dark">Recent Work Orders</h2>
					<a href="/work-orders" class="text-sm font-semibold text-spore-orange hover:text-spore-orange/80">View all →</a>
				</div>

				{#if recentWorkOrders.length > 0}
					<div class="space-y-3">
						{#each recentWorkOrders as wo}
							<div class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg border border-spore-cream/50">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-bold text-spore-dark truncate">{wo.title}</p>
									<p class="text-xs text-spore-steel mt-1">
										{wo.asset?.room?.name ? `Room ${wo.asset.room.name}` : ''}
										{wo.asset?.room?.building ? ` • Bldg ${wo.asset.room.building}` : ''}
										{wo.asset?.room?.floor ? ` • Floor ${wo.asset.room.floor}` : ''}
									</p>
								</div>
								<span class={getStatusBadgeClasses(wo.status)}>
									{wo.status.replace('_', ' ')}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-spore-steel text-sm">No recent work orders</p>
				{/if}
			</div>
		</div>

		<!-- Right Column: Live Feed -->
		<div class="space-y-8">
			<div class="bg-spore-dark rounded-xl p-6 border border-spore-steel/30">
				<div class="flex items-center justify-between mb-5">
					<h2 class="text-lg font-bold text-spore-cream">Live Feed</h2>
					<span class="flex items-center gap-2 text-xs font-semibold {wsConnected ? 'text-spore-orange' : wsPolling ? 'text-spore-forest' : 'text-spore-cream/50'}">
						<span class="w-2 h-2 rounded-full {wsConnected ? 'bg-spore-orange animate-pulse' : wsPolling ? 'bg-spore-forest animate-pulse' : 'bg-spore-cream/30'}"></span>
						{#if wsConnected}
							Live
						{:else if wsPolling}
							Polling
						{:else}
							Offline
						{/if}
					</span>
				</div>
				
				{#if liveFeed.length > 0}
					<div class="space-y-3">
						{#each liveFeed as item (item.id)}
							<div class="flex items-start gap-3 p-3 rounded-lg {item.type === 'new' ? 'bg-spore-forest/20' : 'bg-spore-steel/50'}">
								<span class="text-base">
									{item.type === 'new' ? '🆕' : '🔄'}
								</span>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-spore-cream truncate">{item.message}</p>
									<p class="text-xs text-spore-cream/50 mt-1">
										{item.time.toLocaleTimeString()}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-10">
						<p class="text-spore-cream/50 text-sm font-medium">Waiting for activity...</p>
						<p class="text-xs text-spore-cream/30 mt-2">Updates appear here in real-time</p>
					</div>
				{/if}
			</div>

			<!-- Site Summary -->
			{#if data.sites && data.sites.length > 0}
				<div class="bg-spore-white rounded-xl p-6">
					<h2 class="text-lg font-bold text-spore-dark mb-5">Sites</h2>
					<div class="space-y-3">
						{#each data.sites as site}
							<a href="/sites/{site.id}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50">
								<span class="text-sm font-bold text-spore-dark">{site.name}</span>
								<span class="text-xs font-semibold text-spore-steel">{site._count?.rooms || 0} rooms</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
