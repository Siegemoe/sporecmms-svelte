/** Types for breadcrumb system */

export interface BreadcrumbItem {
	title: string;
	href?: string;
	icon?: string;
}

export interface BreadcrumbRoute {
	path: string;
	title: string;
	icon?: string;
	dynamic?: boolean;
	fetchTitle?: (params: Record<string, string>, data: BreadcrumbContextData) => string | Promise<string>;
	parent?: string;
	role?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
}

export interface BreadcrumbConfig {
	excludedPaths: string[];
	routes: BreadcrumbRoute[];
}

export interface BreadcrumbContextData {
	pageData?: any;
	user?: { role?: string } | null;
}
