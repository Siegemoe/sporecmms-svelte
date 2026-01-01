/**
 * Format a user's name for display
 * Returns "First Last" if available, otherwise falls back to email
 *
 * @param user - User object with firstName, lastName, and email
 * @returns Formatted display name
 */
export function formatUserName(user: {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
}): string {
	if (user.firstName || user.lastName) {
		return [user.firstName, user.lastName].filter(Boolean).join(' ');
	}
	return user.email || 'Unknown';
}
