<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let securityLogs: any[] = [];
	let blockedIPs: any[] = [];
	let loading = true;
	let activeTab = 'logs';
	let filters = {
		severity: '',
		action: '',
		ipAddress: '',
		startDate: '',
		endDate: ''
	};
	let pagination = {
		logs: { page: 1, total: 0, limit: 50 },
		blocks: { page: 1, total: 0, limit: 50 }
	};

	async function loadSecurityLogs() {
		try {
			const params = new URLSearchParams({
				limit: pagination.logs.limit.toString(),
				offset: ((pagination.logs.page - 1) * pagination.logs.limit).toString()
			});

			if (filters.severity) params.set('severity', filters.severity);
			if (filters.action) params.set('action', filters.action);
			if (filters.ipAddress) params.set('ipAddress', filters.ipAddress);
			if (filters.startDate) params.set('startDate', new Date(filters.startDate).toISOString());
			if (filters.endDate) params.set('endDate', new Date(filters.endDate).toISOString());

			const response = await fetch(`/api/security/logs?${params}`);
			if (response.ok) {
				const result = await response.json();
				securityLogs = result.logs;
				pagination.logs.total = result.total;
			}
		} catch (error) {
			console.error('Failed to load security logs:', error);
		}
	}

	async function loadBlockedIPs() {
		try {
			const params = new URLSearchParams({
				limit: pagination.blocks.limit.toString(),
				offset: ((pagination.blocks.page - 1) * pagination.blocks.limit).toString()
			});

			const response = await fetch(`/api/security/blocks?${params}`);
			if (response.ok) {
				const result = await response.json();
				blockedIPs = result.blocks;
				pagination.blocks.total = result.total;
			}
		} catch (error) {
			console.error('Failed to load blocked IPs:', error);
		}
	}

	async function unblockIP(ipAddress: string) {
		if (!confirm(`Are you sure you want to unblock IP ${ipAddress}?`)) return;

		try {
			const response = await fetch('/api/security/blocks', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ipAddress })
			});

			if (response.ok) {
				await loadBlockedIPs();
			} else {
				alert('Failed to unblock IP');
			}
		} catch (error) {
			console.error('Failed to unblock IP:', error);
			alert('Failed to unblock IP');
		}
	}

	async function blockIP() {
		const ipAddress = prompt('Enter IP address to block:');
		const reason = prompt('Enter reason for blocking:');

		if (!ipAddress || !reason) return;

		try {
			const response = await fetch('/api/security/blocks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ipAddress, reason, severity: 'TEMPORARY' })
			});

			if (response.ok) {
				await loadBlockedIPs();
			} else {
				alert('Failed to block IP');
			}
		} catch (error) {
			console.error('Failed to block IP:', error);
			alert('Failed to block IP');
		}
	}

	async function applyFilters() {
		pagination.logs.page = 1;
		await loadSecurityLogs();
	}

	onMount(async () => {
		await Promise.all([loadSecurityLogs(), loadBlockedIPs()]);
		loading = false;
	});

	$: if (activeTab === 'logs') {
		loadSecurityLogs();
	} else if (activeTab === 'blocks') {
		loadBlockedIPs();
	}
</script>

<svelte:head>
	<title>Security Dashboard - SPORE CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-spore-cream mb-2">Security Dashboard</h1>
		<p class="text-spore-steel">Monitor security events and manage IP blocks</p>
	</div>

	<!-- Tabs -->
	<div class="flex gap-4 mb-6 border-b border-spore-steel/30">
		<button
			class="pb-3 px-1 font-semibold transition-colors border-b-2 {
				activeTab === 'logs'
					? 'text-spore-orange border-spore-orange'
					: 'text-spore-cream/50 border-transparent hover:text-spore-cream'
			}"
			on:click={() => (activeTab = 'logs')}
		>
			Security Logs
		</button>
		<button
			class="pb-3 px-1 font-semibold transition-colors border-b-2 {
				activeTab === 'blocks'
					? 'text-spore-orange border-spore-orange'
					: 'text-spore-cream/50 border-transparent hover:text-spore-cream'
			}"
			on:click={() => (activeTab = 'blocks')}
		>
			Blocked IPs
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-spore-orange"></div>
		</div>
	{:else if activeTab === 'logs'}
		<!-- Security Logs Tab -->
		<div>
			<!-- Filters -->
			<div class="bg-spore-dark/50 rounded-lg p-4 mb-6">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					<div>
						<label class="block text-sm font-medium text-spore-cream mb-1">Severity</label>
						<select bind:value={filters.severity} class="w-full px-3 py-2 bg-spore-steel border border-spore-steel/30 rounded-lg text-spore-cream">
							<option value="">All Severities</option>
							<option value="INFO">Info</option>
							<option value="WARNING">Warning</option>
							<option value="CRITICAL">Critical</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-spore-cream mb-1">Action</label>
						<select bind:value={filters.action} class="w-full px-3 py-2 bg-spore-steel border border-spore-steel/30 rounded-lg text-spore-cream">
							<option value="">All Actions</option>
							<option value="LOGIN_SUCCESS">Login Success</option>
							<option value="LOGIN_FAILED">Login Failed</option>
							<option value="LOGIN_BLOCKED">Login Blocked</option>
							<option value="RATE_LIMIT_VIOLATION">Rate Limit Violation</option>
							<option value="IP_BLOCKED">IP Blocked</option>
							<option value="IP_UNBLOCKED">IP Unblocked</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-spore-cream mb-1">IP Address</label>
						<input
							type="text"
							bind:value={filters.ipAddress}
							placeholder="Enter IP address"
							class="w-full px-3 py-2 bg-spore-steel border border-spore-steel/30 rounded-lg text-spore-cream"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-spore-cream mb-1">Start Date</label>
						<input
							type="datetime-local"
							bind:value={filters.startDate}
							class="w-full px-3 py-2 bg-spore-steel border border-spore-steel/30 rounded-lg text-spore-cream"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-spore-cream mb-1">End Date</label>
						<input
							type="datetime-local"
							bind:value={filters.endDate}
							class="w-full px-3 py-2 bg-spore-steel border border-spore-steel/30 rounded-lg text-spore-cream"
						/>
					</div>
				</div>
				<div class="mt-4">
					<button
						on:click={applyFilters}
						class="px-4 py-2 bg-spore-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
					>
						Apply Filters
					</button>
					<button
						on:click={() => {
							filters = {
								severity: '',
								action: '',
								ipAddress: '',
								startDate: '',
								endDate: ''
							};
							pagination.logs.page = 1;
							loadSecurityLogs();
						}}
						class="ml-2 px-4 py-2 bg-spore-steel text-spore-cream rounded-lg font-medium hover:bg-spore-steel/80 transition-colors"
					>
						Clear
					</button>
				</div>
			</div>

			<!-- Logs Table -->
			<div class="bg-spore-dark/50 rounded-lg overflow-hidden">
				<table class="w-full">
					<thead>
						<tr class="border-b border-spore-steel/30">
							<th class="text-left p-4 font-semibold text-spore-cream">Timestamp</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Severity</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Action</th>
							<th class="text-left p-4 font-semibold text-spore-cream">IP Address</th>
							<th class="text-left p-4 font-semibold text-spore-cream">User</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Details</th>
						</tr>
					</thead>
					<tbody>
						{#each securityLogs as log}
							<tr class="border-b border-spore-steel/20 hover:bg-spore-steel/20 transition-colors">
								<td class="p-4 text-spore-cream/70">{new Date(log.createdAt).toLocaleString()}</td>
								<td class="p-4">
									<span class="px-2 py-1 text-xs font-medium rounded {
										log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
										log.severity === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
										'bg-blue-500/20 text-blue-400'
									}">
										{log.severity}
									</span>
								</td>
								<td class="p-4 text-spore-cream/70">{log.action.replace(/_/g, ' ')}</td>
								<td class="p-4 font-mono text-sm text-spore-cream/70">{log.ipAddress}</td>
								<td class="p-4 text-spore-cream/70">
									{log.user ? `${log.user.firstName} ${log.user.lastName}` || log.user.email : '-'}
								</td>
								<td class="p-4 text-spore-cream/70">
									{#if log.details}
										<pre class="text-xs bg-spore-steel/50 p-2 rounded overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				{#if securityLogs.length === 0}
					<div class="p-8 text-center text-spore-cream/50">
						No security logs found
					</div>
				{/if}
			</div>

			<!-- Pagination -->
			{#if pagination.logs.total > pagination.logs.limit}
				<div class="mt-4 flex justify-between items-center">
					<div class="text-sm text-spore-cream/70">
						Showing {((pagination.logs.page - 1) * pagination.logs.limit) + 1} to {
							Math.min(pagination.logs.page * pagination.logs.limit, pagination.logs.total)
						} of {pagination.logs.total} entries
					</div>
					<div class="flex gap-2">
						<button
							disabled={pagination.logs.page === 1}
							on:click={() => {
								pagination.logs.page--;
								loadSecurityLogs();
							}}
							class="px-3 py-1 bg-spore-steel text-spore-cream rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							disabled={pagination.logs.page * pagination.logs.limit >= pagination.logs.total}
							on:click={() => {
								pagination.logs.page++;
								loadSecurityLogs();
							}}
							class="px-3 py-1 bg-spore-steel text-spore-cream rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Blocked IPs Tab -->
		<div>
			<div class="mb-6 flex justify-between items-center">
				<h2 class="text-lg font-semibold text-spore-cream">Blocked IP Addresses</h2>
				<button
					on:click={blockIP}
					class="px-4 py-2 bg-spore-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
				>
					Block New IP
				</button>
			</div>

			<div class="bg-spore-dark/50 rounded-lg overflow-hidden">
				<table class="w-full">
					<thead>
						<tr class="border-b border-spore-steel/30">
							<th class="text-left p-4 font-semibold text-spore-cream">IP Address</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Blocked At</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Expires At</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Severity</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Violations</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Reason</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Blocked By</th>
							<th class="text-left p-4 font-semibold text-spore-cream">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each blockedIPs as block}
							<tr class="border-b border-spore-steel/20 hover:bg-spore-steel/20 transition-colors">
								<td class="p-4 font-mono text-sm text-spore-cream">{block.ipAddress}</td>
								<td class="p-4 text-spore-cream/70">{new Date(block.blockedAt).toLocaleString()}</td>
								<td class="p-4 text-spore-cream/70">
									{block.expiresAt ? new Date(block.expiresAt).toLocaleString() : 'Never'}
								</td>
								<td class="p-4">
									<span class="px-2 py-1 text-xs font-medium rounded {
										block.severity === 'PERSISTENT' ? 'bg-red-500/20 text-red-400' :
										'bg-yellow-500/20 text-yellow-400'
									}">
										{block.severity}
									</span>
								</td>
								<td class="p-4 text-spore-cream/70">{block.violationCount}</td>
								<td class="p-4 text-spore-cream/70">{block.reason}</td>
								<td class="p-4 text-spore-cream/70">
									{block.blockedByUser ? `${block.blockedByUser.firstName} ${block.blockedByUser.lastName}` : 'System'}
								</td>
								<td class="p-4">
									<button
										on:click={() => unblockIP(block.ipAddress)}
										class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
									>
										Unblock
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				{#if blockedIPs.length === 0}
					<div class="p-8 text-center text-spore-cream/50">
						No blocked IPs found
					</div>
				{/if}
			</div>

			<!-- Pagination for Blocked IPs -->
			{#if pagination.blocks.total > pagination.blocks.limit}
				<div class="mt-4 flex justify-between items-center">
					<div class="text-sm text-spore-cream/70">
						Showing {((pagination.blocks.page - 1) * pagination.blocks.limit) + 1} to {
							Math.min(pagination.blocks.page * pagination.blocks.limit, pagination.blocks.total)
						} of {pagination.blocks.total} entries
					</div>
					<div class="flex gap-2">
						<button
							disabled={pagination.blocks.page === 1}
							on:click={() => {
								pagination.blocks.page--;
								loadBlockedIPs();
							}}
							class="px-3 py-1 bg-spore-steel text-spore-cream rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							disabled={pagination.blocks.page * pagination.blocks.limit >= pagination.blocks.total}
							on:click={() => {
								pagination.blocks.page++;
								loadBlockedIPs();
							}}
							class="px-3 py-1 bg-spore-steel text-spore-cream rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>