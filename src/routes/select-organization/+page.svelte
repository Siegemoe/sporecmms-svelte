<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let isSubmitting = false;
	let selectedOrg: string = '';
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2 text-lg">Select Organization</p>
			<p class="text-spore-cream/40 mt-1">Choose which organization to work with</p>
		</div>

		<!-- Organization Selection Card -->
		<div class="bg-spore-white rounded-2xl p-6 sm:p-8 shadow-2xl">
			{#if data.organizations && data.organizations.length > 0}
				<form
					method="POST"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
				>
					<div class="space-y-3 mb-8">
						{#each data.organizations as org}
							<label class="block">
								<input
									type="radio"
									name="organizationId"
									value={org.id}
									bind:group={selectedOrg}
									class="sr-only peer"
									required
								/>
								<div class="p-4 rounded-xl border-2 cursor-pointer transition-all peer-checked:border-spore-orange peer-checked:bg-spore-orange/10 border-spore-cream/30 hover:border-spore-cream/50">
									<div class="flex items-center justify-between">
										<div>
											<p class="font-bold text-spore-dark text-lg">{org.name}</p>
											{#if data.currentOrganization?.id === org.id}
												<p class="text-sm text-spore-orange font-medium mt-1">Currently selected</p>
											{/if}
										</div>
										<div class="w-5 h-5 rounded-full border-2 border-spore-cream/40 peer-checked:border-spore-orange peer-checked:bg-spore-orange flex items-center justify-center">
											{#if selectedOrg === org.id || data.currentOrganization?.id === org.id}
												<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
												</svg>
											{/if}
										</div>
									</div>
								</div>
							</label>
						{/each}
					</div>

					<button
						type="submit"
						disabled={isSubmitting || !selectedOrg}
						class="w-full bg-spore-forest text-white py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 touch-manipulation"
					>
						{#if isSubmitting}
							<span class="flex items-center justify-center">
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
						Switching Organization...
							</span>
						{:else}
							SWITCH TO ORGANIZATION
						{/if}
					</button>
				</form>

				<!-- Quick switch buttons -->
				{#if data.organizations.length > 1}
					<div class="mt-6 pt-6 border-t border-spore-cream/20">
						<p class="text-sm font-semibold text-spore-steel mb-3">Quick switch:</p>
						<div class="grid grid-cols-2 gap-3">
							{#each data.organizations as org}
								{#if org.id !== data.currentOrganization?.id}
									<form
										method="POST"
										class="contents"
									>
										<input type="hidden" name="organizationId" value={org.id} />
										<button
											type="submit"
											class="px-3 py-2 text-sm font-medium text-spore-dark bg-spore-cream/20 rounded-lg hover:bg-spore-cream/30 transition-colors touch-manipulation"
										>
											{org.name}
										</button>
									</form>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<!-- No organizations state -->
				<div class="text-center py-8">
					<svg class="w-16 h-16 mx-auto text-spore-steel/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
					</svg>
					<p class="text-spore-steel font-semibold mb-2">No organizations found</p>
					<p class="text-spore-steel/60 text-sm">You haven't joined any organizations yet</p>
					<a
						href="/onboarding"
						class="inline-flex items-center justify-center px-6 py-3 mt-4 bg-spore-forest text-white font-semibold rounded-xl hover:bg-spore-forest/90 transition-colors"
					>
						Create or Join Organization
					</a>
				</div>
			{/if}
		</div>

		<!-- Sign Out Link -->
		<div class="mt-6 text-center">
			<form method="POST" action="/auth/logout" use:enhance>
				<button
					type="submit"
					class="text-spore-cream/60 hover:text-spore-cream/80 text-sm transition-colors"
				>
					Sign out
				</button>
			</form>
		</div>
	</div>
</div>