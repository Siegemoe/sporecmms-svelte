<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getRoleBadgeClasses, ROLE_NAMES } from '$lib/utils/badges';
	import FilterBar from '$lib/components/FilterBar.svelte';

	export let data: PageData;

	let showCreateForm = false;
	let isSubmitting = false;
	let newUser = { email: '', firstName: '', lastName: '', role: 'TECHNICIAN' as const, password: '' };

	// Filter state
	let showFilters = false;
	let searchValue = '';
	let filterRole = '';
	let filterStatus = '';
	let sortOption = 'name';

	$: users = data.users || [];

	// Read initial filter state from URL
	$: if (page.url) {
		const urlParams = page.url.searchParams;
		searchValue = urlParams.get('search') || '';
		filterRole = urlParams.get('role') || '';
		filterStatus = urlParams.get('status') || '';
		sortOption = urlParams.get('sort') || 'name';
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (filterRole) params.set('role', filterRole);
		if (filterStatus) params.set('status', filterStatus);
		if (sortOption !== 'name') params.set('sort', sortOption);

		const queryString = params.toString();
		goto(`?${queryString}`, { replaceState: true, keepFocus: true });
	}

	function clearFilters() {
		searchValue = '';
		filterRole = '';
		filterStatus = '';
		sortOption = 'name';
		goto('?', { replaceState: true, keepFocus: true });
	}
</script>

<div class="max-w-7xl mx-auto px-4 py-10">
	<!-- Header with Filters -->
	<div class="mb-8">
		<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
			<div>
				<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Users</h1>
				<p class="text-spore-cream/60 mt-2 text-sm font-medium">
					{users.length} team member{users.length !== 1 ? 's' : ''}
				</p>
			</div>
			<div class="flex gap-3">
				<a
					href="/users/security"
					class="bg-spore-steel text-spore-cream px-6 py-3 rounded-xl hover:bg-spore-steel/90 transition-colors text-sm font-bold tracking-wide"
				>
					🔒 Security
				</a>
				<button
					on:click={() => showCreateForm = !showCreateForm}
					class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide"
				>
					{showCreateForm ? 'CANCEL' : '+ ADD USER'}
				</button>
			</div>
		</div>

		<!-- Filter Bar -->
		<FilterBar
			bind:showFilters
			bind:searchValue={searchValue}
			searchPlaceholder="Search users..."
			searchTitle="Search by name or email"
			onSearch={(v) => { searchValue = v; applyFilters(); }}
			toggleButtons={[]}
			filters={[
				{
					value: filterRole,
					placeholder: 'All Roles',
					title: 'Filter by role',
					onChange: (v) => { filterRole = v; applyFilters(); },
					options: Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label }))
				},
				{
					value: filterStatus,
					placeholder: 'All Status',
					title: 'Filter by status',
					onChange: (v) => { filterStatus = v; applyFilters(); },
					options: [
						{ value: 'active', label: 'Active' },
						{ value: 'inactive', label: 'Inactive' }
					]
				}
			]}
			sortOptions={[
				{ value: 'name', label: 'Name' },
				{ value: 'email', label: 'Email' },
				{ value: 'role', label: 'Role' },
				{ value: 'joined', label: 'Joined' },
				{ value: 'updated', label: 'Updated' }
			]}
			bind:sortValue={sortOption}
			onSortChange={(v) => { sortOption = v; applyFilters(); }}
			onClear={clearFilters}
			clearLabel="Reset"
		/>
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="bg-spore-white rounded-xl p-6 mb-8">
			<h2 class="text-lg font-bold text-spore-dark mb-4">Add New User</h2>
			<form 
				method="POST" 
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update, result }) => {
						await update();
						isSubmitting = false;
						if (result.type === 'success') {
							showCreateForm = false;
							newUser = { email: '', firstName: '', lastName: '', role: 'TECHNICIAN', password: '' };
						}
					};
				}}
				class="space-y-4"
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<input
						type="text"
						name="firstName"
						bind:value={newUser.firstName}
						placeholder="First name"
						class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
					<input
						type="text"
						name="lastName"
						bind:value={newUser.lastName}
						placeholder="Last name"
						class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
					/>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<input
						type="email"
						name="email"
						bind:value={newUser.email}
						placeholder="Email"
						class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
					/>
					<input
						type="password"
						name="password"
						bind:value={newUser.password}
						placeholder="Password (min 8 chars)"
						minlength="8"
						class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
					/>
					<select
						name="role"
						bind:value={newUser.role}
						class="px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
					>
						{#each Object.entries(ROLE_NAMES) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
				<button
					type="submit"
					disabled={isSubmitting || !newUser.email.trim() || !newUser.password}
					class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'CREATING...' : 'CREATE USER'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Users Table -->
	{#if users.length > 0}
		<div class="bg-spore-white rounded-xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full">
					<thead class="bg-spore-dark">
						<tr>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">User</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Email</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Role</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Status</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Joined</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each users as user (user.id)}
							<tr class="hover:bg-spore-cream/20 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm font-bold text-spore-dark">
										{user.firstName || ''} {user.lastName || ''}
										{#if !user.firstName && !user.lastName}
											<span class="text-spore-steel">(No name)</span>
										{/if}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">
									{user.email}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<form method="POST" action="?/updateRole" use:enhance class="inline">
										<input type="hidden" name="userId" value={user.id} />
										<select
											name="role"
											value={user.role}
											on:change={(e) => e.currentTarget.form?.requestSubmit()}
											class="{getRoleBadgeClasses(user.role)}"
										>
											{#each ['TECHNICIAN', 'MANAGER', 'ADMIN'] as role}
												<option value={role}>{ROLE_NAMES[role]}</option>
											{/each}
										</select>
									</form>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-medium rounded-full {user.isActive
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}">
										{user.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">
									{new Date(user.createdAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="userId" value={user.id} />
										<button
											type="submit"
											class="text-red-500 hover:text-red-400 font-bold transition-colors"
											on:click|preventDefault={(e) => {
												if (confirm(`Delete ${user.email}? This cannot be undone.`)) {
													e.currentTarget.closest('form')?.requestSubmit();
												}
											}}
										>
											Delete
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl">
			<div class="text-5xl mb-4">👥</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No users yet</h3>
			<p class="text-spore-steel mb-6">Add team members to get started</p>
			<button 
				on:click={() => showCreateForm = true}
				class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold"
			>
				+ ADD USER
			</button>
		</div>
	{/if}
</div>
