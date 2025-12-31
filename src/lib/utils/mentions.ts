// Regex pattern to match @mentions: @username (word boundary after username)
const MENTION_PATTERN = /@([a-zA-Z0-9_.-]+)\b/g;

/**
 * Parse mentions from comment content
 * Returns array of username strings that were mentioned
 */
export function parseMentions(content: string): string[] {
	const matches = content.match(MENTION_PATTERN);
	if (!matches) return [];

	// Extract usernames from @username format
	return matches.map((match) => match.slice(1));
}

/**
 * Format username for mention matching
 * Combines first and last name, or uses email
 */
export function formatMentionUsername(user: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}): string {
	const parts = [user.firstName, user.lastName].filter(Boolean);
	if (parts.length > 0) {
		return parts.join('').toLowerCase().replace(/\s+/g, '');
	}
	return user.email.split('@')[0].toLowerCase();
}

/**
 * Parse content and linkify mentions with HTML
 * For display purposes - wraps @mentions in span tags
 *
 * Note: This function is safe for client-side use
 */
export function linkifyMentions(
	content: string,
	mentions: Array<{
		mentionedUser: {
			id: string;
			firstName: string | null;
			lastName: string | null;
			email: string;
		};
	}>
): string {
	if (mentions.length === 0) return content;

	let result = content;

	// Build a map of usernames to user IDs
	const userMap = new Map<string, { id: string; displayName: string }>();
	mentions.forEach((m) => {
		const username = formatMentionUsername(m.mentionedUser);
		userMap.set(username, {
			id: m.mentionedUser.id,
			displayName: m.mentionedUser.firstName
				? [m.mentionedUser.firstName, m.mentionedUser.lastName].filter(Boolean).join(' ')
				: m.mentionedUser.email
		});
	});

	// Replace each @mention with a styled span
	result = result.replace(MENTION_PATTERN, (match, username) => {
		const user = userMap.get(username);
		if (user) {
			return `<span class="mention-highlight" data-user-id="${user.id}">@${username}</span>`;
		}
		return match;
	});

	return result;
}
