<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let showCreateForm = false;
	let newSiteName = '';
	let isSubmitting = false;
	let editingSiteId: string | null = null;
	let editingSiteName = '';

	$: sites = data.sites || [];

	function startEdit(site: { id: string; name: string }) {
		editingSiteId = site.id;
		editingSiteName = site.name;
	}

	function cancelEdit() {
		editingSiteId = null;
		editingSiteName = '';
	}
</script>

<svelte:head>
	<title>Sites — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
		<div>
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Sites</h1>
			<p class="text-spore-cream/60 mt-2 text-sm font-medium">Manage your facility locations</p>
		</div>
		<button 
			on:click={() => showCreateForm = !showCreateForm}
			class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide"
		>
			{showCreateForm ? 'CANCEL' : '+ NEW SITE'}
		</button>
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="bg-spore-white rounded-xl p-6 mb-8">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Create New Site</h2>
			<form 
				method="POST" 
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						showCreateForm = false;
						newSiteName = '';
					};
				}}
				class="flex flex-col sm:flex-row gap-4"
			>
				<input
					type="text"
					name="name"
					bind:value={newSiteName}
					placeholder="Site name (e.g., Sunrise Manor)"
					class="flex-1 px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					required
				/>
				<button
					type="submit"
					disabled={isSubmitting || !newSiteName.trim()}
					class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'CREATING...' : 'CREATE SITE'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Sites Grid -->
	{#if sites.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each sites as site (site.id)}
				{#if editingSiteId === site.id}
					<!-- Edit Mode -->
					<div class="bg-spore-white rounded-xl p-6 ring-2 ring-spore-orange">
						<form 
							method="POST" 
							action="?/update"
							use:enhance={() => {
								isSubmitting = true;
								return async ({ update }) => {
									await update();
									isSubmitting = false;
									cancelEdit();
								};
							}}
						>
							<input type="hidden" name="siteId" value={site.id} />
							<div class="mb-4">
								<input
									type="text"
									name="name"
									bind:value={editingSiteName}
									class="w-full px-4 py-3 rounded-lg border border-spore-orange bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange text-lg font-bold"
									required
								/>
							</div>
							<div class="flex gap-2">
								<button
									type="submit"
									disabled={isSubmitting || !editingSiteName.trim()}
									class="flex-1 bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
								>
									{isSubmitting ? 'SAVING...' : 'SAVE'}
								</button>
								<button
									type="button"
									on:click={cancelEdit}
									class="px-4 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
								>
									CANCEL
								</button>
							</div>
						</form>
					</div>
				{:else}
					<!-- View Mode -->
					<div class="bg-spore-white rounded-xl p-6 hover:shadow-lg transition-all group relative">
						<a href="/sites/{site.id}" class="absolute inset-0 z-0"></a>
						<div class="relative z-10 pointer-events-none">
							<div class="flex justify-between items-start mb-4">
								<div class="w-12 h-12 bg-spore-forest/10 rounded-xl flex items-center justify-center">
									<span class="text-2xl">🏢</span>
								</div>
								<div class="flex gap-2 pointer-events-auto">
									<button
										on:click|preventDefault|stopPropagation={() => startEdit(site)}
										class="text-spore-steel/40 hover:text-spore-orange transition-colors opacity-0 group-hover:opacity-100"
									>
										✏️
									</button>
									<form 
										method="POST" 
										action="?/delete"
										use:enhance
									>
										<input type="hidden" name="siteId" value={site.id} />
										<button
											type="submit"
											class="text-spore-steel/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
											on:click|preventDefault|stopPropagation={(e) => {
												if (confirm('Delete this site? This will also delete all rooms and assets.')) {
													e.currentTarget.closest('form')?.requestSubmit();
												}
											}}
										>
											✕
										</button>
									</form>
								</div>
							</div>
							<h3 class="text-lg font-bold text-spore-dark group-hover:text-spore-forest transition-colors">
								{site.name}
							</h3>
							<p class="text-sm text-spore-steel mt-1">
								{site._count?.buildings || 0} building{site._count?.buildings !== 1 ? 's' : ''} • {site._count?.units || 0} unit{site._count?.units !== 1 ? 's' : ''}
							</p>
							<div class="mt-4 pt-4 border-t border-spore-cream/50">
								<span class="text-xs text-spore-steel">
									Created {new Date(site.createdAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl">
			<div class="text-5xl mb-4">🏢</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No sites yet</h3>
			<p class="text-spore-steel mb-6">Create your first site to get started</p>
			<button 
				on:click={() => showCreateForm = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold"
			>
				+ CREATE SITE
			</button>
		</div>
	{/if}
</div>
