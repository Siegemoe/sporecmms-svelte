<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';

	export let form: ActionData;

	let isSubmitting = false;
	let redirectTimeout: number;

	// Handle redirect after successful join
	$: if (form?.redirect) {
		clearTimeout(redirectTimeout);
		redirectTimeout = setTimeout(() => {
			window.location.href = '/dashboard';
		}, 2000);
	}
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2 text-lg">Join Organization</p>
			<p class="text-spore-cream/40 mt-1">Enter your invite code to get started</p>
		</div>

		<!-- Join Card -->
		<div class="bg-spore-white rounded-2xl p-6 sm:p-8 shadow-2xl">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 text-base font-medium">
					{form.error}
				</div>
			{/if}

			{#if form?.success}
				<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl mb-6 text-base font-medium">
					{form.success}
				</div>
			{/if}

			<form
				method="POST"
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

				{#if form?.organization}
					<div class="bg-spore-cream/10 rounded-xl p-4">
						<p class="text-sm font-semibold text-spore-steel mb-1">You're joining:</p>
						<p class="text-lg font-bold text-spore-dark">{form.organization}</p>
					</div>
				{/if}

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

			<div class="mt-8 pt-6 border-t border-spore-cream/20 text-center">
				<a href="/onboarding" class="text-spore-orange font-bold hover:text-spore-orange/80 transition-colors">
					← Back to onboarding
				</a>
			</div>
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