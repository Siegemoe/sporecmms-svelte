<script lang="ts">
	import Comment from './Comment.svelte';
	import CommentForm from './CommentForm.svelte';

	export let comments: Array<{
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
	}>;
	export let currentUserId: string;
	export let mentionableUsers: Array<{
		id: string;
		displayName: string;
		mentionUsername: string;
	}>;
	export let workOrderId: string;

	let sortNewestFirst = true;

	$: sortedComments = sortNewestFirst
		? [...comments].reverse()
		: comments;

	$: commentCount = comments.length;

	function getReplyCount(comment: any): number {
		if (!comment.replies || comment.replies.length === 0) return 0;
		return comment.replies.reduce((acc: number, reply: any) => acc + 1 + getReplyCount(reply), 0);
	}

	$: totalReplies = comments.reduce((acc, comment) => acc + getReplyCount(comment), 0);
</script>

<div class="bg-spore-white rounded-xl p-6">
	<h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center gap-2">
		<span>💬</span>
		<span>Comments</span>
		<span class="text-spore-steel font-normal text-sm">
			({commentCount} {commentCount === 1 ? 'comment' : 'comments'}
			{totalReplies > 0 ? `, ${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'}` : ''})
		</span>
	</h2>

	<!-- New Comment Form -->
	<div class="mb-6 pb-6 border-b border-spore-cream">
		<CommentForm
			{mentionableUsers}
			placeholder="Add a comment... Use @ to mention someone"
			submitLabel="Post Comment"
		/>
	</div>

	<!-- Sort Toggle -->
	{#if comments.length > 1}
		<div class="flex items-center gap-2 mb-4">
			<span class="text-sm text-spore-steel">Sort by:</span>
			<button
				on:click={() => (sortNewestFirst = true)}
				class="text-sm font-semibold {sortNewestFirst
					? 'text-spore-orange'
					: 'text-spore-steel hover:text-spore-orange'} transition-colors"
			>
				Newest
			</button>
			<span class="text-spore-cream">|</span>
			<button
				on:click={() => (sortNewestFirst = false)}
				class="text-sm font-semibold {!sortNewestFirst
					? 'text-spore-orange'
					: 'text-spore-steel hover:text-spore-orange'} transition-colors"
			>
				Oldest
			</button>
		</div>
	{/if}

	<!-- Comments List -->
	{#if sortedComments.length === 0}
		<div class="text-center py-8">
			<p class="text-spore-steel italic">No comments yet. Be the first to comment!</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each sortedComments as comment (comment.id)}
				<Comment
					{comment}
					{currentUserId}
					{mentionableUsers}
					maxDepth={5}
				/>
			{/each}
		</div>
	{/if}
</div>
