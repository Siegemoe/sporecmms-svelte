<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: auditLogs = data.auditLogs || [];
	$: page = data.page;
	$: totalPages = data.totalPages;

	function getUserName(user: { firstName?: string | null; lastName?: string | null; email: string }) {
		if (user.firstName || user.lastName) {
			return [user.firstName, user.lastName].filter(Boolean).join(' ');
		}
		return user.email;
	}

	function formatAction(action: string): string {
		return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
	}

	function getActionColor(action: string): string {
		if (action.includes('DELETED')) return 'text-red-500';
		if (action.includes('CREATED')) return 'text-spore-forest';
		if (action.includes('CHANGED') || action.includes('ASSIGNED')) return 'text-spore-orange';
		return 'text-spore-steel';
	}

	function formatDetails(details: unknown): string {
		if (!details) return '';
		if (typeof details === 'object') {
			return Object.entries(details as Record<string, unknown>)
				.filter(([_, v]) => v != null)
				.map(([k, v]) => `${k}: ${v}`)
				.join(', ');
		}
		return String(details);
	}
</script>

<svelte:head>
	<title>Audit Log — Spore CMMS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-10">
	<div class="mb-8">
		<h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Audit Log</h1>
		<p class="text-spore-cream/60 mt-2">Track all changes made in your organization</p>
	</div>

	{#if auditLogs.length > 0}
		<div class="bg-spore-white rounded-xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full">
					<thead class="bg-spore-dark">
						<tr>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">When</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Who</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Action</th>
							<th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Details</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-spore-cream/50">
						{#each auditLogs as log (log.id)}
							<tr class="hover:bg-spore-cream/20 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">
									<time datetime={log.createdAt.toString()}>
										{new Date(log.createdAt).toLocaleString()}
									</time>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-spore-dark">
									{getUserName(log.User)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm font-bold {getActionColor(log.action)}">
										{formatAction(log.action)}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-spore-steel max-w-md truncate" title={formatDetails(log.details)}>
									{formatDetails(log.details)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-center gap-2 mt-6">
				{#if page > 1}
					<a 
						href="/audit-log?page={page - 1}"
						class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold"
					>
						← Previous
					</a>
				{/if}
				<span class="px-4 py-2 text-spore-cream/60 text-sm">
					Page {page} of {totalPages}
				</span>
				{#if page < totalPages}
					<a 
						href="/audit-log?page={page + 1}"
						class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold"
					>
						Next →
					</a>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="text-center py-16 bg-spore-white rounded-xl">
			<div class="text-5xl mb-4">📜</div>
			<h3 class="text-xl font-bold text-spore-dark mb-2">No activity yet</h3>
			<p class="text-spore-steel">Actions will be recorded here as users make changes</p>
		</div>
	{/if}
</div>
