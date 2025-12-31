<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Action } from 'svelte/action';

	export let mentionableUsers: Array<{
		id: string;
		displayName: string;
		mentionUsername: string;
	}>;
	export let parentId: string | null = null;
	export let placeholder: string = 'Write a comment...';
	export let submitLabel: string = 'Comment';
	export let onCancel: (() => void) | null = null;
	export let autofocus: boolean = false;

	let textareaElement: HTMLTextAreaElement;
	let content = '';
	let showMentionDropdown = false;
	let filteredUsers = mentionableUsers;
	let cursorPosition = 0;
	let mentionStartIndex = -1;
	let currentMentionText = '';

	const MAX_COMMENT_LENGTH = 5000;

	$: remainingChars = MAX_COMMENT_LENGTH - content.length;

	// Find the username being mentioned after @
	function findMentionAtCursor(text: string, pos: number): { startIndex: number; query: string } | null {
		// Search backwards from cursor to find @
		let atIndex = -1;
		for (let i = pos - 1; i >= 0; i--) {
			const char = text[i];
			// Allow alphanumeric, underscore, dot, dash in username
			if (/[a-zA-Z0-9_.-]/.test(char)) {
				continue;
			} else if (char === '@') {
				atIndex = i;
				break;
			} else {
				// Found a non-allowed character before @
				return null;
			}
		}

		if (atIndex === -1) return null;

		// Make sure there's no word character before @ (to avoid matching email@domain.com)
		if (atIndex > 0 && /\w/.test(text[atIndex - 1])) {
			return null;
		}

		const query = text.slice(atIndex + 1, pos);
		return { startIndex: atIndex, query };
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		content = target.value;
		cursorPosition = target.selectionStart;

		const mention = findMentionAtCursor(content, cursorPosition);

		if (mention) {
			mentionStartIndex = mention.startIndex;
			currentMentionText = mention.query.toLowerCase();

			// Filter users based on query
			if (currentMentionText.length > 0) {
				filteredUsers = mentionableUsers.filter(
					(u) =>
						u.mentionUsername.toLowerCase().includes(currentMentionText) ||
						u.displayName.toLowerCase().includes(currentMentionText)
				);
			} else {
				filteredUsers = mentionableUsers.slice(0, 10); // Show first 10 when just @ typed
			}

			showMentionDropdown = filteredUsers.length > 0;
		} else {
			showMentionDropdown = false;
			mentionStartIndex = -1;
			currentMentionText = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showMentionDropdown) return;

		if (event.key === 'Escape') {
			showMentionDropdown = false;
			event.preventDefault();
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
			// Let the dropdown handle navigation
			// The dropdown will handle these via its own listeners
		}
	}

	function selectUser(user: typeof mentionableUsers[0]) {
		// Replace the @mention with the selected username
		const before = content.slice(0, mentionStartIndex);
		const after = content.slice(cursorPosition);
		content = before + '@' + user.mentionUsername + ' ' + after;

		// Move cursor after the inserted mention
		const newPosition = mentionStartIndex + user.mentionUsername.length + 2;

		showMentionDropdown = false;

		// Set cursor position after the inserted text
		setTimeout(() => {
			textareaElement.selectionStart = newPosition;
			textareaElement.selectionEnd = newPosition;
			textareaElement.focus();
		}, 0);
	}

	function insertMention(user: typeof mentionableUsers[0]) {
		selectUser(user);
	}

	// Svelte action for autofocus
	const autofocusAction: Action<HTMLTextAreaElement, boolean> = (node, value) => {
		if (value) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				node.focus();
				// Move cursor to end
				node.selectionStart = node.selectionEnd = node.value.length;
			}, 50);
		}
	};
</script>

<div class="space-y-3">
	<form
		method="POST"
		action="?/addComment"
		use:enhance={({ formElement, formData, action }) => {
			// Add parentId if replying
			if (parentId) {
				formData.append('parentId', parentId);
			}
			return async ({ result, update }) => {
				if (result.type === 'success') {
					content = '';
					showMentionDropdown = false;
				}
				await update();
			};
		}}
	>
		<div class="relative">
			<textarea
				bind:this={textareaElement}
				name="content"
				bind:value={content}
				on:input={handleInput}
				on:keydown={handleKeydown}
				use:autofocusAction={autofocus}
				placeholder={placeholder}
				rows="3"
				class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none"
				required
			></textarea>

			<!-- Character counter -->
			<div class="absolute bottom-2 right-2 text-xs text-spore-steel">
				{remainingChars} remaining
			</div>

			<!-- Mention dropdown -->
			{#if showMentionDropdown}
				<div
					class="absolute z-50 w-full max-w-xs bg-white rounded-lg shadow-lg border border-spore-cream mt-1 max-h-48 overflow-y-auto"
				>
					{#each filteredUsers as user}
						<button
							type="button"
							on:click={() => insertMention(user)}
							class="w-full px-4 py-2 text-left hover:bg-spore-cream/50 transition-colors flex items-center gap-3"
						>
							<div class="w-8 h-8 rounded-full bg-spore-steel/20 flex items-center justify-center text-spore-steel font-bold text-sm">
								{user.displayName
									.split(' ')
									.map((n) => n[0])
									.join('')
									.toUpperCase()
									.slice(0, 2)}
							</div>
							<div>
								<div class="font-semibold text-spore-dark text-sm">{user.displayName}</div>
								<div class="text-xs text-spore-steel">@{user.mentionUsername}</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex gap-3">
			<button
				type="submit"
				disabled={!content.trim() || content.length > MAX_COMMENT_LENGTH}
				class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{submitLabel}
			</button>

			{#if onCancel}
				<button
					type="button"
					on:click={onCancel}
					class="px-6 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors"
				>
					Cancel
				</button>
			{/if}
		</div>
	</form>
</div>
