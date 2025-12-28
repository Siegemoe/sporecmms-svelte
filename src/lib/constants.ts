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
	PENDING: 'bg-yellow-100 text-yellow-800',
	IN_PROGRESS: 'bg-blue-100 text-blue-800',
	COMPLETED: 'bg-green-100 text-green-800',
	ON_HOLD: 'bg-gray-100 text-gray-800',
	CANCELLED: 'bg-red-100 text-red-800'
};

export const WORK_ORDER_PRIORITY_COLORS: Record<Priority, string> = {
	LOW: 'bg-gray-100 text-gray-600',
	MEDIUM: 'bg-blue-100 text-blue-600',
	HIGH: 'bg-orange-100 text-orange-600',
	EMERGENCY: 'bg-red-100 text-red-600'
};
