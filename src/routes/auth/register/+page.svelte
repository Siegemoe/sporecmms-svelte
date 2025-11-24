<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let isSubmitting = false;
</script>

<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8">
	<div class="max-w-md w-full">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">🌿 SPORE</h1>
			<p class="text-spore-cream/60 mt-2">Create your account</p>
		</div>

		<!-- Register Card -->
		<div class="bg-spore-white rounded-xl p-8">
			<h2 class="text-2xl font-bold text-spore-dark mb-6">Get Started</h2>

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
				<!-- Organization -->
				<div>
					<label for="orgName" class="block text-sm font-bold text-spore-steel mb-2">Organization Name</label>
					<input
						type="text"
						id="orgName"
						name="orgName"
						value={form?.orgName ?? ''}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						placeholder="Sunrise Senior Living"
						required
					/>
				</div>

				<!-- Name Row -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="block text-sm font-bold text-spore-steel mb-2">First Name</label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							value={form?.firstName ?? ''}
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
							required
						/>
					</div>
					<div>
						<label for="lastName" class="block text-sm font-bold text-spore-steel mb-2">Last Name</label>
						<input
							type="text"
							id="lastName"
							name="lastName"
							value={form?.lastName ?? ''}
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						/>
					</div>
				</div>

				<!-- Email -->
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

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-bold text-spore-steel mb-2">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						placeholder="••••••••"
						minlength="8"
						required
					/>
					<p class="text-xs text-spore-steel mt-1">Minimum 8 characters</p>
				</div>

				<!-- Confirm Password -->
				<div>
					<label for="confirmPassword" class="block text-sm font-bold text-spore-steel mb-2">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
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
					{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-spore-steel">
					Already have an account? 
					<a href="/auth/login" class="text-spore-orange font-bold hover:underline">Sign in</a>
				</p>
			</div>
		</div>
	</div>
</div>
