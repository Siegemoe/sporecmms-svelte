/** Shared security-related types */

export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';
export type BlockSeverity = 'TEMPORARY' | 'PERSISTENT';

export interface SecurityLog {
	id: string;
	ipAddress: string;
	userAgent?: string | null;
	action: string;
	details?: unknown | null;
	severity: Severity;
	userId?: string | null;
	createdAt: Date;
	user?: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null;
}

export interface IPBlock {
	id: string;
	ipAddress: string;
	reason: string;
	severity: BlockSeverity;
	violationCount: number;
	blockedBy?: string | null;
	blockedAt: Date;
	expiresAt?: Date | null;
	organizationId?: string | null;
	blockedByUser?: {
		id: string;
		firstName: string | null;
		lastName: string | null;
	} | null;
	Organization?: {
		id: string;
		name: string;
	} | null;
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
}

export interface SecurityLogsFilters {
	severity?: string;
	action?: string;
	ipAddress?: string;
	startDate?: string;
	endDate?: string;
}

export interface PaginationState {
	page: number;
	total: number;
	limit: number;
}
