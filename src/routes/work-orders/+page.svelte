<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { wsStore } from '$lib/stores/websocket';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	let workOrders = data.workOrders || [];
	let assets = data.assets || [];
	let users = data.users || [];
	let myOnly = data.myOnly || false;
	
	// Sync when page data changes (form submissions, navigation)
	$: if (data.workOrders) workOrders = data.workOrders;
	$: if (data.assets) assets = data.assets;
	$: if (data.users) users = data.users;
	$: myOnly = data.myOnly || false;
	
	let wsConnected = false;
	let lastUpdate: string | null = null;
	let showCreateForm = false;
	let isSubmitting = false;
	let newWO = { title: '', description: '', assetId: '', failureMode: 'General' };

	// Helper to get user display name
	function getUserName(user: { firstName?: string | null; lastName?: string | null; email?: string } | null) {
		if (!user) return 'Unassigned';
		if (user.firstName || user.lastName) {
			return [user.firstName, user.lastName].filter(Boolean).join(' ');
		}
		return user.email || 'Unknown';
	}

	onMount(() => {
		if ($page.url.searchParams.get('create') === 'true') {
			showCreateForm = true;
		}
	});

	const unsubscribe = wsStore.subscribe((state) => {
		wsConnected = state.isConnected;
		
		if (state.messages.length > 0) {
			const latest = state.messages[0];
			
			if (latest.type === 'WO_UPDATE' && latest.payload) {
				const updated = latest.payload as { id: string; status: string; title: string };
				workOrders = workOrders.map((wo) => {
					if (wo.id === updated.id) {
						lastUpdate = `${updated.title} → ${updated.status}`;
						return { ...wo, ...updated };
					}
					return wo;
				});
			}
			
			if (latest.type === 'WO_NEW' && latest.payload) {
				const newWo = latest.payload as typeof workOrders[0];
				// Only add if not already in list (prevents duplicate from form + websocket)
				if (!workOrders.some(wo => wo.id === newWo.id)) {
					workOrders = [newWo, ...workOrders];
					lastUpdate = `New: ${newWo.title}`;
				}
			}
		}
	});

	onDestroy(() => unsubscribe());

	const failureModes = ['General', 'Electrical', 'Plumbing', 'HVAC', 'Structural', 'Safety', 'Cosmetic', 'Other'];
</script>

<svelte:head>
	<title>Work Orders — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Work Orders</h1>
			<div class="flex items-center gap-3 mt-2">
				<span 
					class="flex items-center gap-2 text-sm font-medium {wsConnected ? 'text-spore-orange' : 'text-spore-cream/50'}"
					role="status"
					aria-live="polite"
				>
					<span class="w-2 h-2 rounded-full {wsConnected ? 'bg-spore-orange animate-pulse' : 'bg-spore-cream/30'}" aria-hidden="true"></span>
					{wsConnected ? 'Live updates enabled' : 'Connecting...'}
				</span>
				{#if lastUpdate}
					<span class="text-sm font-medium text-spore-orange animate-pulse" role="status" aria-live="polite">
						{lastUpdate}
					</span>
				{/if}
			</div>
		</div>
		<button 
			on:click={() => showCreateForm = !showCreateForm}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide"
			aria-expanded={showCreateForm}
			aria-controls="create-form"
		>
			{showCreateForm ? 'CANCEL' : '+ NEW WORK ORDER'}
		</button>
	</div>

	<!-- Filter Toggle -->
	<div class="flex items-center gap-3 mb-6">
		<span class="text-sm font-medium text-spore-cream/70">All</span>
		<a 
			href={myOnly ? '/work-orders' : '/work-orders?my=true'}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {myOnly ? 'bg-spore-orange' : 'bg-spore-steel/50'}"
			role="switch"
			aria-checked={myOnly}
		>
			<span 
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {myOnly ? 'translate-x-6' : 'translate-x-1'}"
			></span>
		</a>
		<span class="text-sm font-medium text-spore-cream/70">My Work Orders</span>
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<div id="create-form" class="bg-spore-white rounded-xl p-6 mb-8" role="region" aria-label="Create work order form">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Create New Work Order</h2>
			<form 
				method="POST" 
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						showCreateForm = false;
						newWO = { title: '', description: '', assetId: '', failureMode: 'General' };
					};
				}}
				class="space-y-4"
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="wo-title" class="sr-only">Work order title</label>
						<input
							type="text"
							id="wo-title"
							name="title"
							bind:value={newWO.title}
							placeholder="Work order title"
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
							required
							aria-required="true"
						/>
					</div>
					<div>
						<label for="wo-asset" class="sr-only">Select asset</label>
						<select
							id="wo-asset"
							name="assetId"
							bind:value={newWO.assetId}
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							required
							aria-required="true"
						>
							<option value="">Select an asset...</option>
							{#each assets as asset}
								<option value={asset.id}>
									{asset.name} — {asset.room?.site?.name || 'Unknown'}, Room {asset.room?.name || 'N/A'}
								</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label for="wo-failure" class="sr-only">Failure mode</label>
						<select
							id="wo-failure"
							name="failureMode"
							bind:value={newWO.failureMode}
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
						>
							{#each failureModes as mode}
								<option value={mode}>{mode}</option>
							{/each}
						</select>
					</div>
					<div class="sm:col-span-2">
						<label for="wo-description" class="sr-only">Description</label>
						<textarea
							id="wo-description"
							name="description"
							bind:value={newWO.description}
							placeholder="Description (optional)"
							rows="1"
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
						></textarea>
					</div>
				</div>
				<div class="flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting || !newWO.title.trim() || !newWO.assetId}
						class="bg-spore-forest text-white px-8 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						aria-busy={isSubmitting}
					>
						{isSubmitting ? 'CREATING...' : 'CREATE WORK ORDER'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Work Orders Table -->
	{#if workOrders && workOrders.length > 0}
		<div class="bg-spore-white rounded-xl shadow-sm border border-spore-cream/50 overflow-hidden">
			<!-- Desktop Table -->
			<div class="hidden md:block overflow-x-auto">
				<table class="min-w-full" role="table" aria-label="Work orders list">
					<thead class="bg-spore-dark">
						<tr>
							<th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Title</th>
							<th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Status</th>
							<th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Assigned</th>
							<th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Asset</th>
							<th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each workOrders as workOrder (workOrder.id)}
							<tr class="hover:bg-spore-cream/20 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href="/work-orders/{workOrder.id}"
										class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors focus:outline-none focus:underline"
									>
										{workOrder.title}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full
										{workOrder.status === 'COMPLETED' ? 'bg-spore-forest text-white' : ''}
										{workOrder.status === 'IN_PROGRESS' ? 'bg-spore-orange text-white' : ''}
										{workOrder.status === 'PENDING' ? 'bg-spore-steel text-white' : ''}
										{workOrder.status === 'ON_HOLD' ? 'bg-spore-cream text-spore-steel' : ''}
										{workOrder.status === 'CANCELLED' ? 'bg-red-600 text-white' : ''}
									">
										{workOrder.status.replace('_', ' ')}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<form method="POST" action="?/assign" use:enhance class="inline">
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<select
											name="assignedToId"
											value={workOrder.assignedToId || ''}
											on:change={(e) => e.currentTarget.form?.requestSubmit()}
											class="text-sm bg-transparent border-0 text-spore-steel cursor-pointer hover:text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange rounded"
										>
											<option value="">Unassigned</option>
											{#each users as user}
												<option value={user.id}>{getUserName(user)}</option>
											{/each}
										</select>
									</form>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel font-medium">
									{workOrder.asset?.name || 'N/A'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-4">
									<form method="POST" action="?/updateStatus" class="inline" use:enhance>
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<input type="hidden" name="status" value="IN_PROGRESS" />
										<button
											type="submit"
											class="text-spore-orange hover:text-spore-orange/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed"
											disabled={workOrder.status === 'IN_PROGRESS'}
											title="Start working on {workOrder.title}"
											aria-label="Start work order: {workOrder.title}"
										>
											Start
										</button>
									</form>
									<form method="POST" action="?/updateStatus" class="inline" use:enhance>
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<input type="hidden" name="status" value="COMPLETED" />
										<button
											type="submit"
											class="text-spore-forest hover:text-spore-forest/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed"
											disabled={workOrder.status === 'COMPLETED'}
											title="Mark {workOrder.title} as completed"
											aria-label="Complete work order: {workOrder.title}"
										>
											Complete
										</button>
									</form>
									<a
										href="/work-orders/{workOrder.id}"
										class="text-spore-steel hover:text-spore-dark focus:outline-none focus:underline"
										title="View details for {workOrder.title}"
									>
										View
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile Cards -->
			<div class="md:hidden divide-y divide-spore-cream/50">
				{#each workOrders as workOrder (workOrder.id)}
					<div class="p-4 hover:bg-spore-cream/10 transition-colors">
						<div class="flex items-start justify-between mb-3">
							<h3 class="text-base font-bold text-spore-dark flex-1 mr-3">
								<a
									href="/work-orders/{workOrder.id}"
									class="hover:text-spore-orange transition-colors focus:outline-none focus:underline"
								>
									{workOrder.title}
								</a>
							</h3>
							<span class="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full
								{workOrder.status === 'COMPLETED' ? 'bg-spore-forest text-white' : ''}
								{workOrder.status === 'IN_PROGRESS' ? 'bg-spore-orange text-white' : ''}
								{workOrder.status === 'PENDING' ? 'bg-spore-steel text-white' : ''}
								{workOrder.status === 'ON_HOLD' ? 'bg-spore-cream text-spore-steel' : ''}
								{workOrder.status === 'CANCELLED' ? 'bg-red-600 text-white' : ''}
							">
								{workOrder.status.replace('_', ' ')}
							</span>
						</div>
						<div class="space-y-2 mb-4">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-spore-steel">Asset:</span>
								<span class="text-sm text-spore-dark">{workOrder.asset?.name || 'N/A'}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-spore-steel">Assigned:</span>
								<form method="POST" action="?/assign" use:enhance class="flex-1 max-w-[150px]">
									<input type="hidden" name="workOrderId" value={workOrder.id} />
									<select
										name="assignedToId"
										value={workOrder.assignedToId || ''}
										on:change={(e) => e.currentTarget.form?.requestSubmit()}
										class="w-full text-sm bg-spore-cream/30 border border-spore-cream/50 rounded-lg px-2 py-1 text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange"
									>
										<option value="">Unassigned</option>
										{#each users as user}
											<option value={user.id}>{getUserName(user)}</option>
										{/each}
									</select>
								</form>
							</div>
						</div>
						<div class="flex gap-2 text-sm font-bold">
							<form method="POST" action="?/updateStatus" class="flex-1" use:enhance>
								<input type="hidden" name="workOrderId" value={workOrder.id} />
								<input type="hidden" name="status" value="IN_PROGRESS" />
								<button
									type="submit"
									class="w-full bg-spore-orange text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-orange/90 focus:outline-none focus:ring-1 focus:ring-spore-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
									disabled={workOrder.status === 'IN_PROGRESS'}
									aria-label="Start work order: {workOrder.title}"
								>
									Start
								</button>
							</form>
							<form method="POST" action="?/updateStatus" class="flex-1" use:enhance>
								<input type="hidden" name="workOrderId" value={workOrder.id} />
								<input type="hidden" name="status" value="COMPLETED" />
								<button
									type="submit"
									class="w-full bg-spore-forest text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-forest/90 focus:outline-none focus:ring-1 focus:ring-spore-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
									disabled={workOrder.status === 'COMPLETED'}
									aria-label="Complete work order: {workOrder.title}"
								>
									Complete
								</button>
							</form>
							<a
								href="/work-orders/{workOrder.id}"
								class="flex-1 bg-spore-cream text-spore-dark py-2 px-3 rounded-lg font-medium text-center hover:bg-spore-cream/70 focus:outline-none focus:ring-1 focus:ring-spore-cream transition-colors"
							>
								View
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl" role="status">
			<div class="text-5xl mb-4" aria-hidden="true">📋</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No work orders yet</h3>
			<p class="text-spore-steel mb-6">Create your first work order to get started</p>
			<button 
				on:click={() => showCreateForm = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold"
			>
				+ CREATE WORK ORDER
			</button>
		</div>
	{/if}
</div>
