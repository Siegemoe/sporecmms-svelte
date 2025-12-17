<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let isSubmitting = false;
	let selectedOption = 'create'; // 'create' or 'join'
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2 text-lg">Welcome aboard!</p>
			<p class="text-spore-cream/40 mt-2">Let's get you set up with an organization</p>
		</div>

		<!-- Onboarding Card -->
		<div class="bg-spore-white rounded-2xl p-6 sm:p-8 shadow-2xl">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 text-base font-medium">
					{form.error}
				</div>
			{/if}

			<!-- Option Selection -->
			<div class="mb-8">
				<div class="grid grid-cols-2 gap-4">
					<button
						type="button"
						class="p-4 rounded-xl border-2 transition-all {selectedOption === 'create'
							? 'border-spore-orange bg-spore-orange/10 text-spore-orange'
							: 'border-spore-cream/30 text-spore-steel hover:border-spore-cream/50'}"
						on:click={() => selectedOption = 'create'}
					>
						<svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
						</svg>
						<span class="font-semibold text-sm">Create New</span>
					</button>
					<button
						type="button"
						class="p-4 rounded-xl border-2 transition-all {selectedOption === 'join'
							? 'border-spore-orange bg-spore-orange/10 text-spore-orange'
							: 'border-spore-cream/30 text-spore-steel hover:border-spore-cream/50'}"
						on:click={() => selectedOption = 'join'}
					>
						<svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
						</svg>
						<span class="font-semibold text-sm">Join Existing</span>
					</button>
				</div>
			</div>

			<!-- Create Organization Form -->
			{#if selectedOption === 'create'}
				<form
					method="POST"
					action="/onboarding?create=true"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
					class="space-y-5"
				>
					<div>
						<label for="orgName" class="block text-base font-bold text-spore-steel mb-3">Organization Name</label>
						<input
							type="text"
							id="orgName"
							name="orgName"
							value={form?.orgName ?? ''}
							class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
							placeholder="e.g., Sunrise Senior Living"
							autocapitalize="words"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full bg-spore-forest text-white py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-all transform active:scale-95 touch-manipulation"
					>
						{#if isSubmitting}
							<span class="flex items-center justify-center">
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Creating Organization...
							</span>
						{:else}
							CREATE ORGANIZATION
						{/if}
					</button>
				</form>
			{:else}
				<!-- Join Organization Form -->
				<form
					method="POST"
					action="/join-organization"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
					class="space-y-5"
				>
					<div>
						<label for="inviteToken" class="block text-base font-bold text-spore-steel mb-3">Invite Code</label>
						<input
							type="text"
							id="inviteToken"
							name="inviteToken"
							value={form?.inviteToken ?? ''}
							class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
							placeholder="Enter your invite code"
							autocapitalize="characters"
							autocorrect="off"
							spellcheck="false"
							required
						/>
						<p class="text-sm text-spore-steel mt-2">Ask your organization admin for the invite code</p>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full bg-spore-forest text-white py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-all transform active:scale-95 touch-manipulation"
					>
						{#if isSubmitting}
							<span class="flex items-center justify-center">
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Joining Organization...
							</span>
						{:else}
							JOIN ORGANIZATION
						{/if}
					</button>
				</form>
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