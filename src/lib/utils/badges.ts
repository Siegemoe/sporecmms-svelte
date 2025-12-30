/** Shared badge styling utilities */

export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';
export type BlockSeverity = 'TEMPORARY' | 'PERSISTENT';

/**
 * Returns Tailwind classes for role badges
 */
export function getRoleBadgeClasses(role: UserRole): string {
	const baseClasses = 'px-2 py-1 text-xs font-bold uppercase rounded-full border-0 cursor-pointer';
	const colorClasses: Record<UserRole, string> = {
		ADMIN: 'bg-spore-orange text-white',
		MANAGER: 'bg-spore-forest text-white',
		TECHNICIAN: 'bg-spore-steel text-white'
	};
	return `${baseClasses} ${colorClasses[role]}`;
}

/**
 * Returns Tailwind classes for severity badges
 */
export function getSeverityBadgeClasses(severity: Severity): string {
	const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
	const colorClasses: Record<Severity, string> = {
		CRITICAL: 'bg-red-500/20 text-red-400',
		WARNING: 'bg-yellow-500/20 text-yellow-400',
		INFO: 'bg-blue-500/20 text-blue-400'
	};
	return `${baseClasses} ${colorClasses[severity]}`;
}

/**
 * Returns Tailwind classes for block severity badges
 */
export function getBlockSeverityClasses(severity: BlockSeverity): string {
	const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
	const colorClasses: Record<BlockSeverity, string> = {
		PERSISTENT: 'bg-red-500/20 text-red-400',
		TEMPORARY: 'bg-yellow-500/20 text-yellow-400'
	};
	return `${baseClasses} ${colorClasses[severity]}`;
}

/**
 * Format action for display (replace underscores with spaces)
 */
export function formatAction(action: string): string {
	return action.replace(/_/g, ' ');
}

/**
 * Role display name mapping
 */
export const ROLE_NAMES: Record<UserRole, string> = {
	ADMIN: 'Admin',
	MANAGER: 'Manager',
	TECHNICIAN: 'Technician'
} as const;
