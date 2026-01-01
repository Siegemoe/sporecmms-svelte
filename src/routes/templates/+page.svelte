<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { PRIORITIES, DEFAULT_PRIORITY, WORK_ORDER_PRIORITY_COLORS } from '$lib/constants';
	import type { PageData } from './$types';

	export let data: PageData;

	let templates = data.templates || [];

	// Sync when page data changes
	$: if (data.templates) templates = data.templates;

	// Filter state
	let searchValue = data.search || '';
	let showInactive = data.showInactive || false;
	let showCreateForm = false;
	let isSubmitting = false;

	// New template form state
	let newTemplate = {
		name: '',
		description: '',
		title: '',
		workDescription: '',
		priority: DEFAULT_PRIORITY,
		isGlobal: false,
		items: [{ title: '' }]
	};

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (showInactive) params.set('inactive', 'true');
		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function clearFilters() {
		searchValue = '';
		showInactive = false;
		applyFilters();
	}

	function addItem() {
		newTemplate.items = [...newTemplate.items, { title: '' }];
	}

	function removeItem(index: number) {
		if (newTemplate.items.length > 1) {
			newTemplate.items = newTemplate.items.filter((_, i) => i !== index);
		}
	}

	function updateItem(index: number, title: string) {
		newTemplate.items = newTemplate.items.map((item, i) =>
			i === index ? { title } : item
		);
	}

	function resetForm() {
		newTemplate = {
			name: '',
			description: '',
			title: '',
			workDescription: '',
			priority: DEFAULT_PRIORITY,
			isGlobal: false,
			items: [{ title: '' }]
		};
	}
</script>

<svelte:head>
	<title>Work Order Templates — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">
				Work Order Templates
			</h1>
			<p class="text-spore-cream/70 mt-2">
				Create reusable templates for common work orders
			</p>
		</div>
		<button
			on:click={() => {
				showCreateForm = true;
				resetForm();
			}}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide shadow-lg"
			aria-expanded={showCreateForm}
		>
			+ NEW TEMPLATE
		</button>
	</div>

	<!-- Search and Filters -->
	<div class="bg-spore-white rounded-xl p-4 mb-6 border border-spore-cream/50">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<label for="template-search" class="sr-only">Search templates</label>
				<input
					type="text"
					id="template-search"
					bind:value={searchValue}
					placeholder="Search templates..."
					class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					on:keydown={(e) => e.key === 'Enter' && applyFilters()}
				/>
			</div>
			<div class="flex gap-3">
				<button
					on:click={applyFilters}
					class="px-4 py-2 bg-spore-dark text-white rounded-lg hover:bg-spore-dark/90 focus:outline-none focus:ring-2 focus:ring-spore-dark transition-colors font-medium text-sm"
				>
					Search
				</button>
				<button
					on:click={clearFilters}
					class="px-4 py-2 bg-spore-cream/20 text-spore-steel rounded-lg hover:bg-spore-cream/30 focus:outline-none focus:ring-2 focus:ring-spore-cream transition-colors font-medium text-sm"
				>
					Reset
				</button>
				<button
					on:click={() => {
						showInactive = !showInactive;
						applyFilters();
					}}
					class="px-4 py-2 rounded-lg font-medium text-sm transition-colors {
						showInactive
							? 'bg-spore-orange text-white'
							: 'bg-spore-cream/20 text-spore-steel hover:bg-spore-cream/30'
					}"
				>
					{showInactive ? 'All' : 'Active'}
				</button>
			</div>
		</div>
	</div>

	<!-- Create Form Modal -->
	{#if showCreateForm}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
			<div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div class="sticky top-0 bg-white border-b border-spore-cream px-6 py-4 flex justify-between items-center">
					<h2 class="text-xl font-bold text-spore-dark">Create Template</h2>
					<button
						on:click={() => showCreateForm = false}
						class="text-spore-steel hover:text-spore-dark focus:outline-none"
						aria-label="Close"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								showCreateForm = false;
								resetForm();
								await invalidateAll();
							}
						};
					}}
					class="p-6 space-y-4"
				>
					<!-- Error display -->
					{#if false && result?.type === 'failure'}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
							{result.error}
						</div>
					{/if}

					<!-- Template Name -->
					<div>
						<label for="tpl-name" class="block text-sm font-medium text-spore-dark mb-1">
							Template Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="tpl-name"
							name="name"
							bind:value={newTemplate.name}
							placeholder="e.g., Monthly HVAC Inspection"
							class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							required
							maxlength="100"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="tpl-desc" class="block text-sm font-medium text-spore-dark mb-1">
							Description
						</label>
						<textarea
							id="tpl-desc"
							name="description"
							bind:value={newTemplate.description}
							placeholder="Brief description of when to use this template..."
							rows="2"
							class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
							maxlength="500"
						></textarea>
					</div>

					<!-- Default Title and Description -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="tpl-title" class="block text-sm font-medium text-spore-dark mb-1">
								Default Work Order Title
							</label>
							<input
								type="text"
								id="tpl-title"
								name="title"
								bind:value={newTemplate.title}
								placeholder="e.g., Quarterly Maintenance"
								class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
								maxlength="200"
							/>
						</div>
						<div>
							<label for="tpl-priority" class="block text-sm font-medium text-spore-dark mb-1">
								Default Priority
							</label>
							<select
								id="tpl-priority"
								name="priority"
								bind:value={newTemplate.priority}
								class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							>
								{#each PRIORITIES as priority}
									<option value={priority}>{priority}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Default Work Description -->
					<div>
						<label for="tpl-work-desc" class="block text-sm font-medium text-spore-dark mb-1">
							Default Work Description
						</label>
						<textarea
							id="tpl-work-desc"
							name="workDescription"
							bind:value={newTemplate.workDescription}
							placeholder="Detailed description for the work order..."
							rows="3"
							class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
							maxlength="5000"
						></textarea>
					</div>

					<!-- Checklist Items -->
					<div>
						<div class="flex justify-between items-center mb-2">
							<label class="block text-sm font-medium text-spore-dark">
								Checklist Items <span class="text-red-500">*</span>
							</label>
							<button
								type="button"
								on:click={addItem}
								class="text-sm text-spore-orange hover:text-spore-orange/80 font-medium"
							>
								+ Add Item
							</button>
						</div>
						<div class="space-y-2">
							{#each newTemplate.items as item, index (index)}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={item.title}
										placeholder="Item {index + 1}"
										class="flex-1 px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
										maxlength="200"
									/>
									<button
										type="button"
										on:click={() => removeItem(index)}
										disabled={newTemplate.items.length === 1}
										class="p-2 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
										aria-label="Remove item"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							{/each}
						</div>
						<!-- Store items as JSON for submission -->
						<input type="hidden" name="items" value={JSON.stringify(newTemplate.items.filter(i => i.title.trim()))} />
					</div>

					<!-- Global Template (only for admins) -->
					<!-- TODO: Add admin check -->
					<!-- <label class="flex items-center gap-2">
						<input type="checkbox" name="isGlobal" class="rounded border-spore-cream" />
						<span class="text-sm text-spore-dark">Make this a global template (admin only)</span>
					</label> -->

					<!-- Actions -->
					<div class="flex justify-end gap-3 pt-4 border-t border-spore-cream">
						<button
							type="button"
							on:click={() => showCreateForm = false}
							disabled={isSubmitting}
							class="px-6 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !newTemplate.name.trim() || newTemplate.items.every(i => !i.title.trim())}
							class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isSubmitting ? 'Creating...' : 'Create Template'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Templates Grid -->
	{#if templates && templates.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each templates as template (template.id)}
				<article
					class="bg-white rounded-xl shadow-sm border border-spore-cream/50 hover:shadow-md transition-shadow overflow-hidden"
				>
					<!-- Header -->
					<div class="px-5 py-4 border-b border-spore-cream/50">
						<div class="flex items-start justify-between gap-2">
							<h3 class="font-bold text-lg text-spore-dark line-clamp-1">
								{template.name}
							</h3>
							<div class="flex gap-1 shrink-0">
								{#if template.isGlobal}
									<span
										class="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700"
										title="Global template"
									>
										Global
									</span>
								{/if}
								<span
									class="px-2 py-0.5 text-xs font-semibold rounded-full {WORK_ORDER_PRIORITY_COLORS[template.priority]}"
								>
									{template.priority}
								</span>
							</div>
						</div>
						{#if template.description}
							<p class="text-sm text-spore-steel mt-1 line-clamp-2">{template.description}</p>
						{/if}
					</div>

					<!-- Body -->
					<div class="px-5 py-4">
						<div class="flex items-center justify-between text-sm">
							<span class="text-spore-steel">
								{template._itemCount || 0} {template._itemCount === 1 ? 'item' : 'items'}
							</span>
							<span class="text-spore-steel">
								Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
							</span>
						</div>

						<!-- Checklist Preview -->
						{#if template.TemplateItems && template.TemplateItems.length > 0}
							<ul class="mt-3 space-y-1">
								{#each template.TemplateItems.slice(0, 3) as item}
									<li class="text-sm text-spore-steel flex items-center gap-2">
										<span class="w-1.5 h-1.5 rounded-full bg-spore-cream" aria-hidden="true"></span>
										<span class="truncate">{item.title}</span>
									</li>
								{/each}
								{#if template.TemplateItems.length > 3}
									<li class="text-sm text-spore-steel italic">
										+{template.TemplateItems.length - 3} more items
									</li>
								{/if}
							</ul>
						{/if}
					</div>

					<!-- Footer -->
					<div class="px-5 py-3 bg-spore-cream/10 border-t border-spore-cream/50 flex justify-between items-center">
						<a
							href="/templates/{template.id}"
							class="text-sm font-medium text-spore-orange hover:text-spore-orange/80 focus:outline-none focus:underline"
						>
							View Details
						</a>

						<form method="POST" action="?/delete" use:enhance class="inline">
							<input type="hidden" name="templateId" value={template.id} />
							<button
								type="submit"
								class="text-sm text-red-500 hover:text-red-700 focus:outline-none focus:underline"
								onclick="return confirm('Are you sure you want to delete this template?')"
							>
								Delete
							</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="text-center py-16 bg-white rounded-xl" role="status">
			<div class="text-5xl mb-4" aria-hidden="true">📋</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No templates yet</h3>
			<p class="text-spore-steel mb-6">Create your first template to speed up work order creation</p>
			<button
				on:click={() => {
					showCreateForm = true;
					resetForm();
				}}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold"
			>
				+ CREATE TEMPLATE
			</button>
		</div>
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
