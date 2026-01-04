<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { wsStore } from '$lib/stores/websocket';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		WORK_ORDER_STATUSES,
		PRIORITIES,
		DEFAULT_SORT_OPTION,
		DEFAULT_PRIORITY,
		DEFAULT_SELECTION_MODE,
		WORK_ORDER_STATUS_COLORS,
		WORK_ORDER_PRIORITY_COLORS,
		getStatusColor,
		formatStatus
	} from '$lib/constants';
	import { formatUserName } from '$lib/utils/user';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import WorkOrderForm from '$lib/components/work-orders/WorkOrderForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let workOrders = data.workOrders || [];
	let assets = data.assets || [];
	let units = data.units || [];
	let buildings = data.buildings || [];
	let sites = data.sites || [];
	let users = data.users || [];
	let templates = data.templates || [];

	// Template state
	let selectedTemplateId = '';

	// Mobile card expansion state - track which cards are expanded (by work order ID)
	let expandedCardIds = new Set<string>();

	function toggleCardExpansion(workOrderId: string) {
		if (expandedCardIds.has(workOrderId)) {
			expandedCardIds.delete(workOrderId);
		} else {
			expandedCardIds.add(workOrderId);
		}
		expandedCardIds = new Set(expandedCardIds); // Trigger reactivity
	}

	function isCardExpanded(workOrderId: string): boolean {
		return expandedCardIds.has(workOrderId);
	}

	// Reactive helper - Svelte tracks this and updates template when expandedCardIds changes
	$: isExpanded = (id: string) => expandedCardIds.has(id);

	// Helper function for site options (to avoid type annotation issues in markup)
	function getSiteOptions() {
		return sites.map((s: any) => ({ value: s.id, label: s.name }));
	}

	// Filter State - initialize from URL params
	let filterStatus = data.status || '';
	let filterPriority = data.priority || '';
	let filterSite = data.siteId || '';
	let sortOption = data.sort || DEFAULT_SORT_OPTION;
	let showFilters = false;
	let myOnly = data.myOnly || false;
	let unassigned = data.unassigned || false;
	let searchValue = data.search || '';

	// Sync when page data changes
	$: if (data.workOrders) workOrders = data.workOrders;
	$: if (data.assets) assets = data.assets;
	$: if (data.units) units = data.units;
	$: if (data.buildings) buildings = data.buildings;
	$: if (data.sites) sites = data.sites;
	$: if (data.users) users = data.users;
	$: if (data.templates) templates = data.templates;

	function applyFilters() {
		const params = new URLSearchParams();
		if (myOnly) params.set('my', 'true');
		if (unassigned) params.set('unassigned', 'true');
		if (filterStatus) params.set('status', filterStatus);
		if (filterPriority) params.set('priority', filterPriority);
		if (filterSite) params.set('siteId', filterSite);
		if (sortOption && sortOption !== DEFAULT_SORT_OPTION) params.set('sort', sortOption);
		if (searchValue) params.set('search', searchValue);

		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function clearFilters() {
		filterStatus = '';
		filterPriority = '';
		filterSite = '';
		sortOption = DEFAULT_SORT_OPTION;
		myOnly = false;
		unassigned = false;
		searchValue = '';
		applyFilters();
	}

	function toggleMyOrders() {
		myOnly = !myOnly;
		if (myOnly) unassigned = false; // Mutually exclusive
		applyFilters();
	}

	function toggleUnassigned() {
		unassigned = !unassigned;
		if (unassigned) myOnly = false; // Mutually exclusive
		applyFilters();
	}

	let wsConnected = false;
	let lastUpdate: string | null = null;
	let showCreateForm = false;
	let isSubmitting = false;
	let newWO = {
		title: '',
		description: '',
		priority: DEFAULT_PRIORITY,
		dueDate: '',
		assignedToId: '',
		selectionMode: DEFAULT_SELECTION_MODE,
		assetId: '',
		unitId: '',
		buildingId: '',
		siteId: '',
		templateId: ''
	};

	// Handle template selection
	function selectTemplate(templateId: string) {
		selectedTemplateId = templateId;
		newWO.templateId = templateId;

		if (templateId) {
			const template = templates.find((t: any) => t.id === templateId);
			if (template) {
				// Auto-fill form fields with template values (can be overridden)
				if (template.title) newWO.title = template.title;
				if (template.workDescription) newWO.description = template.workDescription;
				if (template.priority) newWO.priority = template.priority;
			}
		}
	}

	// Check if a work order is overdue (compares dates at midnight to avoid timezone issues)
	function isOverdue(dueDate: Date | string | null | undefined, status: string): boolean {
		if (status === 'COMPLETED' || !dueDate) return false;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
		due.setHours(0, 0, 0, 0);
		return due < today;
	}

	// Get overdue styling class
	function getOverdueClass(dueDate: Date | string | null | undefined, status: string): string {
		return isOverdue(dueDate, status) ? 'text-red-500 font-semibold' : 'text-spore-dark';
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
						// Merge with proper type handling
						return { ...wo, status: updated.status as typeof wo.status };
					}
					return wo;
				});
			}
			if (latest.type === 'WO_NEW' && latest.payload) {
				const newWoPayload = latest.payload as { id: string; title: string };
				if (!workOrders.some(wo => wo.id === newWoPayload.id)) {
					// Just use the ID to fetch fresh data, or add a placeholder
					lastUpdate = `New: ${newWoPayload.title}`;
					// Trigger page refresh to get fresh data
					invalidateAll();
				}
			}
		}
	});

	onDestroy(() => unsubscribe());
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
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide shadow-lg"
			aria-expanded={showCreateForm}
			aria-controls="create-form"
		>
			{showCreateForm ? 'CANCEL' : '+ NEW WORK ORDER'}
		</button>
	</div>

	<!-- Filter Bar -->
	<FilterBar
		bind:showFilters
		bind:searchValue={searchValue}
		searchPlaceholder="Search work orders..."
		searchTitle="Search by title or description"
		onSearch={(v) => { searchValue = v; applyFilters(); }}
		toggleButtons={[
			{
				label: 'My Work Orders',
				active: myOnly,
				onToggle: toggleMyOrders,
				title: 'Show only my assigned work orders'
			},
			{
				label: 'Unassigned',
				active: unassigned,
				onToggle: toggleUnassigned,
				title: 'Show unassigned work orders'
			}
		]}
		filters={[
			{
				value: filterStatus,
				placeholder: 'All Statuses',
				title: 'Filter by status',
				onChange: (v) => { filterStatus = v; applyFilters(); },
				options: WORK_ORDER_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))
			},
			{
				value: filterPriority,
				placeholder: 'All Priorities',
				title: 'Filter by priority',
				onChange: (v) => { filterPriority = v; applyFilters(); },
				options: PRIORITIES.map(p => ({ value: p, label: p }))
			},
			{
				value: filterSite,
				placeholder: 'All Sites',
				title: 'Filter by site',
				onChange: (v) => { filterSite = v; applyFilters(); },
				show: sites.length > 0,
				options: getSiteOptions()
			}
		]}
		sortOptions={[
			{ value: 'dueDate', label: 'Due Date' },
			{ value: 'priority', label: 'Priority' },
			{ value: 'created', label: 'Newest' },
			{ value: 'updated', label: 'Updated' }
		]}
		bind:sortValue={sortOption}
		onSortChange={(v) => { sortOption = v; applyFilters(); }}
		onClear={clearFilters}
		clearLabel="Reset"
	/>

	<!-- Create Form -->
	{#if showCreateForm}
		<div id="create-form" class="bg-spore-white rounded-xl p-4 md:p-6 mb-8 border border-spore-orange/20 shadow-lg" role="region" aria-label="Create work order form">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Create New Work Order</h2>
			<WorkOrderForm
				assets={assets}
				units={units}
				buildings={buildings}
				sites={sites}
				users={users}
				templates={templates}
				bind:isSubmitting
				on:success={() => showCreateForm = false}
				on:cancel={() => showCreateForm = false}
			/>
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
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Title</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Priority</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Status</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Assigned</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell">Location</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider hidden lg:table-cell">Due Date</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each workOrders as workOrder (workOrder.id)}
							<tr class="hover:bg-spore-cream/20 transition-colors">
								<td class="px-4 py-3">
									<a
										href="/work-orders/{workOrder.id}"
										class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors focus:outline-none focus:underline block"
									>
										{workOrder.title}
									</a>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {WORK_ORDER_PRIORITY_COLORS[workOrder.priority] || WORK_ORDER_PRIORITY_COLORS.MEDIUM}">
										{workOrder.priority}
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(workOrder.status)}">
										{formatStatus(workOrder.status)}
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<form method="POST" action="?/assign" use:enhance class="inline">
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<select
											name="assignedToId"
											value={workOrder.assignedToId || ''}
											on:change={(e) => e.currentTarget.form?.requestSubmit()}
											class="text-xs bg-transparent border-0 text-spore-steel cursor-pointer hover:text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange rounded min-w-[120px]"
										>
											<option value="">Unassigned</option>
											{#each users as user}
												<option value={user.id}>{formatUserName(user)}</option>
											{/each}
										</select>
									</form>
								</td>
								<td class="px-4 py-3 text-sm text-spore-steel font-medium hidden lg:table-cell">
									{#if workOrder.asset && workOrder.asset.Unit}
										{workOrder.asset.Unit.Site?.name || 'N/A'} • Unit {workOrder.asset.Unit.roomNumber || workOrder.asset.Unit.name || 'N/A'}
										{#if workOrder.asset.Unit.Building} • Bldg {workOrder.asset.Unit.Building.name}{/if}
										{#if workOrder.asset.Unit.floor} • Floor {workOrder.asset.Unit.floor}{/if}
									{:else if workOrder.building}
										{workOrder.building.Site?.name || 'N/A'} • Bldg {workOrder.building.name}
									{:else if workOrder.unit}
										{workOrder.unit.Site?.name || 'N/A'} • Unit {workOrder.unit.roomNumber || workOrder.unit.name || 'N/A'}
										{#if workOrder.unit.Building} • Bldg {workOrder.unit.Building.name}{/if}
										{#if workOrder.unit.floor} • Floor {workOrder.unit.floor}{/if}
									{:else if workOrder.site}
										{workOrder.site.name}
									{:else}
										N/A
									{/if}
								</td>
								<td class="px-4 py-3 text-sm text-spore-steel hidden lg:table-cell">
									{#if workOrder.dueDate}
										{new Date(workOrder.dueDate).toLocaleDateString()}
										{#if isOverdue(workOrder.dueDate, workOrder.status)}
											<span class="text-red-500 font-semibold"> (Overdue)</span>
										{/if}
									{:else}
										-
									{/if}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2">
									{#if workOrder.status === 'PENDING'}
										<form method="POST" action="?/updateStatus" class="inline" use:enhance>
											<input type="hidden" name="workOrderId" value={workOrder.id} />
											<input type="hidden" name="status" value="IN_PROGRESS" />
											<button
												type="submit"
												class="text-spore-orange hover:text-spore-orange/70 focus:outline-none focus:underline"
												title="Start working on {workOrder.title}"
											>
												Start
											</button>
										</form>
									{/if}
									{#if workOrder.status === 'IN_PROGRESS'}
										<form method="POST" action="?/updateStatus" class="inline" use:enhance>
											<input type="hidden" name="workOrderId" value={workOrder.id} />
											<input type="hidden" name="status" value="COMPLETED" />
											<button
												type="submit"
												class="text-spore-forest hover:text-spore-forest/70 focus:outline-none focus:underline"
												title="Mark {workOrder.title} as completed"
											>
												Complete
											</button>
										</form>
									{/if}
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
					<div class="hover:bg-spore-cream/10 transition-colors">
						<!-- Card Header (Always Visible) -->
						<button
							on:click={() => toggleCardExpansion(workOrder.id)}
							class="w-full p-4 flex items-start justify-between text-left"
							aria-expanded={isExpanded(workOrder.id)}
							aria-controls={"card-content-" + workOrder.id}
						>
							<div class="flex items-center gap-3 flex-1 min-w-0">
								<div class="flex flex-col gap-1 flex-shrink-0">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {WORK_ORDER_PRIORITY_COLORS[workOrder.priority] || WORK_ORDER_PRIORITY_COLORS.MEDIUM}">
										{workOrder.priority}
									</span>
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(workOrder.status)}">
										{formatStatus(workOrder.status)}
									</span>
								</div>
								<h3 class="text-base font-bold text-spore-dark truncate">
									{workOrder.title}
								</h3>
							</div>
							<div class="flex-shrink-0 ml-2 text-spore-steel">
								<svg
									class="w-5 h-5 transition-transform {isExpanded(workOrder.id) ? 'rotate-180' : ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</button>

						<!-- Expandable Card Content -->
						<div
							id={"card-content-" + workOrder.id}
							class="overflow-hidden transition-all duration-200 {isExpanded(workOrder.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}"
						>
							<div class="px-4 pb-4 space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-sm font-medium text-spore-steel">Location:</span>
									<span class="text-sm text-spore-dark text-right">
										{#if workOrder.asset && workOrder.asset.Unit}
											{workOrder.asset.Unit.Site?.name || 'N/A'} • Unit {workOrder.asset.Unit.roomNumber || workOrder.asset.Unit.name || 'N/A'}
											{#if workOrder.asset.Unit.Building} • Bldg {workOrder.asset.Unit.Building.name}{/if}
											{#if workOrder.asset.Unit.floor} • Floor {workOrder.asset.Unit.floor}{/if}
										{:else if workOrder.building}
											{workOrder.building.Site?.name || 'N/A'} • Bldg {workOrder.building.name}
										{:else if workOrder.unit}
											{workOrder.unit.Site?.name || 'N/A'} • Unit {workOrder.unit.roomNumber || workOrder.unit.name || 'N/A'}
											{#if workOrder.unit.Building} • Bldg {workOrder.unit.Building.name}{/if}
											{#if workOrder.unit.floor} • Floor {workOrder.unit.floor}{/if}
										{:else if workOrder.site}
											{workOrder.site.name}
										{:else}
											N/A
										{/if}
									</span>
								</div>

								{#if workOrder.dueDate}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-spore-steel">Due:</span>
										<span class="text-sm {getOverdueClass(workOrder.dueDate, workOrder.status)}">
											{new Date(workOrder.dueDate).toLocaleDateString()}
										{#if isOverdue(workOrder.dueDate, workOrder.status)}
											 (Overdue)
										{/if}
									</span>
								</div>
							{/if}

							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-spore-steel">Assigned:</span>
								<form method="POST" action="?/assign" use:enhance class="flex-1 max-w-[180px]">
									<input type="hidden" name="workOrderId" value={workOrder.id} />
									<select
										name="assignedToId"
										value={workOrder.assignedToId || ''}
										on:change={(e) => e.currentTarget.form?.requestSubmit()}
										class="w-full text-sm bg-spore-cream/30 border border-spore-cream/50 rounded-lg px-3 py-2.5 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange min-h-[44px]"
									>
										<option value="">Unassigned</option>
										{#each users as user}
											<option value={user.id}>{formatUserName(user)}</option>
										{/each}
									</select>
								</form>
							</div>

							<div class="flex gap-2 text-sm font-bold pt-2">
								{#if workOrder.status === 'PENDING'}
									<form method="POST" action="?/updateStatus" class="flex-1" use:enhance>
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<input type="hidden" name="status" value="IN_PROGRESS" />
										<button
											type="submit"
											class="w-full bg-spore-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange transition-colors min-h-[44px]"
											aria-label="Start work order: {workOrder.title}"
										>
											Start
										</button>
									</form>
								{/if}
								{#if workOrder.status === 'IN_PROGRESS'}
									<form method="POST" action="?/updateStatus" class="flex-1" use:enhance>
										<input type="hidden" name="workOrderId" value={workOrder.id} />
										<input type="hidden" name="status" value="COMPLETED" />
										<button
											type="submit"
											class="w-full bg-spore-forest text-white py-3 px-4 rounded-lg font-medium hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest transition-colors min-h-[44px]"
											aria-label="Complete work order: {workOrder.title}"
										>
											Complete
										</button>
									</form>
								{/if}
								<a
									href="/work-orders/{workOrder.id}"
									class="flex-1 bg-spore-cream text-spore-dark py-3 px-4 rounded-lg font-medium text-center hover:bg-spore-cream/70 focus:outline-none focus:ring-2 focus:ring-spore-cream transition-colors min-h-[44px] flex items-center justify-center"
								>
									View
								</a>
							</div>
						</div>
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