<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { WORK_ORDER_STATUSES, getStatusColor, STATUSES_REQUIRING_REASON } from '$lib/constants';
	import StatusHistory from '$lib/components/work-orders/StatusHistory.svelte';
	import Checklist from '$lib/components/work-orders/Checklist.svelte';
	import CommentThread from '$lib/components/work-orders/CommentThread.svelte';

	export let data: PageData;

	let isEditing = false;
	let isSubmitting = false;
	let selectedStatus: string | null = null;
	let statusReason = '';
	let editData = {
		title: '',
		description: '',
		assetId: ''
	};

	$: workOrder = data.workOrder;
	$: assets = data.assets || [];
	$: comments = data.comments || [];
	$: statusHistory = data.statusHistory || [];
	$: checklistItems = data.checklistItems || [];
	$: mentionableUsers = data.mentionableUsers || [];
	$: currentUser = data.user;

	const statuses = WORK_ORDER_STATUSES;

	function statusRequiresReason(status: string): boolean {
		return STATUSES_REQUIRING_REASON.includes(status);
	}

	function selectStatus(status: string) {
		selectedStatus = status === selectedStatus ? null : status;
	}

	function startEdit() {
		editData = {
			title: workOrder.title,
			description: workOrder.description || '',
			assetId: workOrder.assetId || ''
		};
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatStatus(status: string): string {
		return status.replace(/_/g, ' ');
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-10">
	{#if isEditing}
		<!-- Edit Mode -->
		<div class="bg-spore-white rounded-xl p-8">
			<h1 class="text-2xl font-extrabold text-spore-dark mb-6">Edit Work Order</h1>
			<form 
				method="POST" 
				action="?/update"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						isEditing = false;
					};
				}}
				class="space-y-6"
			>
				<div>
					<label class="block text-sm font-bold text-spore-steel mb-2">Title</label>
					<input
						type="text"
						name="title"
						bind:value={editData.title}
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
						required
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<label class="block text-sm font-bold text-spore-steel mb-2">Asset</label>
						<select
							name="assetId"
							bind:value={editData.assetId}
							class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"
							required
						>
							{#each assets as asset}
								<option value={asset.id}>
									{asset.name} — {asset.room?.site?.name}, Room {asset.room?.name}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label class="block text-sm font-bold text-spore-steel mb-2">Description</label>
					<textarea
						name="description"
						bind:value={editData.description}
						rows="4"
						class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
					></textarea>
				</div>

				<div class="flex gap-4 pt-4">
					<button
						type="submit"
						disabled={isSubmitting || !editData.title.trim()}
						class="bg-spore-forest text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 transition-colors"
					>
						{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
					</button>
					<button
						type="button"
						on:click={cancelEdit}
						class="px-8 py-3 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
					>
						CANCEL
					</button>
				</div>
			</form>
		</div>
	{:else}
		<!-- View Mode -->
		<div class="bg-spore-white rounded-xl overflow-hidden">
			<!-- Header -->
			<div class="bg-spore-dark p-6">
				<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
					<div>
						<h1 class="text-2xl font-extrabold text-spore-cream">{workOrder.title}</h1>
						<p class="text-spore-cream/60 mt-1 text-sm">
							Created {new Date(workOrder.createdAt).toLocaleDateString()}
						</p>
					</div>
					<span class="px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full {getStatusColor(workOrder.status)}">
						{formatStatus(workOrder.status)}
					</span>
				</div>
			</div>

			<!-- Details Body -->
			<div class="p-6 space-y-6">
				<!-- Location & Asset Info -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2">Asset</h3>
						<p class="text-spore-dark font-semibold">{workOrder.asset?.name || 'Unassigned'}</p>
					</div>
					<div>
						<h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2">Location</h3>
						<p class="text-spore-dark font-semibold">
							{#if workOrder.asset?.room}
								{workOrder.asset.room.site?.name ?? 'Unknown Site'} • Room {workOrder.asset.room.name ?? 'Unknown Room'}
								{#if workOrder.asset.room.building}
									• {workOrder.asset.room.building.name ?? 'Unknown Building'}
								{/if}
								{#if workOrder.asset.room.floor}
									• Floor {workOrder.asset.room.floor}
								{/if}
							{:else}
								No location
							{/if}
						</p>
					</div>
					<div>
						<h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2">Last Updated</h3>
						<p class="text-spore-dark font-semibold">{new Date(workOrder.updatedAt).toLocaleString()}</p>
					</div>
				</div>

				<!-- Description -->
				{#if workOrder.description}
					<div>
						<h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2">Description</h3>
						<p class="text-spore-dark whitespace-pre-wrap">{workOrder.description}</p>
					</div>
				{/if}

				<!-- Status Change Actions -->
				<div class="border-t border-spore-cream pt-6">
					<h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-4">Change Status</h3>

					<!-- Status buttons that require reason -->
					<div class="space-y-4">
						<div class="flex flex-wrap gap-2">
							{#each statuses as status}
								{#if workOrder.status !== status}
									<button
										on:click={() => selectStatus(status)}
										class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {selectedStatus ===
										status
											? 'ring-2 ring-offset-2 ring-spore-orange'
											: ''} {getStatusColor(status)} hover:opacity-80"
									>
										{status.replace('_', ' ')}
									</button>
								{/if}
							{/each}
						</div>

						<!-- Reason input and submit for selected status -->
						{#if selectedStatus}
							<form
								method="POST"
								action="?/updateStatus"
								use:enhance={() => {
									statusReason = '';
									return async ({ update }) => {
										selectedStatus = null;
										await update();
									};
								}}
								class="bg-spore-cream/30 rounded-lg p-4 space-y-3"
							>
								<input type="hidden" name="status" value={selectedStatus} />

								{#if statusRequiresReason(selectedStatus)}
									<div>
										<label class="block text-sm font-bold text-spore-dark mb-2">
											Reason <span class="text-red-500">*</span>
										</label>
										<input
											type="text"
											name="reason"
											bind:value={statusReason}
											placeholder="Please provide a reason for this status change..."
											class="w-full px-3 py-2 rounded-lg border border-spore-cream bg-white text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange text-sm"
											required
										/>
									</div>
								{/if}

								<div class="flex gap-2">
									<button
										type="submit"
										disabled={statusRequiresReason(selectedStatus) &&
											!statusReason.trim()}
										class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										Confirm: {selectedStatus.replace('_', ' ')}
									</button>
									<button
										type="button"
										on:click={() => (selectedStatus = null)}
										class="px-4 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream/50 transition-colors"
									>
										Cancel
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>

				<!-- Edit / Delete Actions -->
				<div class="border-t border-spore-cream pt-6 flex gap-4">
					<button
						on:click={startEdit}
						class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors"
					>
						EDIT WORK ORDER
					</button>
					<form method="POST" action="?/delete" use:enhance>
						<button
							type="submit"
							class="px-6 py-3 rounded-lg font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
							on:click={(e) => !confirm('Are you sure you want to delete this work order?') && e.preventDefault()}
						>
							DELETE
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Status History -->
	<div class="max-w-4xl mx-auto px-4 py-6">
		<StatusHistory history={statusHistory} />
	</div>

	<!-- Checklist -->
	<div class="max-w-4xl mx-auto px-4 py-6">
		<Checklist items={checklistItems} workOrderId={workOrder.id} />
	</div>

	<!-- Comments Section -->
	<div class="max-w-4xl mx-auto px-4 py-6">
		<CommentThread
			{comments}
			currentUserId={currentUser?.id || ''}
			{mentionableUsers}
			workOrderId={workOrder.id}
		/>
	</div>
</div>
