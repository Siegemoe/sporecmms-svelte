import type { Prisma } from '@prisma/client';

// Re-export shared mention utilities
export { parseMentions, formatMentionUsername, linkifyMentions } from '$lib/utils/mentions';

/**
 * Find users by username pattern within an organization
 */
export async function findUsersByUsernamePattern(
	prisma: any,
	pattern: string,
	organizationId: string
) {
	return prisma.user.findMany({
		where: {
			organizationId,
			OR: [
				{ firstName: { contains: pattern, mode: 'insensitive' } },
				{ lastName: { contains: pattern, mode: 'insensitive' } },
				{ email: { contains: pattern, mode: 'insensitive' } }
			]
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		},
		take: 10
	});
}

/**
 * Get mentionable users for an organization (for autocomplete dropdown)
 */
export async function queryMentionableUsers(
	prisma: any,
	organizationId: string
) {
	return prisma.user.findMany({
		where: { organizationId, isActive: true },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		},
		orderBy: { firstName: 'asc' }
	});
}

/**
 * Create mention records for a comment
 */
export async function createMentionRecords(
	prisma: any,
	commentId: string,
	mentionedUserIds: string[]
) {
	if (mentionedUserIds.length === 0) return [];

	// Create mention records in batch
	const data = mentionedUserIds.map((mentionedUserId) => ({
		commentId,
		mentionedUserId
	}));

	return prisma.commentMention.createMany({
		data
	});
}

/**
 * Get users who were mentioned in a comment
 */
export async function queryCommentMentions(
	prisma: any,
	commentId: string
) {
	return prisma.commentMention.findMany({
		where: { commentId },
		include: {
			mentionedUser: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			}
		}
	});
}
