<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { passwordResetSchema } from '$lib/validation';
	import type { PasswordResetInput } from '$lib/validation';

	export let data;

	let token = data.token;
	let form = {
		password: '',
		confirmPassword: ''
	};
	let errors: Record<string, string> = {};
	let isSubmitting = false;
	let showPassword = false;
	let showConfirmPassword = false;
	let resetSuccess = false;

	// Validate form on input
	function validateForm() {
		const result = passwordResetSchema.safeParse({
			...form,
			token
		});

		if (!result.success) {
			errors = {};
			result.error.issues.forEach((issue) => {
				const key = issue.path[0] as string;
				errors[key] = issue.message;
			});
			return false;
		}

		errors = {};
		return true;
	}

	// Handle form submission
	function handleSubmit() {
		if (!validateForm()) {
			return;
		}
		isSubmitting = true;
	}

	// Handle response from form action
	function handleResponse({ result }) {
		isSubmitting = false;

		if (result.type === 'success') {
			resetSuccess = true;
			// Redirect to login after 2 seconds
			setTimeout(() => {
				goto('/auth/login', {
					state: { message: 'Password reset successfully. Please log in with your new password.' }
				});
			}, 2000);
		} else {
			// Handle error response
			if (result.data?.errors) {
				errors = result.data.errors;
			} else {
				errors.general = result.data?.error || 'An error occurred while resetting your password';
			}
		}
	}
</script>

<svelte:head>
	<title>Reset Password | Spore CMMS</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-spore-orange">
				<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Reset your password
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Enter your new password below
			</p>
		</div>

		{#if resetSuccess}
			<div class="rounded-md bg-green-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-green-800">
							Password reset successfully!
						</p>
						<p class="mt-1 text-sm text-green-700">Redirecting to login...</p>
					</div>
				</div>
			</div>
		{:else}
			<form
				method="POST"
				use:enhance={() => {
					handleSubmit();
					return async ({ update }) => {
						const result = await update();
						handleResponse({ result });
					};
				}}
				class="mt-8 space-y-6"
			>
				<input type="hidden" name="token" value={token} />

				<div class="space-y-4">
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700">
							New Password
						</label>
						<div class="mt-1 relative">
							{#if showPassword}
								<input
									id="password"
									name="password"
									type="text"
									bind:value={form.password}
									required
									class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-spore-orange focus:border-spore-orange sm:text-sm {errors.password ? 'border-red-500' : ''}"
									placeholder="Enter your new password"
									on:input={validateForm}
								/>
							{:else}
								<input
									id="password"
									name="password"
									type="password"
									bind:value={form.password}
									required
									class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-spore-orange focus:border-spore-orange sm:text-sm {errors.password ? 'border-red-500' : ''}"
									placeholder="Enter your new password"
									on:input={validateForm}
								/>
							{/if}
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
								on:click={() => (showPassword = !showPassword)}
							>
								{#if showPassword}
									<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									</svg>
								{:else}
									<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								{/if}
							</button>
						</div>
						{#if errors.password}
							<p class="mt-1 text-sm text-red-600">{errors.password}</p>
						{/if}
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700">
							Confirm Password
						</label>
						<div class="mt-1 relative">
							{#if showConfirmPassword}
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="text"
									bind:value={form.confirmPassword}
									required
									class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-spore-orange focus:border-spore-orange sm:text-sm {errors.confirmPassword ? 'border-red-500' : ''}"
									placeholder="Confirm your new password"
									on:input={validateForm}
								/>
							{:else}
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									bind:value={form.confirmPassword}
									required
									class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-spore-orange focus:border-spore-orange sm:text-sm {errors.confirmPassword ? 'border-red-500' : ''}"
									placeholder="Confirm your new password"
									on:input={validateForm}
								/>
							{/if}
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
								on:click={() => (showConfirmPassword = !showConfirmPassword)}
							>
								{#if showConfirmPassword}
									<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									</svg>
								{:else}
									<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								{/if}
							</button>
						</div>
						{#if errors.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
						{/if}
					</div>
				</div>

				{#if errors.general}
					<div class="rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-red-800">{errors.general}</p>
							</div>
						</div>
					</div>
				{/if}

				<div>
					<button
						type="submit"
						disabled={isSubmitting}
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-spore-orange hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spore-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{#if isSubmitting}
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Resetting Password...
						{:else}
							Reset Password
						{/if}
					</button>
				</div>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300" />
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-gray-50 text-gray-500">or</span>
					</div>
				</div>

				<div class="mt-6 text-center">
					<a
						href="/auth/login"
						class="font-medium text-spore-orange hover:text-spore-orange/90 transition-colors"
					>
						Back to login
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>