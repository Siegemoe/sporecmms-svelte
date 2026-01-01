export const FAILURE_MODES = [
	'General',
	'Electrical',
	'Plumbing',
	'HVAC',
	'Structural',
	'Safety',
	'Cosmetic',
	'Other'
] as const;

export const WORK_ORDER_STATUSES = [
	'PENDING',
	'IN_PROGRESS',
	'ON_HOLD',
	'COMPLETED',
	'CANCELLED'
] as const;

export const PRIORITIES = [
	'LOW',
	'MEDIUM',
	'HIGH',
	'EMERGENCY'
] as const;

export type FailureMode = typeof FAILURE_MODES[number];
export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];
export type Priority = typeof PRIORITIES[number];

// Work order UI constants
export const DEFAULT_SORT_OPTION = 'dueDate';
export const DEFAULT_PRIORITY = 'MEDIUM';
export const DEFAULT_STATUS = 'PENDING';
export const DEFAULT_SELECTION_MODE = 'asset';

// Priority order for sorting (lower = higher priority)
export const PRIORITY_ORDER: Record<Priority, number> = {
	EMERGENCY: 0,
	HIGH: 1,
	MEDIUM: 2,
	LOW: 3
};

// Color mappings for work orders
export const WORK_ORDER_STATUS_COLORS: Record<string, string> = {
	PENDING: 'bg-spore-steel text-white',
	IN_PROGRESS: 'bg-spore-orange text-white',
	COMPLETED: 'bg-spore-forest text-white',
	ON_HOLD: 'bg-spore-cream text-spore-steel',
	CANCELLED: 'bg-red-600 text-white'
};

/**
 * Get CSS classes for work order status display
 * @param status - The work order status
 * @returns Tailwind CSS classes for status styling
 */
export function getStatusColor(status: string): string {
	return WORK_ORDER_STATUS_COLORS[status] || WORK_ORDER_STATUS_COLORS.PENDING;
}

/**
 * Statuses that require a reason when changing to them
 */
export const STATUSES_REQUIRING_REASON = ['ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;
export type StatusRequiringReason = typeof STATUSES_REQUIRING_REASON[number];

/**
 * Format status for display (replace underscores with spaces)
 * @param status - The status string to format
 * @returns Formatted status string
 */
export function formatStatus(status: string): string {
	return status.replace(/_/g, ' ');
}

export const WORK_ORDER_PRIORITY_COLORS: Record<Priority, string> = {
	LOW: 'bg-gray-100 text-gray-600',
	MEDIUM: 'bg-blue-100 text-blue-600',
	HIGH: 'bg-orange-100 text-orange-600',
	EMERGENCY: 'bg-red-100 text-red-600'
};

// Asset types and statuses
export const ASSET_TYPES = [
	'HVAC',
	'ELECTRICAL',
	'PLUMBING',
	'FIRE_SAFETY',
	'ELEVATOR',
	'SECURITY_SYSTEM',
	'OTHER'
] as const;

export const ASSET_STATUSES = [
	'OPERATIONAL',
	'NEEDS_MAINTENANCE',
	'OUT_OF_SERVICE'
] as const;

export type AssetType = typeof ASSET_TYPES[number];
export type AssetStatus = typeof ASSET_STATUSES[number];

// Color mappings for assets
export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
	OPERATIONAL: 'bg-green-100 text-green-800',
	NEEDS_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
	OUT_OF_SERVICE: 'bg-red-100 text-red-800'
};

// Helper function to format asset status for display
export function formatAssetStatus(status: string): string {
	return status?.replace('_', ' ') || 'Unknown';
}
