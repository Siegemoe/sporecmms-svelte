<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let isSubmitting = false;
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2 text-lg">Create your account</p>
			<p class="text-spore-cream/40 mt-1 text-sm">Join or create an organization later</p>
		</div>

		<!-- Register Card -->
		<div class="bg-spore-white rounded-2xl p-6 sm:p-8 shadow-2xl">
			<h2 class="text-2xl font-bold text-spore-dark mb-6">Get Started</h2>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 text-base font-medium">
					{form.error}
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

				<!-- Name -->
				<div>
					<label for="firstName" class="block text-base font-bold text-spore-steel mb-3">Full Name</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						value={form?.firstName ?? ''}
						class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
						placeholder="Enter your full name"
						autocapitalize="words"
						required
					/>
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="block text-base font-bold text-spore-steel mb-3">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={form?.email ?? ''}
						class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
						placeholder="you@example.com"
						autocapitalize="none"
						autocomplete="email"
						required
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-base font-bold text-spore-steel mb-3">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
						placeholder="Create a strong password"
						minlength="8"
						autocomplete="new-password"
						required
					/>
					<p class="text-sm text-spore-steel mt-2">Minimum 8 characters</p>
				</div>

				<!-- Confirm Password -->
				<div>
					<label for="confirmPassword" class="block text-base font-bold text-spore-steel mb-3">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						class="w-full px-5 py-4 text-lg rounded-xl border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:bg-spore-white transition-all"
						placeholder="Confirm your password"
						autocomplete="new-password"
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
							Creating Account...
						</span>
					{:else}
						CREATE ACCOUNT
					{/if}
				</button>
			</form>

			<div class="mt-8 pt-6 border-t border-spore-cream/20 text-center">
				<p class="text-base text-spore-steel">
					Already have an account?
					<a href="/auth/login" class="text-spore-orange font-bold hover:text-spore-orange/80 transition-colors">Sign in</a>
				</p>
			</div>
		</div>
	</div>
</div>
