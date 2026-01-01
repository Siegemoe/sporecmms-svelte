<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { PRIORITIES, WORK_ORDER_PRIORITY_COLORS } from '$lib/constants';
	import type { PageData } from './$types';

	export let data: PageData;

	let template = data.template;
	let userRole = data.userRole;

	// Form state (editable mode)
	let isEditing = false;
	let isSubmitting = false;

	let formData = {
		name: template.name || '',
		description: template.description || '',
		title: template.title || '',
		workDescription: template.workDescription || '',
		priority: template.priority || 'MEDIUM',
		items: template.TemplateItems ? [...template.TemplateItems.map((i: { title: string }) => ({ title: i.title }))] : [{ title: '' }]
	};

	// Check if user can edit (creator or manager/admin)
	const canEdit = userRole === 'MANAGER' || userRole === 'ADMIN';

	function startEditing() {
		formData = {
			name: template.name || '',
			description: template.description || '',
			title: template.title || '',
			workDescription: template.workDescription || '',
			priority: template.priority || 'MEDIUM',
			items: template.TemplateItems
				? [...template.TemplateItems.map((i: { title: string }) => ({ title: i.title }))]
				: [{ title: '' }]
		};
		isEditing = true;
	}

	function cancelEditing() {
		isEditing = false;
	}

	function addItem() {
		formData.items = [...formData.items, { title: '' }];
	}

	function removeItem(index: number) {
		if (formData.items.length > 1) {
			formData.items = formData.items.filter((_, i) => i !== index);
		}
	}

	function updateItem(index: number, title: string) {
		formData.items = formData.items.map((item, i) => (i === index ? { title } : item));
	}
</script>

<svelte:head>
	<title>{template.name} — Template — Spore CMMS</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
		<div class="flex items-center gap-3">
			<a
				href="/templates"
				class="text-spore-steel hover:text-spore-dark focus:outline-none focus:underline"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</a>
			<div>
				<h1 class="text-3xl font-extrabold text-spore-cream tracking-tight">
					{template.name}
				</h1>
				<div class="flex items-center gap-2 mt-1">
					{#if template.isGlobal}
						<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
							Global Template
						</span>
					{/if}
					<span class="text-sm text-spore-cream/70">
						Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
					</span>
				</div>
			</div>
		</div>

		<div class="flex gap-3">
			{#if canEdit && !isEditing}
				<button
					on:click={startEditing}
					class="px-4 py-2 bg-spore-cream/20 text-spore-dark rounded-lg hover:bg-spore-cream/30 focus:outline-none focus:ring-2 focus:ring-spore-cream transition-colors font-medium text-sm"
				>
					Edit Template
				</button>
			{/if}
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="templateId" value={template.id} />
				<button
					type="submit"
					class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium text-sm"
					onclick="return confirm('Are you sure you want to delete this template?')"
				>
					Delete
				</button>
			</form>
		</div>
	</div>

	{#if isEditing}
		<!-- Edit Mode -->
		<div class="bg-white rounded-xl shadow-lg border border-spore-orange/20 overflow-hidden">
			<div class="px-6 py-4 bg-spore-orange/5 border-b border-spore-orange/20">
				<h2 class="text-lg font-bold text-spore-dark">Edit Template</h2>
			</div>

			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							isEditing = false;
							await invalidateAll();
						}
					};
				}}
				class="p-6 space-y-4"
			>
				<!-- Template Name -->
				<div>
					<label for="edit-name" class="block text-sm font-medium text-spore-dark mb-1">
						Template Name <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="edit-name"
						name="name"
						bind:value={formData.name}
						class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
						maxlength="100"
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="edit-desc" class="block text-sm font-medium text-spore-dark mb-1">
						Description
					</label>
					<textarea
						id="edit-desc"
						name="description"
						bind:value={formData.description}
						rows="2"
						class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
						maxlength="500"
					></textarea>
				</div>

				<!-- Default Title and Priority -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-title" class="block text-sm font-medium text-spore-dark mb-1">
							Default Work Order Title
						</label>
						<input
							type="text"
							id="edit-title"
							name="title"
							bind:value={formData.title}
							class="w-full px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							maxlength="200"
						/>
					</div>
					<div>
						<label for="edit-priority" class="block text-sm font-medium text-spore-dark mb-1">
							Default Priority
						</label>
						<select
							id="edit-priority"
							name="priority"
							bind:value={formData.priority}
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
					<label for="edit-work-desc" class="block text-sm font-medium text-spore-dark mb-1">
						Default Work Description
					</label>
					<textarea
						id="edit-work-desc"
						name="workDescription"
						bind:value={formData.workDescription}
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
						{#each formData.items as item, index (index)}
							<div class="flex gap-2">
								<span class="flex items-center text-spore-steel text-sm w-8">{index + 1}.</span>
								<input
									type="text"
									bind:value={item.title}
									placeholder="Checklist item"
									class="flex-1 px-4 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
									maxlength="200"
								/>
								<button
									type="button"
									on:click={() => removeItem(index)}
									disabled={formData.items.length === 1}
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
					<input
						type="hidden"
						name="items"
						value={JSON.stringify(formData.items.filter((i) => i.title.trim()))}
					/>
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-3 pt-4 border-t border-spore-cream">
					<button
						type="button"
						on:click={cancelEditing}
						disabled={isSubmitting}
						class="px-6 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSubmitting || !formData.name.trim() || formData.items.every((i) => !i.title.trim())}
						class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isSubmitting ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	{:else}
		<!-- View Mode -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Template Details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Description -->
				{#if template.description}
					<div class="bg-white rounded-xl shadow-sm border border-spore-cream/50 p-6">
						<h2 class="text-sm font-bold text-spore-steel uppercase tracking-wide mb-3">
							Description
						</h2>
						<p class="text-spore-dark">{template.description}</p>
					</div>
				{/if}

				<!-- Checklist Items -->
				<div class="bg-white rounded-xl shadow-sm border border-spore-cream/50 p-6">
					<h2 class="text-sm font-bold text-spore-steel uppercase tracking-wide mb-4">
						Checklist Items ({template.TemplateItems?.length || 0})
					</h2>
					{#if template.TemplateItems && template.TemplateItems.length > 0}
						<ul class="space-y-3">
							{#each template.TemplateItems as item, index (item.id)}
								<li class="flex items-start gap-3 p-3 bg-spore-cream/10 rounded-lg">
									<span class="flex items-center justify-center w-6 h-6 rounded-full bg-spore-orange text-white text-xs font-bold shrink-0">
										{index + 1}
									</span>
									<span class="text-spore-dark font-medium">{item.title}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-spore-steel italic">No checklist items defined.</p>
					{/if}
				</div>

				<!-- Default Content Preview -->
				{#if template.title || template.workDescription}
					<div class="bg-white rounded-xl shadow-sm border border-spore-cream/50 p-6">
						<h2 class="text-sm font-bold text-spore-steel uppercase tracking-wide mb-4">
							Default Work Order Content
						</h2>
						{#if template.title}
							<div class="mb-3">
								<span class="text-xs font-medium text-spore-steel uppercase">Title</span>
								<p class="text-spore-dark font-medium">{template.title}</p>
							</div>
						{/if}
						{#if template.workDescription}
							<div>
								<span class="text-xs font-medium text-spore-steel uppercase">Description</span>
								<p class="text-spore-dark whitespace-pre-wrap">{template.workDescription}</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Priority Badge -->
				<div class="bg-white rounded-xl shadow-sm border border-spore-cream/50 p-6">
					<h2 class="text-sm font-bold text-spore-steel uppercase tracking-wide mb-3">
						Priority
					</h2>
					<span
						class="inline-flex px-3 py-1 text-sm font-semibold rounded-full {WORK_ORDER_PRIORITY_COLORS[template.priority]}"
					>
						{template.priority}
					</span>
				</div>

				<!-- Metadata -->
				<div class="bg-white rounded-xl shadow-sm border border-spore-cream/50 p-6">
					<h2 class="text-sm font-bold text-spore-steel uppercase tracking-wide mb-3">
						Details
					</h2>
					<dl class="space-y-3 text-sm">
						<div class="flex justify-between">
							<dt class="text-spore-steel">Items</dt>
							<dd class="text-spore-dark font-medium">{template._itemCount || 0}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-spore-steel">Used</dt>
							<dd class="text-spore-dark font-medium">{template.usageCount}x</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-spore-steel">Scope</dt>
							<dd class="text-spore-dark font-medium">
								{#if template.isGlobal}
									<span class="text-purple-600">Global</span>
								{:else}
									Organization
								{/if}
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-spore-steel">Status</dt>
							<dd class="text-spore-dark font-medium">
								{#if template.isActive}
									<span class="text-green-600">Active</span>
								{:else}
									<span class="text-red-600">Inactive</span>
								{/if}
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-spore-steel">Created</dt>
							<dd class="text-spore-dark font-medium">
								{new Date(template.createdAt).toLocaleDateString()}
							</dd>
						</div>
					</dl>
				</div>

				<!-- Use Template Button -->
				<a
					href="/work-orders?template={template.id}"
					class="block w-full text-center bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold tracking-wide shadow-lg"
				>
					Use This Template
				</a>
			</div>
		</div>
	{/if}
</div>
