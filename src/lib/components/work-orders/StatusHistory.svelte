<script lang="ts">
	import type { WorkOrderStatus } from '@prisma/client';

	export let history: Array<{
		fromStatus: WorkOrderStatus;
		toStatus: WorkOrderStatus;
		reason: string | null;
		createdAt: Date;
		user: {
			displayName: string;
		} | null;
	}>;

	function getStatusColor(status: string) {
		switch (status) {
			case 'COMPLETED':
				return 'bg-spore-forest text-white';
			case 'IN_PROGRESS':
				return 'bg-spore-orange text-white';
			case 'PENDING':
				return 'bg-spore-steel text-white';
			case 'ON_HOLD':
				return 'bg-spore-cream text-spore-steel border border-spore-steel';
			case 'CANCELLED':
				return 'bg-red-600 text-white';
			default:
				return 'bg-spore-steel text-white';
		}
	}

	function formatStatus(status: string): string {
		return status.replace(/_/g, ' ');
	}
</script>

<div class="bg-spore-white rounded-xl p-6">
	<h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center gap-2">
		<span>📋</span>
		<span>Status History</span>
	</h2>

	{#if history.length === 0}
		<p class="text-spore-steel text-sm italic">No status changes recorded yet.</p>
	{:else}
		<div class="relative">
			<!-- Vertical timeline line -->
			<div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-spore-cream"></div>

			<div class="space-y-4">
				{#each history as entry, index}
					<div class="relative flex gap-4">
						<!-- Timeline dot -->
						<div class="flex-shrink-0 w-4 h-4 rounded-full bg-spore-forest border-2 border-spore-cream z-10 mt-1"></div>

						<!-- Content -->
						<div class="flex-1 min-w-0 pb-2">
							<div class="flex flex-wrap items-center gap-2 mb-1">
								<span class="px-2 py-0.5 text-xs font-bold rounded {getStatusColor(entry.fromStatus)}">
									{formatStatus(entry.fromStatus)}
								</span>
								<span class="text-spore-steel">→</span>
								<span class="px-2 py-0.5 text-xs font-bold rounded {getStatusColor(entry.toStatus)}">
									{formatStatus(entry.toStatus)}
								</span>
							</div>

							<div class="text-sm text-spore-dark">
								{#if entry.user}
									<span class="font-semibold">{entry.user.displayName}</span>
									changed the status
								{:else}
									Status changed
								{/if}
								<span class="text-spore-steel">
									{new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>

							{#if entry.reason}
								<div class="mt-1 text-sm text-spore-steel italic">
									Reason: "{entry.reason}"
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
