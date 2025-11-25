<script lang="ts">
	import { onDestroy } from 'svelte';
	import { wsStore } from '$lib/stores/websocket';
	import type { PageData } from './$types';

	export let data: PageData;

	let wsConnected = false;
	let wsPolling = false;
	let liveFeed: Array<{ type: string; message: string; time: Date; id: number }> = [];
	let lastSeenTimestamp = 0;

	const unsubscribe = wsStore.subscribe((state) => {
		wsConnected = state.isConnected;
		wsPolling = state.isPolling;

		if (state.messages.length > 0) {
			const latest = state.messages[0];

			if (latest.timestamp && latest.timestamp > lastSeenTimestamp) {
				lastSeenTimestamp = latest.timestamp;

				if (latest.type === 'WO_UPDATE') {
					const wo = latest.payload as { title: string; status: string };
					liveFeed = [
						{ type: 'update', message: `${wo.title} → ${wo.status}`, time: new Date(), id: latest.timestamp },
						...liveFeed
					].slice(0, 10);
				}

				if (latest.type === 'WO_NEW') {
					const wo = latest.payload as { title: string };
					liveFeed = [
						{ type: 'new', message: `New: ${wo.title}`, time: new Date(), id: latest.timestamp },
						...liveFeed
					].slice(0, 10);
				}
			}
		}
	});

	onDestroy(() => unsubscribe());

	$: stats = data.stats;
	$: recentWorkOrders = data.recentWorkOrders || [];
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
				<div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50">
					<p class="text-xs font-semibold text-spore-steel uppercase tracking-wide">Total WOs</p>
					<p class="text-3xl font-extrabold text-spore-dark mt-1">{stats?.total || 0}</p>
				</div>
				<div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50">
					<p class="text-xs font-semibold text-spore-steel uppercase tracking-wide">Pending</p>
					<p class="text-3xl font-extrabold text-spore-orange mt-1">{stats?.pending || 0}</p>
				</div>
				<div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50">
					<p class="text-xs font-semibold text-spore-steel uppercase tracking-wide">In Progress</p>
					<p class="text-3xl font-extrabold text-spore-steel mt-1">{stats?.inProgress || 0}</p>
				</div>
				<div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50">
					<p class="text-xs font-semibold text-spore-steel uppercase tracking-wide">Completed</p>
					<p class="text-3xl font-extrabold text-spore-forest mt-1">{stats?.completed || 0}</p>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50">
				<h2 class="text-lg font-bold text-spore-dark mb-5">Quick Actions</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<a href="/work-orders" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30">
						<span class="text-2xl mb-2">📋</span>
						<span class="text-sm font-semibold text-spore-steel">All Work Orders</span>
					</a>
					<a href="/sites" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30">
						<span class="text-2xl mb-2">🏢</span>
						<span class="text-sm font-semibold text-spore-steel">Sites</span>
					</a>
					<a href="/assets" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30">
						<span class="text-2xl mb-2">⚙️</span>
						<span class="text-sm font-semibold text-spore-steel">Assets</span>
					</a>
					<a href="/work-orders?create=true" class="flex flex-col items-center p-5 bg-spore-orange rounded-xl hover:bg-spore-orange/90 transition-colors shadow-sm hover:shadow-md">
						<span class="text-2xl mb-2">➕</span>
						<span class="text-sm font-bold text-white">New WO</span>
					</a>
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
								<span class="ml-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full
									{wo.status === 'COMPLETED' ? 'bg-spore-forest text-white' : ''}
									{wo.status === 'IN_PROGRESS' ? 'bg-spore-orange text-white' : ''}
									{wo.status === 'PENDING' ? 'bg-spore-steel text-white' : ''}
									{wo.status === 'ON_HOLD' ? 'bg-spore-cream text-spore-steel' : ''}
								">
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
