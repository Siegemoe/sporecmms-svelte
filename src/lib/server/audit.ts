import { getPrisma } from './prisma';
import { SecurityManager } from './security';

type AuditAction = 
	| 'WORK_ORDER_CREATED'
	| 'WORK_ORDER_UPDATED'
	| 'WORK_ORDER_STATUS_CHANGED'
	| 'WORK_ORDER_ASSIGNED'
	| 'WORK_ORDER_DELETED'
	| 'ASSET_CREATED'
	| 'ASSET_UPDATED'
	| 'ASSET_DELETED'
	| 'SITE_CREATED'
	| 'SITE_UPDATED'
	| 'SITE_DELETED'
	| 'ROOM_CREATED'
	| 'ROOM_UPDATED'
	| 'ROOM_DELETED'
	| 'USER_CREATED'
	| 'USER_UPDATED'
	| 'USER_ROLE_CHANGED'
	| 'USER_DELETED';

interface AuditDetails extends Record<string, unknown> {}

export async function logAudit(
	userId: string,
	action: AuditAction,
	details?: AuditDetails
): Promise<void> {
	try {
		const client = await getPrisma();

		// Log to audit table
		await client.auditLog.create({
			data: {
				userId,
				action,
				details: details as any
			}
		});

		// Also log to security logs for privileged actions
		const security = SecurityManager.getInstance();
		const privilegedActions: AuditAction[] = [
			'USER_CREATED',
			'USER_UPDATED',
			'USER_ROLE_CHANGED',
			'USER_DELETED',
			'WORK_ORDER_DELETED',
			'ASSET_DELETED',
			'SITE_DELETED',
			'ROOM_DELETED'
		];

		if (privilegedActions.includes(action)) {
			await security.logSecurityEvent({
				action: `PRIVILEGED_ACTION: ${action}`,
				details: {
					auditAction: action,
					auditDetails: details
				},
				severity: 'WARNING',
				userId
			});
		}
	} catch (e) {
		// Don't let audit logging failures break the app
		console.error('Audit log failed:', e);
	}
}
