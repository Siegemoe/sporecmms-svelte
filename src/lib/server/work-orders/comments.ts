import type { Prisma, WorkOrderStatus } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { logAudit } from '$lib/server/audit';
import type { RequestPrisma } from '$lib/types/prisma';
import { MAX_COMMENT_DEPTH, MAX_COMMENT_LENGTH } from '$lib/constants/limits';
import { formatUserName } from '$lib/utils/user';
import { logError } from '$lib/server/logger';
import { parseMentions, findUsersByUsernamePattern, createMentionRecords } from './mentions';

/**
 * Type for comment user with display fields
 */
interface CommentUser {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

/**
 * Type for comment mention
 */
interface CommentMention {
	id: string;
	mentionedUser: CommentUser;
}

/**
 * Type for enriched comment with replies
 */
interface EnrichedComment {
	id: string;
	parentId: string | null;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	isEdited: boolean;
	editedAt: Date | null;
	isDeleted: boolean;
	user: CommentUser & { displayName: string };
	mentions: CommentMention[];
	replies: EnrichedComment[];
	depth: number;
}

/**
 * Query all comments for a work order with nested replies
 */
export async function queryComments(prisma: RequestPrisma, workOrderId: string): Promise<EnrichedComment[]> {
	const comments = await prisma.workOrderComment.findMany({
		where: {
			workOrderId,
			isDeleted: false
		},
		select: {
			id: true,
			parentId: true,
			content: true,
			createdAt: true,
			updatedAt: true,
			isEdited: true,
			editedAt: true,
			isDeleted: true,
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			},
			mentions: {
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
			}
		},
		orderBy: { createdAt: 'asc' }
	});

	// Build nested structure
	return buildCommentTree(comments);
}

/**
 * Build a nested tree structure from flat comments
 */
function buildCommentTree(
	comments: Array<{
		id: string;
		parentId: string | null;
		content: string;
		createdAt: Date;
		updatedAt: Date;
		isEdited: boolean;
		editedAt: Date | null;
		isDeleted: boolean;
		user: CommentUser;
		mentions: CommentMention[];
	}>
): EnrichedComment[] {
	const commentMap = new Map<string, EnrichedComment>();
	const rootComments: EnrichedComment[] = [];

	// First pass: create map and identify root comments
	comments.forEach((comment) => {
		const enriched: EnrichedComment = {
			...comment,
			user: {
				...comment.user,
				displayName: formatUserName(comment.user)
			},
			replies: [],
			depth: 0
		};
		commentMap.set(comment.id, enriched);

		if (!comment.parentId) {
			rootComments.push(enriched);
		}
	});

	// Second pass: attach children to parents
	comments.forEach((comment) => {
		if (comment.parentId) {
			const parent = commentMap.get(comment.parentId);
			const child = commentMap.get(comment.id);
			if (parent && child) {
				parent.replies.push(child);
			}
		}
	});

	// Calculate depth for each comment
	function calculateDepth(comment: EnrichedComment, currentDepth: number = 0) {
		comment.depth = currentDepth;
		comment.replies.forEach((reply) => calculateDepth(reply, currentDepth + 1));
	}

	rootComments.forEach((comment) => calculateDepth(comment));

	return rootComments;
}

/**
 * Create a new comment
 */
export async function createComment(
	event: RequestEvent,
	prisma: RequestPrisma,
	data: {
		workOrderId: string;
		content: string;
		userId: string;
		parentId?: string;
	}
) {
	const { workOrderId, content, userId, parentId } = data;

	// Validate content
	if (!content?.trim()) {
		return fail(400, { error: 'Comment cannot be empty.' });
	}

	if (content.length > MAX_COMMENT_LENGTH) {
		return fail(400, { error: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` });
	}

	// Check parent exists and depth limit
	if (parentId) {
		const parentComment = await prisma.workOrderComment.findUnique({
			where: { id: parentId },
			include: { workOrder: true }
		});

		if (!parentComment) {
			return fail(404, { error: 'Parent comment not found.' });
		}

		if (parentComment.workOrderId !== workOrderId) {
			return fail(400, { error: 'Parent comment belongs to a different work order.' });
		}

		// Check depth limit
		const depth = await getCommentDepth(prisma, parentId);
		if (depth >= MAX_COMMENT_DEPTH) {
			return fail(400, { error: `Maximum reply depth (${MAX_COMMENT_DEPTH}) reached.` });
		}
	}

	// Verify work order exists and user has access
	const workOrder = await prisma.workOrder.findUnique({
		where: { id: workOrderId },
		select: { organizationId: true }
	});

	if (!workOrder) {
		return fail(404, { error: 'Work order not found.' });
	}

	// Verify user is in same organization
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { organizationId: true }
	});

	if (!user || user.organizationId !== workOrder.organizationId) {
		return fail(403, { error: 'You do not have permission to comment on this work order.' });
	}

	try {
		// Create the comment
		const comment = await prisma.workOrderComment.create({
			data: {
				content: content.trim(),
				workOrderId,
				userId,
				parentId: parentId || null
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		// Parse and create mentions
		const mentionedUsernames = parseMentions(content);
		if (mentionedUsernames.length > 0) {
			const mentionedUsers = await findUsersByUsernamePattern(
				prisma,
				// Use first username as hint (could improve to match all)
				mentionedUsernames[0],
				workOrder.organizationId
			);

			// Filter to exact matches based on our username format
			const matchedUsers = mentionedUsers.filter((u: any) => {
				const username = [u.firstName, u.lastName].filter(Boolean).join('').toLowerCase().replace(/\s+/g, '');
				return mentionedUsernames.includes(username);
			});

			if (matchedUsers.length > 0) {
				await createMentionRecords(
					prisma,
					comment.id,
					matchedUsers.map((u: any) => u.id)
				);
			}
		}

		// Broadcast to organization
		broadcastToOrg(workOrder.organizationId, {
			type: 'WO_COMMENT_ADDED',
			payload: {
				workOrderId,
				commentId: comment.id,
				comment: {
					id: comment.id,
					content: comment.content,
					createdAt: comment.createdAt,
					userId: comment.userId,
					userName: formatUserName(comment.user),
					parentId: comment.parentId
				}
			}
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_COMMENT_ADDED', {
			workOrderId,
			commentId: comment.id,
			hasParent: !!comment.parentId
		});

		return { success: true, comment };
	} catch (e) {
		logError('Error creating comment', e, { workOrderId });
		return fail(500, { error: 'Failed to create comment.' });
	}
}

/**
 * Calculate the depth of a comment in the reply tree
 */
async function getCommentDepth(prisma: RequestPrisma, commentId: string): Promise<number> {
	let depth = 0;
	let currentId = commentId;

	while (currentId) {
		const comment = await prisma.workOrderComment.findUnique({
			where: { id: currentId },
			select: { parentId: true }
		});
		if (!comment) break;
		if (!comment.parentId) break;
		depth++;
		currentId = comment.parentId;
	}

	return depth;
}

/**
 * Update a comment (with edit tracking)
 */
export async function updateComment(
	event: RequestEvent,
	prisma: RequestPrisma,
	commentId: string,
	userId: string,
	newContent: string
) {
	// Validate content
	if (!newContent?.trim()) {
		return fail(400, { error: 'Comment cannot be empty.' });
	}

	if (newContent.length > MAX_COMMENT_LENGTH) {
		return fail(400, { error: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` });
	}

	// Get existing comment
	const existingComment = await prisma.workOrderComment.findUnique({
		where: { id: commentId },
		include: { workOrder: true }
	});

	if (!existingComment) {
		return fail(404, { error: 'Comment not found.' });
	}

	// Check ownership
	if (existingComment.userId !== userId) {
		return fail(403, { error: 'You can only edit your own comments.' });
	}

	if (existingComment.isDeleted) {
		return fail(400, { error: 'Cannot edit a deleted comment.' });
	}

	try {
		// Save previous content to edit history
		await prisma.commentEdit.create({
			data: {
				content: existingComment.content,
				commentId,
				userId
			}
		});

		// Update the comment
		const updated = await prisma.workOrderComment.update({
			where: { id: commentId },
			data: {
				content: newContent.trim(),
				isEdited: true,
				editedAt: new Date()
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		// Re-process mentions (delete old, create new)
		await prisma.commentMention.deleteMany({
			where: { commentId }
		});

		const mentionedUsernames = parseMentions(newContent);
		if (mentionedUsernames.length > 0) {
			const matchedUsers = await findUsersByUsernamePattern(
				prisma,
				mentionedUsernames[0],
				existingComment.workOrder.organizationId
			);

			const exactMatches = matchedUsers.filter((u: any) => {
				const username = [u.firstName, u.lastName].filter(Boolean).join('').toLowerCase().replace(/\s+/g, '');
				return mentionedUsernames.includes(username);
			});

			if (exactMatches.length > 0) {
				await createMentionRecords(
					prisma,
					commentId,
					exactMatches.map((u: any) => u.id)
				);
			}
		}

		// Broadcast update
		broadcastToOrg(existingComment.workOrder.organizationId, {
			type: 'WO_COMMENT_UPDATED',
			payload: {
				workOrderId: existingComment.workOrderId,
				commentId,
				content: newContent.trim()
			}
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_COMMENT_EDITED', {
			workOrderId: existingComment.workOrderId,
			commentId
		});

		return { success: true, comment: updated };
	} catch (e) {
		logError('Error updating comment', e, { commentId });
		return fail(500, { error: 'Failed to update comment.' });
	}
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
	event: RequestEvent,
	prisma: RequestPrisma,
	commentId: string,
	userId: string
) {
	// Get existing comment
	const existingComment = await prisma.workOrderComment.findUnique({
		where: { id: commentId },
		include: { workOrder: true }
	});

	if (!existingComment) {
		return fail(404, { error: 'Comment not found.' });
	}

	// Check ownership
	if (existingComment.userId !== userId) {
		return fail(403, { error: 'You can only delete your own comments.' });
	}

	if (existingComment.isDeleted) {
		return fail(400, { error: 'Comment is already deleted.' });
	}

	try {
		// Soft delete
		await prisma.workOrderComment.update({
			where: { id: commentId },
			data: {
				isDeleted: true,
				content: '[deleted]'
			}
		});

		// Broadcast delete
		broadcastToOrg(existingComment.workOrder.organizationId, {
			type: 'WO_COMMENT_DELETED',
			payload: {
				workOrderId: existingComment.workOrderId,
				commentId
			}
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_COMMENT_DELETED', {
			workOrderId: existingComment.workOrderId,
			commentId,
			hadReplies: true // Could check, but not necessary for audit
		});

		return { success: true };
	} catch (e) {
		logError('Error deleting comment', e, { commentId });
		return fail(500, { error: 'Failed to delete comment.' });
	}
}

/**
 * Get comment edit history
 */
export async function queryCommentEdits(prisma: RequestPrisma, commentId: string) {
	return prisma.commentEdit.findMany({
		where: { commentId },
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			}
		},
		orderBy: { editedAt: 'desc' }
	});
}
