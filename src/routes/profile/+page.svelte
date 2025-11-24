<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let isUpdatingProfile = false;
	let isChangingPassword = false;
	
	// Password form fields
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
</script>

<svelte:head>
	<title>Profile — Spore CMMS</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-10">
	<div class="mb-8">
		<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Profile Settings</h1>
		<p class="text-spore-cream/60 mt-2">Manage your account information</p>
	</div>

	<!-- Profile Overview Card -->
	<div class="bg-spore-dark rounded-xl p-6 mb-6 border border-spore-steel/30">
		<div class="flex items-start gap-6">
			<!-- Avatar placeholder -->
			<div class="w-20 h-20 rounded-full bg-spore-orange flex items-center justify-center text-3xl font-bold text-white shrink-0">
				{(data.profile?.firstName?.[0] || data.profile?.email?.[0] || '?').toUpperCase()}
			</div>
			
			<div class="flex-1 min-w-0">
				<h2 class="text-2xl font-bold text-spore-cream">
					{#if data.profile?.firstName || data.profile?.lastName}
						{[data.profile?.firstName, data.profile?.lastName].filter(Boolean).join(' ')}
					{:else}
						{data.profile?.email?.split('@')[0]}
					{/if}
				</h2>
				
				<div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
					<div>
						<span class="text-spore-steel">Email</span>
						<p class="text-spore-cream font-medium truncate">{data.profile?.email}</p>
					</div>
					<div>
						<span class="text-spore-steel">Phone</span>
						<p class="text-spore-cream font-medium">{data.profile?.phoneNumber || '—'}</p>
					</div>
					<div>
						<span class="text-spore-steel">Role</span>
						<p class="text-spore-cream font-medium capitalize">{data.profile?.role?.toLowerCase()}</p>
					</div>
					<div>
						<span class="text-spore-steel">Access Level</span>
						<p class="font-medium {data.profile?.role === 'ADMIN' ? 'text-spore-orange' : data.profile?.role === 'MANAGER' ? 'text-spore-forest' : 'text-spore-cream'}">
							{#if data.profile?.role === 'ADMIN'}
								Full Access
							{:else if data.profile?.role === 'MANAGER'}
								Elevated Access
							{:else}
								Standard Access
							{/if}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Edit Profile Section -->
	<div class="bg-spore-white rounded-xl p-6 mb-6">
		<h2 class="text-lg font-bold text-spore-dark mb-4">Edit Profile</h2>
		
		{#if form?.success}
			<div class="mb-4 p-3 bg-spore-forest/10 border border-spore-forest/30 rounded-lg text-spore-forest text-sm">
				{form.message}
			</div>
		{/if}

		<form 
			method="POST" 
			action="?/updateProfile"
			use:enhance={() => {
				isUpdatingProfile = true;
				return async ({ update }) => {
					await update();
					isUpdatingProfile = false;
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="firstName" class="block text-sm font-medium text-spore-steel mb-1">First Name</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						value={data.profile?.firstName || ''}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
				</div>
				<div>
					<label for="lastName" class="block text-sm font-medium text-spore-steel mb-1">Last Name</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						value={data.profile?.lastName || ''}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
				</div>
			</div>

			<div>
				<label for="phoneNumber" class="block text-sm font-medium text-spore-steel mb-1">Phone Number</label>
				<input
					type="tel"
					id="phoneNumber"
					name="phoneNumber"
					value={data.profile?.phoneNumber || ''}
					placeholder="(555) 123-4567"
					class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-spore-steel mb-1">Email</label>
				<input
					type="email"
					value={data.profile?.email || ''}
					disabled
					class="w-full px-4 py-3 rounded-lg border border-spore-cream/50 bg-spore-cream/10 text-spore-steel cursor-not-allowed"
				/>
				<p class="text-xs text-spore-steel mt-1">Contact an admin to change your email</p>
			</div>

			<div class="flex justify-between items-center pt-2">
				<div class="text-sm text-spore-steel">
					<span class="font-medium">Role:</span> 
					<span class="capitalize">{data.profile?.role.toLowerCase()}</span>
				</div>
				<button
					type="submit"
					disabled={isUpdatingProfile}
					class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest disabled:opacity-50 transition-colors"
				>
					{isUpdatingProfile ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	</div>

	<!-- Change Password Section -->
	<div class="bg-spore-white rounded-xl p-6">
		<h2 class="text-lg font-bold text-spore-dark mb-4">Change Password</h2>

		{#if form?.passwordError}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
				{form.passwordError}
			</div>
		{/if}

		{#if form?.passwordSuccess}
			<div class="mb-4 p-3 bg-spore-forest/10 border border-spore-forest/30 rounded-lg text-spore-forest text-sm">
				{form.message}
			</div>
		{/if}

		<form 
			method="POST" 
			action="?/changePassword"
			use:enhance={() => {
				isChangingPassword = true;
				return async ({ update }) => {
					await update();
					isChangingPassword = false;
					// Clear password fields on success
					if (!form?.passwordError) {
						currentPassword = '';
						newPassword = '';
						confirmPassword = '';
					}
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="currentPassword" class="block text-sm font-medium text-spore-steel mb-1">Current Password</label>
				<input
					type="password"
					id="currentPassword"
					name="currentPassword"
					bind:value={currentPassword}
					required
					class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="newPassword" class="block text-sm font-medium text-spore-steel mb-1">New Password</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						bind:value={newPassword}
						minlength="8"
						required
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
				</div>
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-spore-steel mb-1">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						bind:value={confirmPassword}
						minlength="8"
						required
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
				</div>
			</div>

			<p class="text-xs text-spore-steel">Password must be at least 8 characters</p>

			<div class="flex justify-end pt-2">
				<button
					type="submit"
					disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
					class="bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange disabled:opacity-50 transition-colors"
				>
					{isChangingPassword ? 'Changing...' : 'Change Password'}
				</button>
			</div>
		</form>
	</div>

	<!-- Account Info -->
	<div class="mt-6 text-center text-sm text-spore-cream/50">
		Account created {new Date(data.profile?.createdAt || '').toLocaleDateString()}
	</div>
</div>
