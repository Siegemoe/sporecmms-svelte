<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let isSubmitting = false;
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2">Maintenance Management System</p>
		</div>

		<!-- Login Card -->
		<div class="bg-spore-white rounded-xl p-8">
			<h2 class="text-2xl font-bold text-spore-dark mb-6">Sign In</h2>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
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
				<div>
					<label for="email" class="block text-sm font-bold text-spore-steel mb-2">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={form?.email ?? ''}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						placeholder="you@example.com"
						required
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-bold text-spore-steel mb-2">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						placeholder="••••••••"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-spore-forest text-white py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
				>
					{isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-spore-steel">
					Don't have an account? 
					<a href="/auth/register" class="text-spore-orange font-bold hover:underline">Create one</a>
				</p>
			</div>
		</div>
	</div>
</div>
