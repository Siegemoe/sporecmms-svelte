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
