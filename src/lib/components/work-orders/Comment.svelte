<script lang="ts">
	import { enhance } from '$app/forms';
	import { linkifyMentions } from '$lib/utils/mentions';
	import CommentForm from './CommentForm.svelte';

	export let comment: {
		id: string;
		content: string;
		createdAt: Date;
		updatedAt: Date;
		isEdited: boolean;
		editedAt: Date | null;
		isDeleted: boolean;
		depth: number;
		user: {
			id: string;
			displayName: string;
			email: string;
		};
		mentions: Array<{
			mentionedUser: {
				id: string;
				firstName: string | null;
				lastName: string | null;
				email: string;
			};
		}>;
		replies?: any[];
	};
	export let currentUserId: string;
	export let mentionableUsers: Array<{
		id: string;
		displayName: string;
		mentionUsername: string;
	}>;
	export let maxDepth: number = 5;

	let isEditing = false;
	let isReplying = false;
	let showReplies = true;
	let editContent = '';
	let editFormElement: HTMLFormElement;
	let replyFormElement: HTMLFormElement;

	const MAX_DEPTH = 5;

	$: canReply = comment.depth < MAX_DEPTH;
	$: canEdit = comment.user.id === currentUserId;
	$: isOwnComment = comment.user.id === currentUserId;
	$: showReplyButton = canReply && !isEditing;
	$: displayName = comment.user.displayName;
	$: initials = displayName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
	$: timeAgo = formatTimeAgo(new Date(comment.createdAt));
	$: linkifiedContent = linkifyMentions(comment.content, comment.mentions);

	function formatTimeAgo(date: Date): string {
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (seconds < 60) return 'just now';
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
		if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
		return date.toLocaleDateString();
	}

	function startEditing() {
		editContent = comment.content;
		isEditing = true;
		isReplying = false;
	}

	function cancelEdit() {
		isEditing = false;
		editContent = '';
	}

	function startReplying() {
		isReplying = true;
		isEditing = false;
	}

	function cancelReply() {
		isReplying = false;
	}

	function toggleReplies() {
		showReplies = !showReplies;
	}
</script>

<div class="comment {comment.depth > 0 ? 'ml-4 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-spore-cream' : ''}">
	<div class="bg-spore-white rounded-lg p-4 {comment.depth > 0 ? 'bg-spore-cream/30' : ''}">
		{#if isEditing}
			<!-- Edit Mode -->
			<form
				bind:this={editFormElement}
				method="POST"
				action="?/updateComment"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							isEditing = false;
						}
						await update();
					};
				}}
				class="space-y-3"
			>
				<input type="hidden" name="commentId" value={comment.id} />
				<div>
					<textarea
						name="content"
						bind:value={editContent}
						rows="3"
						class="w-full px-3 py-2 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none text-sm"
						required
					></textarea>
				</div>
				<div class="flex gap-2">
					<button
						type="submit"
						disabled={!editContent.trim()}
						class="bg-spore-forest text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Save
					</button>
					<button
						type="button"
						on:click={cancelEdit}
						class="px-4 py-1.5 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<!-- View Mode -->
			<div class="flex gap-3">
				<!-- Avatar -->
				<div class="flex-shrink-0 w-8 h-8 rounded-full bg-spore-steel/20 flex items-center justify-center text-spore-steel font-bold text-xs">
					{initials}
				</div>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 flex-wrap">
						<span class="font-semibold text-spore-dark text-sm">{displayName}</span>
						<span class="text-spore-steel text-xs">{timeAgo}</span>
						{#if comment.isEdited}
							<span class="text-spore-steel text-xs italic" title="Edited {comment.editedAt ? new Date(comment.editedAt).toLocaleString() : ''}">
								(edited)
							</span>
						{/if}
					</div>

					<!-- Comment body with linkified mentions -->
					<div class="mt-1 text-sm text-spore-dark whitespace-pre-wrap break-words">
						{@html linkifiedContent}
					</div>

					<!-- Actions -->
					<div class="mt-2 flex gap-3">
						{#if showReplyButton}
							<button
								on:click={startReplying}
								class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors"
							>
								Reply
							</button>
						{/if}

						{#if canEdit && !comment.isDeleted}
							<button
								on:click={startEditing}
								class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors"
							>
								Edit
							</button>
						{/if}

						{#if isOwnComment && !comment.isDeleted}
							<form
								method="POST"
								action="?/deleteComment"
								use:enhance={() => {
									return async ({ result, update }) => {
										await update();
									};
								}}
							>
								<input type="hidden" name="commentId" value={comment.id} />
								<button
									type="submit"
									on:click={(e) => !confirm('Delete this comment?') && e.preventDefault()}
									class="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
								>
									Delete
								</button>
							</form>
						{/if}
					</div>

					<!-- Reply Form -->
					{#if isReplying}
						<div class="mt-3 pl-3 border-l-2 border-spore-cream">
							<CommentForm
								{mentionableUsers}
								parentId={comment.id}
								placeholder="Write a reply..."
								submitLabel="Reply"
								autofocus={true}
								onCancel={cancelReply}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Replies -->
	{#if comment.replies && comment.replies.length > 0}
		<div class="mt-2 space-y-2">
			{#if comment.replies.length > 2 && !showReplies}
				<button
					on:click={toggleReplies}
					class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors ml-1"
				>
					View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
				</button>
			{/if}

			{#if showReplies}
				{#each comment.replies as reply}
					<svelte:self
						comment={reply}
						{currentUserId}
						{mentionableUsers}
						{maxDepth}
					/>
				{/each}

				{#if comment.replies.length > 2}
					<button
						on:click={toggleReplies}
						class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors ml-1 mt-2"
					>
						Hide replies
					</button>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.mention-highlight {
		color: rgb(194, 108, 34);
		font-weight: 600;
		text-decoration: underline;
		text-decoration-style: dotted;
		text-underline-offset: 2px;
	}
</style>
